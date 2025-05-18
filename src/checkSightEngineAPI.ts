import { Post, TriggerContext } from "@devvit/public-api";
import { DateTime } from "luxon";
import { getAPIUserAndKey } from "./apiKeyManagement.js";
import { getImageURLFromPost } from "./utility.js";

interface SightengineResponse {
    status: string;
    message?: string;
    request?: {
        id: string;
        timestamp: number;
        operations: number;
    };
    type?: {
        ai_generated?: number;
        ai_generators?: {
            other?: number;
            firefly?: number;
            gan?: number;
            recraft?: number;
            dalle?: number;
            gpt40?: number;
            reve?: number;
            midjourney?: number;
            stable_diffusion?: number;
            flux?: number;
            imagen?: number;
            ideogram?: number;
        };
    };
}

function getFailureResponse (message: string): SightengineResponse {
    return {
        status: "error",
        message,
    };
}

export async function getSightengineResults (post: Post, context: TriggerContext): Promise<SightengineResponse> {
    const url = getImageURLFromPost(post);
    if (!url) {
        return getFailureResponse("This does not appear to be an image post.");
    }

    const cachedResultKey = `sightengine_ai_check_${post.id}`;
    const cachedResult = await context.redis.get(cachedResultKey);

    if (cachedResult) {
        console.log("Using cached result");
        return JSON.parse(cachedResult) as SightengineResponse;
    }

    const apiDetails = await getAPIUserAndKey(context);
    if (!apiDetails.apiKey) {
        return getFailureResponse("API key not set. Please set the API key from the subreddit context menu.");
    }

    if (!apiDetails.apiUser) {
        return getFailureResponse("API user not set. Please set the API user in the settings.");
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
        return getFailureResponse("Error checking post for AI content.");
    }

    const result = await response.json() as SightengineResponse;
    if (result.status !== "success") {
        console.log("Sightengine API error:", result);
        return getFailureResponse("Error checking post for AI content.");
    }

    await context.redis.set(cachedResultKey, JSON.stringify(result), { expiration: DateTime.now().plus({ months: 1 }).toJSDate() });

    return result;
}
