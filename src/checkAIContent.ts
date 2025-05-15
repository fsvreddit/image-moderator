import { MenuItemOnPressEvent, Context, Post } from "@devvit/public-api";
import { isLinkId } from "@devvit/shared-types/tid.js";
import { getAPIUserAndKey } from "./apiKeyManagement.js";
import { DateTime } from "luxon";
import { domainFromUrl } from "./utility.js";

function urlFromPost (post: Post): string | undefined {
    const domain = domainFromUrl(post.url);
    if (domain === "i.redd.it" || domain === "i.imgur.com") {
        // Reddit internal link or Imgur link
        return post.url;
    }

    if (post.url.startsWith("https://www.reddit.com/gallery/")) {
        const gallery = post.gallery;
        if (gallery.length > 0) {
            return gallery[0].url;
        }
    }
}

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
    // console.log(JSON.stringify(post, null, 2));
    // console.log(urlFromPost(post));
    // return;

    const cachedResultKey = `sightengine_ai_check_${event.targetId}`;
    const cachedResult = await context.redis.get(cachedResultKey);

    let result = undefined;
    if (cachedResult) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        result = JSON.parse(cachedResult);
        console.log("Using cached result");
    }

    const url = urlFromPost(post);
    if (!url) {
        context.ui.showToast("Cannot check post for AI content. This may not be an image post.");
        return;
    }

    if (!result) {
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        result = await response.json();
        await context.redis.set(cachedResultKey, JSON.stringify(result), { expiration: DateTime.now().plus({ hours: 1 }).toJSDate() });
    }

    console.log(result);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const aiLikelihood = result.type.ai_generated as number | undefined;
    if (!aiLikelihood) {
        context.ui.showToast("Could not determine AI content likelihood.");
        return;
    }

    context.ui.showToast(`AI content likelihood: ${Math.round(aiLikelihood * 100)}%`);
}
