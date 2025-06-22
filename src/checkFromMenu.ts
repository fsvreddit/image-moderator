import { MenuItemOnPressEvent, Context } from "@devvit/public-api";
import { isLinkId } from "@devvit/shared-types/tid.js";
import { getSightengineResults } from "./checkSightEngineAPI.js";
import { getModels, getRelevantDetectors } from "./detections/allDetections.js";

export async function checkPostFromMenu (event: MenuItemOnPressEvent, context: Context) {
    const postId = event.targetId;
    if (!postId || !isLinkId(postId)) {
        context.ui.showToast("Could not get post ID from event.");
        return;
    }

    const post = await context.reddit.getPostById(postId);
    const settings = await context.settings.getAll();
    const detectors = getRelevantDetectors(settings, "menu");

    if (detectors.length === 0) {
        context.ui.showToast("No detection models are enabled for this subreddit.");
        console.log("No detection models are enabled for this subreddit.");
        return;
    }

    const models = getModels(detectors);

    const result = await getSightengineResults(post, models, context);
    if (result.status === "error") {
        context.ui.showToast(result.message ?? "Error checking post for AI content.");
        console.error(`Menu: Error checking post ${postId}: ${result.message}`);
        return;
    }

    console.log(JSON.stringify(result, null, 2));

    const detectionResults: string[] = [];
    for (const Detection of detectors) {
        const detectionInstance = new Detection(settings);
        const detectionResult = detectionInstance.detectByMenu(result);
        if (detectionResult) {
            detectionResults.push(detectionResult);
        }
    }

    context.ui.showToast(detectionResults.join(", "));
    console.log(`Active Check: Post ${postId} results ${detectionResults.join(", ")}.`);
}
