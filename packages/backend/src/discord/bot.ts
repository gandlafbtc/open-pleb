import { Client, Events, GatewayIntentBits, type TextChannel } from 'discord.js';
import { eventEmitter } from '../events/emitter';
import { log } from '../logger';
import { fiatProviderTable, type Offer } from '@openPleb/common/db/schema';
import { db } from '../db/db';
import { eq } from "drizzle-orm";

// Initialize configuration
const DISCORD_TOKEN = Bun.env.DISCORD_TOKEN || '';


// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

/**
 * Send a direct message to a Discord user
 * @param userId The Discord user ID
 * @param message The message to send
 */
async function sendMessage(channelId: string, message: string): Promise<void> {
  try {
      const channel = client.channels.cache.get(channelId) as TextChannel
      if (channel.name.toLowerCase() !== "openpleb") {
        return
      }
      await channel.send(message);
      log.info(`Sent DM to ${channelId}`);
  } catch (error) {
    log.error(`Failed to send DM to user ${channelId}: ${error}`);
  }
}

/**
 * Create a formatted message for a new offer
 * @param offer The offer data
 * @returns A formatted message string
 */
async function createOfferMessage(offer: Offer): Promise<string> {
    let fiatProviderName = 'Unknown Provider';
    if (offer.fiatProviderId) {
        const [fiatProvider] = await db.select().from(fiatProviderTable).where(eq(fiatProviderTable.id, offer.fiatProviderId))
        fiatProviderName = fiatProvider.label

    }
  return `
🔔 **New Offer Available on OpenPleb!** 🔔

💰 **Amount**: ${ Intl.NumberFormat("en-US", {currency: offer.currency??""}).format(offer.amount)}
🌟 **Sats Reward**: ${Intl.NumberFormat().format(offer.satsAmount + offer.takerFeeFlatRate + offer.takerFeePercentage)} sats
💱 **Conversion Rate**: 1 BTC = ${Intl.NumberFormat().format(offer.conversionRate)} ${offer.currency}
🏦 **provider**: ${fiatProviderName} 

🔗 **Link**: [Click here to view offer](${Bun.env.FRONTEND_URL})

Check it out now before someone else claims it!
`;
}

/**
 * Notify all registered Discord users about a new offer
 * @param offer The offer data
 */
async function notifyNewOfferDiscord(offer: Offer): Promise<void> {
  const message = await createOfferMessage(offer);
  
  // Send a DM to all registered users
  const notificationPromises = Array.from(client.channels.cache.map((c) => {
    return sendMessage(c.id, message);
  }))
  
  await Promise.all(notificationPromises);
}

// Event listeners
client.once(Events.ClientReady, (c) => {
  log.info(`Discord bot ready! Logged in as ${c.user.tag}`);
});

// Initialize the Discord bot
export function initDiscordBot(): void {
  // Skip initialization if token is not provided
  if (!DISCORD_TOKEN) {
    log.warn('Discord bot token not provided, skipping Discord integration');
    return;
  }
  
  // Listen for the socket event that signals a new offer
  eventEmitter.on('socket-event', (event) => {
      if (event.command === 'new-offer' && event.data && event.data.offer) {
      notifyNewOfferDiscord(event.data.offer).catch((error) => {
        log.error(`Error notifying Discord users: ${error}`);
      });
    }
  });
  
  // Login to Discord
  client.login(DISCORD_TOKEN).catch((error) => {
    log.error(`Discord bot login failed: ${error}`);
  });
}

// Export the client for other modules to use if needed
export { client as discordClient };
