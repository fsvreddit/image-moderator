import { MenuItemOnPressEvent, Context } from "@devvit/public-api";
import { isLinkId } from "@devvit/shared-types/tid.js";
import { getAPIUserAndKey } from "./apiKeyManagement.js";
import { DateTime } from "luxon";
import { getImageURLFromPost } from "./utility.js";
import { SightengineResponse } from "./types.js";

export async function checkPostForAIContent (event: MenuItemOnPressEvent, context: Context) {
    const postId = event.targetId;
    if (!postId || !isLinkId(postId)) {
        context.ui.showToast("Could not get post ID from event.");
        return;
    }

    const apiDetails = await getAPIUserAndKey(context);
    if (!apiDetails.apiKey) {
        context.ui.showToast("API key is not set. Please set it in the subreddit context menu.");
        return;
    }

    if (!apiDetails.apiUser) {
        context.ui.showToast("API user is not set. Please set it in the app settings.");
        return;
    }

    const post = await context.reddit.getPostById(postId);

    const cachedResultKey = `sightengine_ai_check_${event.targetId}`;
    const cachedResult = await context.redis.get(cachedResultKey);

    let result: SightengineResponse | undefined;
    if (cachedResult) {
        result = JSON.parse(cachedResult) as SightengineResponse;
        console.log("Using cached result");
    }

    if (!result) {
        const url = getImageURLFromPost(post);
        if (!url) {
            context.ui.showToast("Cannot check post for AI content. This may not be an image post.");
            return;
        }

        const params = new URLSearchParams();
        params.append("url", url);
        params.append("models", "genai");
        params.append("api_user", apiDetails.apiUser);
        params.append("api_secret", apiDetails.apiKey);

        const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
            method: "GET",
        });

        if (!response.ok) {
            context.ui.showToast("Error checking post for AI content.");
            return;
        }

        result = await response.json() as SightengineResponse;
        await context.redis.set(cachedResultKey, JSON.stringify(result), { expiration: DateTime.now().plus({ weeks: 1 }).toJSDate() });
    }

    console.log(result);
    const aiLikelihood = result.type.ai_generated;
    if (!aiLikelihood) {
        context.ui.showToast("Could not determine AI content likelihood.");
        return;
    }

    context.ui.showToast(`AI content likelihood: ${Math.round(aiLikelihood * 100)}%`);
}
