# Mod Locker Folder Structure

The mod locker now supports multiple mod folders. Here's how to organize your mods:

## Folder Structure
```
modlocker/
  mods/
    locked.zip          # Default locked version (for invalid licenses)
    unlocked/           # Default unlocked folder
    JSD_IS300/          # Specific mod folder (set in admin panel)
    my-custom-mod/      # Another mod folder
    mod-pack-v1/        # Version-specific folder
    ...
```

## How It Works

1. **Admin Panel**: When creating/editing a mod in the admin panel, set the "Mod Locker Folder" field to specify which folder this mod should use.

2. **License Generation**: When a user purchases a mod and requests an installer:
   - The system checks their purchase and IP address
   - Generates a unique license key tied to their IP
   - Creates an installer that will only work from their IP address
   - Downloads the specific mod folder based on the admin setting

3. **IP Verification**: The installer includes:
   - PowerShell script that checks the user's current IP
   - Compares it to the original purchase IP
   - Only allows download if IPs match

## Adding New Mods

1. Create a new folder in `modlocker/mods/` with your mod name
2. Add your mod files to that folder (including the Lua file for verification)
3. In the admin panel, set the "Mod Locker Folder" field to your folder name
4. Customers who purchase this mod will get installers specific to this folder

## Security Features

- **IP Locking**: Installers only work from the original purchase IP
- **Unique License Keys**: Each purchase gets a unique license tied to their IP
- **Lua Code Injection**: License verification is embedded in the mod's Lua code
- **File Integrity**: Each mod folder is independently managed and protected
