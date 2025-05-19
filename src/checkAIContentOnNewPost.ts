import { ModAction, PostCreate } from "@devvit/protos";
import { Post, SettingsValues, TriggerContext, User } from "@devvit/public-api";
import { getSightengineResults } from "./checkSightEngineAPI.js";
import { postIsImage } from "./utility.js";
import { AppSetting } from "./settings.js";
import { DateTime } from "luxon";

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

    const maxAccountAgeInWeeks = settings[AppSetting.MaxAgeInWeeks] as number | undefined;
    if (maxAccountAgeInWeeks && DateTime.fromJSDate(user.createdAt) < DateTime.now().minus({ weeks: maxAccountAgeInWeeks })) {
        console.log(`${source}: User ${user.username} is older than ${maxAccountAgeInWeeks} weeks(s). Skipping AI check.`);
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

    const result = await getSightengineResults(post, context);
    if (result.status === "error") {
        console.error(`PostCreate: Error checking post for AI content: ${result.message}`);
        return;
    }

    if (!result.type?.ai_generated) {
        console.log(`${source}: Post ${post.id} is not detected as AI content. Skipping report.`);
        return;
    }

    const aiLikelihood = Math.round(result.type.ai_generated * 100);

    const thresholdToReport = settings[AppSetting.ThresholdToReport] as number | undefined;
    if (thresholdToReport && aiLikelihood < thresholdToReport) {
        console.log(`${source}: AI content likelihood for ${post.id} (${aiLikelihood}%) is below threshold (${thresholdToReport}%). Skipping report.`);
        return;
    }

    console.log(`${source}: Post ${post.id} is detected as AI content with likelihood ${aiLikelihood}%. Reporting post.`);
    await context.reddit.report(post, { reason: `AI content likelihood: ${aiLikelihood}%` });
}

export async function handlePostCreate (event: PostCreate, context: TriggerContext) {
    if (!event.post) {
        console.log(`PostCreate: No post found in event.`);
        return;
    }

    const settings = await context.settings.getAll();
    if (!settings[AppSetting.AutoCheckEnabled]) {
        console.log(`PostCreate: Auto check is disabled. Skipping AI check.`);
        return;
    }

    if (settings[AppSetting.CheckAfterApproval] && event.post.spam) {
        console.log(`PostCreate: Post ${event.post.id} is marked as spam. Skipping AI check.`);
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
    if (!settings[AppSetting.AutoCheckEnabled]) {
        console.log(`PostApprovalAction: Auto check is disabled. Skipping AI check.`);
        return;
    }

    if (!settings[AppSetting.CheckAfterApproval]) {
        console.log(`PostApprovalAction: Check after approval is disabled. Skipping AI check.`);
        return;
    }

    await checkAndReportPost(event.targetPost.id, "PostApprovalAction", settings, context);
    await context.redis.del(getFilterKeyForPost(event.targetPost.id));
}
