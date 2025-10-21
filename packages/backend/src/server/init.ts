import { migrate } from "drizzle-orm/postgres-js/migrator";
import { log } from "../logger";
import { db } from "../db/db";
import { subscriptionsTable, vapidKeysTable } from "@openPleb/common/db/schema";
import { subscribers } from "../dynamic/subscribers";
import * as webpush from "@negrel/webpush";
import { VapidKeys } from "../dynamic/vapidKeys";
import { initDiscordBot } from "../discord/bot";

export const init = async () => {
    checkEnv()
    await migrateDb()
    await setUpVapid()
}

export const afterInit = async () => {
    initDiscordBot()
}

const migrateDb = async ()=>{
    if (!process.env.OPENPLEB_MIGRATIONS_DIR) {
        log.error(" environment variable is not set");
        process.exit(1);
    }

    log.info`migrating db...`;
    await migrate(db, {migrationsFolder: process.env.OPENPLEB_MIGRATIONS_DIR });
    log.info`DB migration:✅`;
}

const checkEnv = () => {
    log.info`Checking env...`;
    // Check all required environment variables before starting the service
    const requiredEnvVars = [
        "OPENPLEB_MIGRATIONS_DIR",
        "OPENPLEB_PORT",
        "OPENPLEB_FRONTEND_URL",
        "OPENPLEB_DATABASE_URL",
        "OPENPLEB_CASHU_SEED_PHRASE",
        "OPENPLEB_LOG_FILE_NAME",
        "OPENPLEB_CONTACT",
        "OPENPLEB_PLATFORM_FEE_PERCENTAGE",
        "OPENPLEB_PLATFORM_FEE_FLAT_RATE",
        "OPENPLEB_TAKER_FEE_PERCENTAGE",
        "OPENPLEB_TAKER_FEE_FLAT_RATE",
        "OPENPLEB_MINT_URL",
        "OPENPLEB_BOND_PERCENTAGE",
        "OPENPLEB_BOND_FLAT_RATE",
        "OPENPLEB_CURRENCY",
        "OPENPLEB_MAX_FIAT_AMOUNT",
        "OPENPLEB_JWT_SECRET"
    ];
    
    for (const envVar of requiredEnvVars) {
        if (!Bun.env[envVar]) {
            log.error(`No ${envVar} environment variable set`);
            process.exit(1);
        }
    }
    log.info`Env: ✅`;

    
}

const setUpVapid = async () => {
    log.info`setting up webpush subscriptions...`
    let [exportedVapidKeys] = await db.select().from(vapidKeysTable)
    if (!exportedVapidKeys) {
        log.info`creating new vapid keys`
        const cryptoKeyPair = await webpush.generateVapidKeys({extractable: true })
        const newExportedVapidKeys = await webpush.exportVapidKeys(cryptoKeyPair)
        const newExportedVapidKeysJSON = JSON.stringify(newExportedVapidKeys)
        const inserted = await db.insert(vapidKeysTable).values({ vapidJSON: newExportedVapidKeysJSON, createdAt: Math.ceil(Date.now()/1000) }).returning();
        exportedVapidKeys = inserted[0];
    }
    else {
        log.info`Vapid keys loaded from db`
    }
    
    const vapidKeys = await webpush.importVapidKeys(JSON.parse(exportedVapidKeys.vapidJSON), {
        extractable: false,
    });

    VapidKeys.getInstance().vapidKeys=vapidKeys

    const appServer = await webpush.ApplicationServer.new({
        contactInformation: Bun.env.OPENPLEB_CONTACT??'',
        vapidKeys,
    });

    VapidKeys.getInstance().appServer=appServer

    
        const subscriptions = await db.select().from(subscriptionsTable); 
    for (const subscription of subscriptions) {
        const parsedSubscription = JSON.parse(subscription.subscription);
        const subscriber = appServer.subscribe(parsedSubscription); 
        subscribers.push(subscriber);
    }
    log.info(`Webpush Subscriptions: ✅ (${subscriptions.length} active)`)
}
 
