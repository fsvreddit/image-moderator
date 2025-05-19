import { ModAction } from "@devvit/protos";
import { TriggerContext } from "@devvit/public-api";
import { DateTime } from "luxon";

export const MODERATOR_STORE_KEY = "ModeratorStore";

export async function userIsModerator (username: string, context: TriggerContext): Promise<boolean> {
    const moderatorsVal = await context.redis.get(MODERATOR_STORE_KEY);
    let moderators: string[];

    if (moderatorsVal) {
        moderators = JSON.parse(moderatorsVal) as string[];
    } else {
        const allMods = await context.reddit.getModerators({
            subredditName: context.subredditName ?? await context.reddit.getCurrentSubredditName(),
        }).all();
        moderators = allMods.map(mod => mod.username);
        await context.redis.set(MODERATOR_STORE_KEY, JSON.stringify(moderators), { expiration: DateTime.now().plus({ weeks: 1 }).toJSDate() });
        console.log(`Updated moderator list for subreddit ${context.subredditName}.`);
    }

    return moderators.includes(username);
}

export async function handleModListChanges (event: ModAction, context: TriggerContext): Promise<void> {
    const modChangeActions = ["addmoderator", "acceptmoderatorinvite", "invitemoderator", "removemoderator"];
    if (event.action && !modChangeActions.includes(event.action)) {
        await context.redis.del(MODERATOR_STORE_KEY);
    }
}
