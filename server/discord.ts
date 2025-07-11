import axios from 'axios';

// Discord API base URL
const DISCORD_API_URL = 'https://discord.com/api/v10';

// Get user information from Discord
export async function getDiscordUser(accessToken: string) {
  try {
    const response = await axios.get(`${DISCORD_API_URL}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching Discord user: ${error.message}`);
  }
}

// Get user guilds (servers) from Discord
export async function getDiscordUserGuilds(accessToken: string) {
  try {
    const response = await axios.get(`${DISCORD_API_URL}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching Discord guilds: ${error.message}`);
  }
}

// Get user roles for a specific guild
export async function getDiscordGuildMember(accessToken: string, guildId: string) {
  try {
    const response = await axios.get(`${DISCORD_API_URL}/users/@me/guilds/${guildId}/member`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching Discord guild member: ${error.message}`);
  }
}

// Send a message to a Discord webhook
export async function sendDiscordWebhookMessage(webhookUrl: string, message: any) {
  try {
    await axios.post(webhookUrl, message);
    return true;
  } catch (error: any) {
    throw new Error(`Error sending Discord webhook message: ${error.message}`);
  }
}
