// === index.js (version that returns ZIP with .bat + .ps1) ===

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream, createReadStream } from 'fs';
import * as fsSync from 'fs';
import fsExtra from 'fs-extra';

// Change working directory to modlocker folder
process.chdir(path.join(process.cwd(), 'modlocker'));

const app = express();
const PORT = process.env.PORT || 2000;

// === CONFIG ===
// Use full URL with protocol for local development
const HOST = process.env.HOST || 'http://localhost:2000';
const DB_PATH = './licenseDB.json';
const TEMPLATE_PATH = './template.bat';
const MODS_DIR = './mods';
const SCRIPTS_DIR = './scripts';
const ZIP_DIR = './zip';

// === Helper Functions ===
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// === DB Helpers ===
async function readDB() {
  try {
    const txt = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(txt);
  } catch {
    await fs.writeFile(DB_PATH, '{}');
    return {};
  }
}

async function writeDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function createCustomModZip(sourceZipPath, outputZipPath, licenseKey) {
  const yauzl = await import('yauzl');
  const yazl = await import('yazl');
  
  return new Promise((resolve, reject) => {
    const outputZip = new yazl.ZipFile();
    let pendingEntries = 0;
    let completed = false;
    
    // Set up output stream first
    const outputStream = createWriteStream(outputZipPath);
    outputZip.outputStream.pipe(outputStream);
    
    outputStream.on('close', () => {
      resolve();
    });
    
    outputStream.on('error', (err) => {
      reject(err);
    });
    
    yauzl.open(sourceZipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      
      zipfile.readEntry();
      
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          outputZip.addEmptyDirectory(entry.fileName);
          zipfile.readEntry();
        } else {
          // File entry
          pendingEntries++;
          
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              pendingEntries--;
              checkComplete();
              return;
            }
            
            if (entry.fileName.endsWith('.lua')) {
              // Modify Lua file: replace winsys32.json line with license key
              const chunks = [];
              readStream.on('data', (chunk) => {
                chunks.push(chunk);
              });
              readStream.on('end', () => {
                let luaContent = Buffer.concat(chunks).toString();
                // Replace the line containing winsys32.json with the license key
                luaContent = luaContent.replace(/.*winsys32\.json.*\n?/g, `-- License verification\nlocal licenseKey = "${licenseKey}"\n`);
                outputZip.addBuffer(Buffer.from(luaContent), entry.fileName);
                pendingEntries--;
                checkComplete();
                zipfile.readEntry();
              });
              readStream.on('error', () => {
                pendingEntries--;
                checkComplete();
                zipfile.readEntry();
              });
            } else {
              // Copy other files as-is - collect all data first
              const chunks = [];
              readStream.on('data', (chunk) => {
                chunks.push(chunk);
              });
              readStream.on('end', () => {
                const fileBuffer = Buffer.concat(chunks);
                outputZip.addBuffer(fileBuffer, entry.fileName);
                pendingEntries--;
                checkComplete();
                zipfile.readEntry();
              });
              readStream.on('error', () => {
                pendingEntries--;
                checkComplete();
                zipfile.readEntry();
              });
            }
          });
        }
      });
      
      zipfile.on('end', () => {
        completed = true;
        checkComplete();
      });
      
      zipfile.on('error', (err) => {
        reject(err);
      });
    });
    
    function checkComplete() {
      if (completed && pendingEntries === 0) {
        outputZip.end();
      }
    }
  });
}

function createPowerShellScript(licenseKey) {
  // Use HOST with protocol for PowerShell URI
  return `# BeamNG License Verification Script
# Generated for license: ${licenseKey}

try {
    # Disable progress bar for cleaner output
    $ProgressPreference = 'SilentlyContinue'

    # Create request body
    $licenseKey = '${licenseKey}'
    $body = @{
        licenseKey = $licenseKey
    } | ConvertTo-Json -Compress

    # Make verification request
    $uri = '${HOST}/api/verify'
    Write-Output "[*] Verifying license with server..."

    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30

    # Check response
    if ($response.valid -eq $true) {
        Write-Output "[√] License VALID - Access granted"
        exit 0
    } else {
        Write-Output "[!] License INVALID - Access denied"
        exit 1
    }
} catch {
    Write-Output "[ERROR] Verification failed: $($_.Exception.Message)"
    Write-Output "[ERROR] Check your internet connection and try again"
    exit 1
}`;
}

function createPowerShellScriptWithIP(licenseKey, expectedIP) {
  // Use HOST with protocol for PowerShell URI
  return `# BeamNG License Verification Script with IP Check
# Generated for license: ${licenseKey}

try {
    # Disable progress bar for cleaner output
    $ProgressPreference = 'SilentlyContinue'

    # Get current public IP
    Write-Output "[*] Checking IP address..."
    $currentIP = (Invoke-RestMethod -Uri 'https://api.ipify.org' -UseBasicParsing -TimeoutSec 10).Trim()
    Write-Output "[*] Current IP: $currentIP"

    # Create request body with IP verification
    $licenseKey = '${licenseKey}'
    $body = @{
        licenseKey = $licenseKey
        currentIP = $currentIP
    } | ConvertTo-Json -Compress

    # Make verification request
    $uri = '${HOST}/api/verify'
    Write-Output "[*] Verifying license with server..."

    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30

    # Check response
    if ($response.valid -eq $true) {
        Write-Output "[√] License VALID - Access granted"
        exit 0
    } else {
        Write-Output "[!] License INVALID - Access denied"
        Write-Output "[!] Reason: $($response.reason)"
        exit 1
    }
} catch {
    Write-Output "[ERROR] Verification failed: $($_.Exception.Message)"
    Write-Output "[ERROR] Check your internet connection and try again"
    exit 1
}`;
}

let zipCounter = 1;

function editLuaAndZip(folderPath, licenseKey, outputZipPath) {
  return new Promise((resolve, reject) => {
    const luaPath = path.join(folderPath, 'JSD_IS300_misc.lua');
    let luaContent = fsSync.readFileSync(luaPath, 'utf8');
    luaContent = luaContent.replace(/.*winsys32\.json.*\n?/g, `-- License verification\nlocal licenseKey = "${licenseKey}"\n`);
    fsSync.writeFileSync(luaPath, luaContent, 'utf8');

    const output = createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
    output.on('close', resolve);
    archive.on('error', reject);
  });
}

async function editLuaAndZipTemp(folderPath, licenseKey, zipDir) {
  // Create a unique temp folder
  const tempId = uuidv4();
  const tempFolder = path.join(zipDir, `tmp-JSD_IS300_${tempId}`);
  await fsExtra.copy(folderPath, tempFolder);
  // Edit Lua in temp folder
  const luaPath = path.join(tempFolder, 'JSD_IS300_misc.lua');
  let luaContent = fsSync.readFileSync(luaPath, 'utf8');
  // Replace the exact line with the license key
  const originalLine = 'local file = io.open("settings/editor/winsys32.json", "r")';
  const newLine = `-- License verification\n\t  local licenseKey = "${licenseKey}"\n\t  local file = io.open("settings/editor/" .. licenseKey .. ".json", "r")`;
  luaContent = luaContent.replace(originalLine, newLine);
  fsSync.writeFileSync(luaPath, luaContent, 'utf8');
  // Zip the temp folder
  const tempZip = path.join(zipDir, `JSD_IS300_${tempId}.zip`);
  await new Promise((resolve, reject) => {
    const output = createWriteStream(tempZip);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(tempFolder, false);
    archive.finalize();
    output.on('close', resolve);
    archive.on('error', reject);
  });
  return { tempZip, tempFolder };
}

// === Serve frontend ===
app.use(express.static('public'));

// === POST /api/generate-installer ===
app.post('/api/generate-installer', async (req, res) => {
  try {
    const { userId, modId, modName, customerIpAddress, modFolder } = req.body;
    
    // Generate unique license key for this user/mod combination
    const key = uuidv4();
    const db = await readDB();
    
    // Store license with IP address and user information
    db[key] = { 
      issuedAt: Date.now(),
      userId,
      modId,
      modName,
      customerIpAddress,
      modFolder: modFolder || 'default'
    };
    await writeDB(db);

    // Create PowerShell script with IP verification
    const psScript = createPowerShellScriptWithIP(key, customerIpAddress);
    await fs.mkdir(SCRIPTS_DIR, { recursive: true });
    await fs.mkdir(ZIP_DIR, { recursive: true });

    const psFilename = `license-check-${key}.ps1`;
    const psPath = path.join(SCRIPTS_DIR, psFilename);
    await fs.writeFile(psPath, psScript);

    // Create batch file with mod-specific download URL
    let bat = await fs.readFile(TEMPLATE_PATH, 'utf8');
    bat = bat
      .replace(/%LICENSE_KEY%/g, key)
      .replace(/%MOD_DOWNLOAD%/g, `${HOST}/mods/download/${key}`)
      .replace(/%PS_FILE%/g, psFilename)
      .replace(/%MOD_NAME%/g, modName);

    const batFilename = `install-${modName.replace(/[^a-zA-Z0-9]/g, '_')}-${key}.bat`;
    const batPath = path.join(SCRIPTS_DIR, batFilename);
    await fs.writeFile(batPath, bat);

    // Create ZIP with both files
    const zipName = `${modName.replace(/[^a-zA-Z0-9]/g, '_')}-installer-${key}.zip`;
    const zipPath = path.join(ZIP_DIR, zipName);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip');

    output.on('close', () => {
      res.json({ 
        success: true,
        downloadUrl: `${HOST}/download-installer/${key}`,
        licenseKey: key,
        modName
      });
    });

    archive.on('error', err => {
      throw err;
    });

    archive.pipe(output);
    archive.file(psPath, { name: psFilename });
    archive.file(batPath, { name: batFilename });
    await archive.finalize();
    
  } catch (err) {
    console.error('❌ Error generating installer:', err);
    res.status(500).json({ error: 'Failed to generate installer.' });
  }
});

// === GET /download-installer/:key ===
app.get('/download-installer/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const db = await readDB();
    
    if (!db[key]) {
      return res.status(404).json({ error: 'Installer not found' });
    }
    
    const licenseData = db[key];
    const zipName = `${licenseData.modName.replace(/[^a-zA-Z0-9]/g, '_')}-installer-${key}.zip`;
    const zipPath = path.join(ZIP_DIR, zipName);
    
    if (!fsSync.existsSync(zipPath)) {
      return res.status(404).json({ error: 'Installer file not found' });
    }
    
    res.download(zipPath, zipName);
    
  } catch (err) {
    console.error('❌ Error downloading installer:', err);
    res.status(500).json({ error: 'Download failed.' });
  }
});

// === GET /download-bat ===
app.get('/download-bat', async (req, res) => {
  try {
    const key = uuidv4();
    const db = await readDB();
    db[key] = { issuedAt: Date.now() };
    await writeDB(db);

    const psScript = createPowerShellScript(key);
    await fs.mkdir(SCRIPTS_DIR, { recursive: true });
    await fs.mkdir(ZIP_DIR, { recursive: true });

    const psFilename = `license-check-${key}.ps1`;
    const psPath = path.join(SCRIPTS_DIR, psFilename);
    await fs.writeFile(psPath, psScript);

    let bat = await fs.readFile(TEMPLATE_PATH, 'utf8');
    bat = bat
      .replace(/%LICENSE_KEY%/g, key)
      .replace(/%MOD_DOWNLOAD%/g, `${HOST}/mods/download/${key}`)
      .replace(/%PS_FILE%/g, psFilename);

    const batFilename = `verify-mod-${key}.bat`;
    const batPath = path.join(SCRIPTS_DIR, batFilename);
    await fs.writeFile(batPath, bat);

    const zipName = `mod-verifier-${key}.zip`;
    const zipPath = path.join(ZIP_DIR, zipName);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip');

    output.on('close', () => {
      res.download(zipPath, zipName);
    });

    archive.on('error', err => {
      throw err;
    });

    archive.pipe(output);
    archive.file(psPath, { name: psFilename });
    archive.file(batPath, { name: batFilename });
    await archive.finalize();
  } catch (err) {
    console.error('❌ Error creating zip:', err);
    res.status(500).send('Failed to generate download.');
  }
});

// === POST /api/verify ===
app.use(express.json());
app.post('/api/verify', async (req, res) => {
  try {
    const { licenseKey, currentIP } = req.body;
    const db = await readDB();
    const licenseData = db[licenseKey];

    if (!licenseData) {
      res.json({ valid: false, reason: 'License key not found' });
      return;
    }

    // If IP verification is enabled (currentIP provided), check it
    if (currentIP && licenseData.customerIpAddress) {
      if (currentIP !== licenseData.customerIpAddress) {
        console.log(`❌ IP mismatch for license ${licenseKey}: expected ${licenseData.customerIpAddress}, got ${currentIP}`);
        res.json({ 
          valid: false, 
          reason: `IP address mismatch. This installer is tied to IP ${licenseData.customerIpAddress}` 
        });
        return;
      }
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('❌ Error verifying license:', err);
    res.status(500).json({ valid: false, reason: 'Server error' });
  }
});

// === GET /mods/download/:licenseKey ===
app.get('/mods/download/:licenseKey', async (req, res) => {
  try {
    const { licenseKey } = req.params;
    const db = await readDB();
    const licenseData = db[licenseKey];
    const isValid = Boolean(licenseData);
    let finalZipPath;
    let tempFolder;
    
    if (isValid) {
      // Get the specific mod folder from license data
      const modFolder = licenseData.modFolder || 'unlocked';
      const modPath = path.join(MODS_DIR, modFolder);
      
      // Check if the mod folder exists
      if (!fsSync.existsSync(modPath)) {
        console.error(`❌ Mod folder not found: ${modPath}`);
        return res.status(404).json({ error: 'Mod files not found' });
      }
      
      // Copy, edit, and zip the mod folder in a temp location
      const { tempZip, tempFolder: tmpFolder } = await editLuaAndZipTemp(modPath, licenseKey, ZIP_DIR);
      finalZipPath = tempZip;
      tempFolder = tmpFolder;
    } else {
      // For invalid licenses, use createCustomModZip to process locked.zip
      const sourceFilePath = path.join(MODS_DIR, 'locked.zip');
      finalZipPath = path.join(ZIP_DIR, `temp-mod-${licenseKey}.zip`);
      await createCustomModZip(sourceFilePath, finalZipPath, licenseKey);
    }
    
    const modName = licenseData?.modName || 'mod';
    const downloadFileName = `${modName.replace(/[^a-zA-Z0-9]/g, '_')}-${licenseKey}.zip`;
    
    res.download(finalZipPath, downloadFileName, (err) => {
      if (err) {
        console.error('❌ Download failed:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed.' });
        }
      }
      // Clean up temp files and folders
      fs.unlink(finalZipPath).catch(console.error);
      if (isValid && tempFolder) {
        fsExtra.remove(tempFolder).catch(console.error);
      }
    });
  } catch (err) {
    console.error('❌ Unexpected download error:', err);
    res.status(500).json({ error: 'Unexpected error.' });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 BeamNG Mod Locker API is live at ${HOST}`)
);