# Complete IP-Based Mod Locker Integration

## System Overview

This integration creates a sophisticated mod distribution system that ties mod downloads to specific IP addresses and purchase records. When customers purchase mods, they receive custom installers that only work from their original IP address.

## How It Works

### 1. **Purchase Flow with IP Tracking**
- Customer purchases mod on the main site
- System captures customer's IP address during checkout
- Purchase record stored with IP address in database
- Customer can access their purchased mods in the mod locker

### 2. **Installer Generation**
- Customer clicks "Download" in their mod locker
- System calls `/api/mod-locker/generate-installer` with mod ID
- Generates unique license key tied to customer's purchase IP
- Creates custom installer (.bat + .ps1) with embedded license
- Downloads installer as ZIP file

### 3. **IP Verification Process**
- Customer runs installer on their machine
- PowerShell script checks current public IP via ipify.org
- Compares current IP to original purchase IP
- Only allows download if IPs match
- Creates license file in BeamNG's AppData directory

### 4. **Mod Distribution**
- If IP matches: Downloads from specific mod folder (e.g., `JSD_IS300/`)
- If IP doesn't match: Downloads locked version with limited functionality
- License key is injected into mod's Lua code for runtime verification

## Technical Architecture

### Main Site Components
- **Route**: `/api/mod-locker/generate-installer` - Creates installers for purchased mods
- **Database**: Added `lockerFolder` field to mods table
- **Admin Panel**: Mod management includes locker folder setting
- **Mod Locker Page**: Updated to generate installers instead of direct downloads

### Mod Locker Service Components
- **Route**: `/api/generate-installer` - Creates custom installers
- **Route**: `/api/verify` - Verifies license and IP
- **Route**: `/download-installer/:key` - Downloads installer ZIP
- **Route**: `/mods/download/:licenseKey` - Downloads actual mod files

### File Structure
```
modlocker/
  mods/
    locked.zip              # Default locked version
    unlocked/               # Default unlocked folder
    JSD_IS300/              # Custom mod folder
    my-mod-v2/              # Another mod folder
    └── JSD_IS300_misc.lua  # Lua file with protection
  scripts/                  # Generated PowerShell/batch files
  zip/                      # Generated installer archives
  licenseDB.json           # License key database
```

## Security Features

### 1. **IP Address Locking**
- Each installer is tied to the original purchase IP
- PowerShell script validates current IP against purchase IP
- Prevents sharing installers between different users/locations

### 2. **Unique License Keys**
- Each purchase gets a UUID v4 license key
- License embedded in mod's Lua code
- Prevents simple file sharing

### 3. **Runtime Verification**
- Lua code checks for specific license file
- License file created only after IP verification
- Mod functionality disabled without valid license

### 4. **Encrypted Communication**
- HTTPS for all API calls
- Secure PowerShell requests to verification server
- Tamper-resistant batch files

## Admin Features

### 1. **Mod Folder Management**
- Set custom folder names for each mod in admin panel
- Organize different mod versions/types
- Easy mapping of database mods to file system folders

### 2. **Purchase Tracking**
- View all orders with IP addresses
- Track which customers downloaded which mods
- Monitor license usage and potential abuse

### 3. **Flexible Mod Organization**
- Support for multiple mod folders per product
- Version-specific folders (e.g., `mod-v1/`, `mod-v2/`)
- Category-based organization

## Customer Experience

### 1. **Simple Download Process**
1. Purchase mod on website
2. Go to mod locker page
3. Click "Download" for purchased mod
4. Receive custom installer ZIP
5. Run installer to get mod files

### 2. **Automatic Verification**
- Installer handles all verification automatically
- Clear error messages if IP doesn't match
- Detailed logs for troubleshooting

### 3. **Seamless Integration**
- Works with existing BeamNG.drive folder structure
- Compatible with existing mod installation workflow
- No additional software or setup required

## Development Setup

### 1. **Environment Variables**
```bash
# Add to .env
MOD_LOCKER_URL=http://localhost:3000
MOD_LOCKER_ENABLED=true
```

### 2. **Running Both Services**
```bash
# Install dependencies
npm install
cd modlocker && npm install && cd ..

# Run both services
npm run dev:all
```

### 3. **Database Migration**
```bash
# Add lockerFolder column to mods table
npm run db:push
```

## API Endpoints

### Main Site
- `POST /api/mod-locker/generate-installer` - Generate custom installer
- `POST /api/purchase/complete` - Complete purchase (captures IP)
- `GET /api/purchases` - Get user's purchases

### Mod Locker Service
- `POST /api/generate-installer` - Create installer files
- `GET /download-installer/:key` - Download installer ZIP
- `POST /api/verify` - Verify license and IP
- `GET /mods/download/:licenseKey` - Download mod files

## Configuration Options

### Mod Folder Mapping
- Set in admin panel when creating/editing mods
- Maps database mod to file system folder
- Supports custom naming conventions

### IP Verification Settings
- Strict mode: Exact IP match required
- Flexible mode: Allow subnet changes (future feature)
- Disabled: Skip IP verification (testing only)

## Security Considerations

### Strengths
- IP-based protection prevents most casual sharing
- Unique licenses make mass distribution difficult
- Runtime verification adds extra protection layer
- Server-side validation prevents client-side bypasses

### Limitations
- VPN users may have issues with changing IPs
- Advanced users could potentially bypass client-side checks
- Shared networks (cafes, offices) may cause problems

### Recommendations
- Monitor for suspicious license usage patterns
- Implement rate limiting on verification endpoints
- Consider time-based license expiration
- Add customer support for legitimate IP change requests

## Deployment

### Production Setup
1. Set up mod locker service on separate server/port
2. Configure proper HTTPS certificates
3. Set production MOD_LOCKER_URL in environment
4. Organize mod folders on file system
5. Test installer generation and verification

### Monitoring
- Track license verification attempts
- Monitor download patterns for abuse
- Log IP mismatches for customer support
- Automated alerts for unusual activity

This system provides a robust, secure, and user-friendly solution for distributing premium mods while protecting against unauthorized sharing and piracy.
