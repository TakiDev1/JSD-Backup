import { MailService } from '@sendgrid/mail';
import { storage } from './storage';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set - email notifications will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface ModUpdateNotificationData {
  modTitle: string;
  modId: number;
  newVersion: string;
  changelog?: string;
  userEmail: string;
  username: string;
}

export async function sendModUpdateNotification(data: ModUpdateNotificationData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[Notifications] Would send email to ${data.userEmail} about ${data.modTitle} update (no SendGrid key)`);
    return false;
  }

  try {
    const siteSettings = await storage.getSiteSettings();
    const siteName = siteSettings.siteName || 'JSD Mods';
    const contactEmail = siteSettings.contactEmail || 'noreply@jsdmods.com';

    const emailContent = {
      to: data.userEmail,
      from: {
        email: contactEmail,
        name: siteName
      },
      subject: `🎮 New Update Available: ${data.modTitle} v${data.newVersion}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎮 Mod Update Available!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hey ${data.username}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Great news! <strong>${data.modTitle}</strong> has been updated to version <strong>${data.newVersion}</strong>.
            </p>
            
            ${data.changelog ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">🔧 What's New:</h3>
                <p style="color: #666; margin-bottom: 0; white-space: pre-line;">${data.changelog}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_URL || 'https://your-site.com'}/mod-locker" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                📥 Download Update
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Your download link has been automatically updated in your mod locker.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} ${siteName}. This email was sent because you own this mod.
            </p>
          </div>
        </div>
      `,
      text: `
Hey ${data.username}!

Great news! ${data.modTitle} has been updated to version ${data.newVersion}.

${data.changelog ? `What's New:\n${data.changelog}\n\n` : ''}

Visit your mod locker to download the update: ${process.env.REPLIT_URL || 'https://your-site.com'}/mod-locker

Your download link has been automatically updated.

© ${new Date().getFullYear()} ${siteName}
      `.trim()
    };

    await mailService.send(emailContent);
    
    // Log the notification
    await storage.logAdminActivity({
      userId: 0, // System action
      action: 'mod_update_notification_sent',
      details: `Email sent to ${data.userEmail} for ${data.modTitle} v${data.newVersion}`
    });

    console.log(`[Notifications] Sent mod update email to ${data.userEmail} for ${data.modTitle} v${data.newVersion}`);
    return true;
  } catch (error) {
    console.error('[Notifications] Failed to send mod update email:', error);
    return false;
  }
}

export async function notifyModUpdateToAllOwners(modId: number, newVersion: string, changelog?: string): Promise<void> {
  try {
    const mod = await storage.getMod(modId);
    if (!mod) {
      console.error(`[Notifications] Mod ${modId} not found`);
      return;
    }

    // Get all users who purchased this mod
    const purchases = await storage.getPurchasesByMod(modId);
    
    console.log(`[Notifications] Found ${purchases.length} owners of mod ${mod.title}`);

    // Send notifications to all owners
    const notificationPromises = purchases.map(async (purchase: any) => {
      const user = await storage.getUser(purchase.userId);
      if (!user || !user.email) {
        console.warn(`[Notifications] User ${purchase.userId} not found or has no email`);
        return false;
      }

      return sendModUpdateNotification({
        modTitle: mod.title,
        modId: mod.id,
        newVersion,
        changelog,
        userEmail: user.email,
        username: user.username
      });
    });

    const results = await Promise.allSettled(notificationPromises);
    const successful = results.filter((r: any) => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - successful;

    console.log(`[Notifications] Mod update notifications sent: ${successful} successful, ${failed} failed`);
  } catch (error) {
    console.error('[Notifications] Failed to notify mod owners:', error);
  }
}