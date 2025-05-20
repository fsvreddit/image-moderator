import { TriggerContext } from "@devvit/public-api";
import { AppInstall, AppUpgrade } from "@devvit/protos";
import { MODERATOR_STORE_KEY } from "./moderatorChecks.js";

export async function handleAppInstallOrUpgrade (_: AppInstall | AppUpgrade, context: TriggerContext): Promise<void> {
    await context.redis.del(MODERATOR_STORE_KEY);
    console.log(`App ${context.appName} installed or upgraded on subreddit ${context.subredditName}.`);
}
