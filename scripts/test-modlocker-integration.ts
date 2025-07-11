import { db } from "../server/db";
import { storage } from "../server/storage";

async function testModlockerIntegration() {
  console.log("Testing modlocker integration...");
  
  // Get a test mod
  const mods = await storage.getMods();
  console.log(`Found ${mods.length} mods`);
  
  if (mods.length === 0) {
    console.log("No mods found for testing");
    return;
  }
  
  const testMod = mods[0];
  console.log(`Test mod: ${testMod.title} (ID: ${testMod.id})`);
  console.log(`Locker folder: ${testMod.lockerFolder}`);
  
  // Check if mod has a locker folder set
  if (!testMod.lockerFolder) {
    console.log("Test mod does not have a locker folder set");
    
    // Update the mod to have a locker folder
    await storage.updateMod(testMod.id, {
      lockerFolder: 'JSD_IS300'
    });
    
    console.log("Updated mod to use JSD_IS300 locker folder");
  }
  
  // Check if the locker folder exists
  const fs = await import('fs');
  const path = await import('path');
  
  const modlockerPath = path.join(process.cwd(), "modlocker", "mods", testMod.lockerFolder || 'JSD_IS300');
  
  if (fs.existsSync(modlockerPath)) {
    console.log(`✓ Modlocker folder exists: ${modlockerPath}`);
    
    // List contents
    const contents = fs.readdirSync(modlockerPath);
    console.log(`Folder contents: ${contents.join(', ')}`);
  } else {
    console.log(`✗ Modlocker folder does not exist: ${modlockerPath}`);
  }
  
  // Check current license database
  const licenseDBPath = path.join(process.cwd(), "modlocker", "licenseDB.json");
  
  if (fs.existsSync(licenseDBPath)) {
    const licenseDB = JSON.parse(fs.readFileSync(licenseDBPath, 'utf8'));
    const licenseCount = Object.keys(licenseDB).length;
    console.log(`Current license database has ${licenseCount} entries`);
    
    // Show a sample license
    const sampleKey = Object.keys(licenseDB)[0];
    if (sampleKey) {
      console.log(`Sample license:`, licenseDB[sampleKey]);
    }
  } else {
    console.log("License database does not exist");
  }
}

testModlockerIntegration().catch(console.error);
