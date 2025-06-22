import { ModAction, PostCreate } from "@devvit/protos";
import { Post, SettingsValues, TriggerContext, User } from "@devvit/public-api";
import { getSightengineResults } from "./checkSightEngineAPI.js";
import { postIsImage } from "./utility.js";
import { AppSetting } from "./settings.js";
import { DateTime } from "luxon";
import { userIsModerator } from "./moderatorChecks.js";
import { getModels, getRelevantDetectors } from "./detections/allDetections.js";

function getFilterKeyForPost (postId: string) {
    return `filtered_post:${postId}`;
}

async function checkAndReportPost (postId: string, source: "PostCreate" | "PostApprovalAction", settings: SettingsValues, context: TriggerContext) {
    let post: Post | undefined;
    try {
        post = await context.reddit.getPostById(postId);
    } catch (error) {
        console.error(`${source}: Error fetching post by ID: ${postId}`, error);
        return;
    }

    const canCheckPost = postIsImage(post);
    if (!canCheckPost) {
        console.log(`${source}: Post ${post.id} is not an image or gallery post. Skipping AI check.`);
        return;
    }

    let user: User | undefined;
    try {
        user = await context.reddit.getUserByUsername(post.authorName);
    } catch {
        //
    }

    if (!user) {
        console.error(`${source}: Error fetching user by username: ${post.authorName}`);
        return;
    }

    const maxAccountAgeInWeeks = settings[AppSetting.MaxAgeInWeeks] as number | undefined;
    if (maxAccountAgeInWeeks && DateTime.fromJSDate(user.createdAt) < DateTime.now().minus({ weeks: maxAccountAgeInWeeks })) {
        console.log(`${source}: User ${user.username} is older than ${maxAccountAgeInWeeks} week(s). Skipping AI check.`);
        return;
    }

    const maxLinkKarma = settings[AppSetting.MaxLinkKarma] as number | undefined;
    if (maxLinkKarma && user.linkKarma > maxLinkKarma) {
        console.log(`${source}: User ${user.username} has link karma ${user.linkKarma}, threshold ${maxLinkKarma}. Skipping AI check.`);
        return;
    }

    const maxCommentKarma = settings[AppSetting.MaxCommentKarma] as number | undefined;
    if (maxCommentKarma && user.commentKarma > maxCommentKarma) {
        console.log(`${source}: User ${user.username} has comment karma ${user.commentKarma}, threshold ${maxCommentKarma}. Skipping AI check.`);
        return;
    }

    const ignoreApprovedUsers = settings[AppSetting.IgnoreApprovedUsers] as boolean | undefined;
    if (ignoreApprovedUsers) {
        const approvedUsers = await context.reddit.getApprovedUsers({
            subredditName: context.subredditName ?? await context.reddit.getCurrentSubredditName(),
            username: user.username,
        }).all();

        if (approvedUsers.length > 0) {
            console.log(`${source}: User ${user.username} is an approved user. Skipping AI check.`);
            return;
        }
    }

    if (await userIsModerator(user.username, context)) {
        console.log(`${source}: User ${user.username} is a moderator. Skipping AI check.`);
    }

    const detectors = getRelevantDetectors(settings, "menu");

    if (detectors.length === 0) {
        return;
    }

    const models = getModels(detectors);

    const result = await getSightengineResults(post, models, context);
    if (result.status === "error") {
        console.error(`PostCreate: Error checking post for AI content: ${result.message}`);
        return;
    }

    const detectionResults: string[] = [];
    for (const Detection of detectors) {
        const detectionInstance = new Detection(settings);
        const detectionResult = detectionInstance.detectByMenu(result);
        if (detectionResult) {
            detectionResults.push(detectionResult);
        }
    }

    if (detectionResults.length === 0) {
        console.log(`${source}: Post ${post.id} did not match any detectors. Skipping report.`);
        return;
    }

    await context.reddit.report(post, { reason: detectionResults.join(", ") });
    console.log(`${source}: Post ${post.id} matched: ${detectionResults.join(", ")}. Reported.`);
}

export async function handlePostCreate (event: PostCreate, context: TriggerContext) {
    if (!event.post) {
        console.log(`PostCreate: No post found in event.`);
        return;
    }

    const settings = await context.settings.getAll();

    if (settings[AppSetting.CheckAfterApproval] && event.post.spam) {
        console.log(`PostCreate: Post ${event.post.id} is removed or filtered. Skipping AI check.`);
        await context.redis.set(getFilterKeyForPost(event.post.id), "true", { expiration: DateTime.now().plus({ weeks: 1 }).toJSDate() });
        return;
    }

    await checkAndReportPost(event.post.id, "PostCreate", settings, context);
}

export async function handlePostApprovalAction (event: ModAction, context: TriggerContext) {
    if (event.action !== "approvelink") {
        return;
    }

    if (!event.targetPost?.id) {
        console.log(`PostApprovalAction: No post ID found in event.`);
        return;
    }

    if (!await context.redis.exists(getFilterKeyForPost(event.targetPost.id))) {
        console.log(`PostApprovalAction: Post ${event.targetPost.id} is not marked as filtered. Skipping AI check.`);
        return;
    }

    const settings = await context.settings.getAll();
    if (!settings[AppSetting.CheckAfterApproval]) {
        console.log(`PostApprovalAction: Check after approval is disabled. Skipping AI check.`);
        return;
    }

    await checkAndReportPost(event.targetPost.id, "PostApprovalAction", settings, context);
    await context.redis.del(getFilterKeyForPost(event.targetPost.id));
}
