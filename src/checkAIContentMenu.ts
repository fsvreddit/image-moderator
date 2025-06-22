import { MenuItemOnPressEvent, Context } from "@devvit/public-api";
import { isLinkId } from "@devvit/shared-types/tid.js";
import { getSightengineResults } from "./checkSightEngineAPI.js";

export async function checkPostForAIContent (event: MenuItemOnPressEvent, context: Context) {
    const postId = event.targetId;
    if (!postId || !isLinkId(postId)) {
        context.ui.showToast("Could not get post ID from event.");
        return;
    }

    const post = await context.reddit.getPostById(postId);

    const result = await getSightengineResults(post, ["genai"], context);
    if (result.status === "error") {
        context.ui.showToast(result.message ?? "Error checking post for AI content.");
        return;
    }

    if (!result.type?.ai_generated) {
        context.ui.showToast("Could not determine AI content likelihood.");
        return;
    }

    const aiLikelihood = Math.round(result.type.ai_generated * 100);
    if (!aiLikelihood) {
        context.ui.showToast("Could not determine AI content likelihood.");
        return;
    }

    context.ui.showToast(`AI content likelihood: ${aiLikelihood}%`);
    console.log(`Active Check: Post ${postId} AI likelihood ${aiLikelihood}%.`);
}
