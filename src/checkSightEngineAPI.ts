import { Post, TriggerContext } from "@devvit/public-api";
import { DateTime } from "luxon";
import { getAPIUserAndKey } from "./apiKeyManagement.js";
import { getImageURLFromPost } from "./utility.js";

export interface SightengineResponse {
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
        deepfake?: number;
    };
    quality?: {
        score?: number;
    };
    faces?: [
        {
            x1?: number;
            y1?: number;
            x2?: number;
            y2?: number;
            features?: {
                left_eye?: {
                    x: number;
                    y: number;
                };
                right_eye?: {
                    x: number;
                    y: number;
                };
                nose_tip?: {
                    x: number;
                    y: number;
                };
                left_mouth_corner?: {
                    x: number;
                    y: number;
                };
                right_mouth_corner?: {
                    x: number;
                    y: number;
                };
            };
            attributes?: {
                minor?: number;
                sunglasses?: number;
            };
        },
    ];
    offensive?: {
        nazi?: number;
        confederate?: number;
        supremacist?: number;
        terrorist?: number;
    };
    qr?: {
        personal: [];
        link: {
            type: string;
            match: string;
            category?: string;
        }[];
        social: {
            type: string;
            match: string;
            score?: number;
        }[];
        profanity: [];
        spam: {
            type: string;
            match: string;
        }[];
    };
    text?: {
        spam: {
            type: string;
            match: string;
        }[];
    };
    recreational_drug?: {
        prob?: number;
        classes?: {
            cannabis: number;
            cannabis_logo_only: number;
            cannabis_plant: number;
            cannabis_drug: number;
            recreational_drugs_not_cannabis: number;
        };
    };
}

interface SightengineResponseWrapped {
    detections: string[];
    sightengineResponse: SightengineResponse;
}

function getFailureResponse (message: string): SightengineResponse {
    return {
        status: "error",
        message,
    };
}

export async function getSightengineResults (post: Post, detections: string[], context: TriggerContext): Promise<SightengineResponse> {
    const url = getImageURLFromPost(post);
    if (!url) {
        return getFailureResponse("This does not appear to be an image post.");
    }

    const cachedResultKey = `sightengine_check_${post.id}`;
    const cachedResult = await context.redis.get(cachedResultKey);

    if (cachedResult) {
        console.log("Found cached result for post:", post.id);

        const cachedResponse = JSON.parse(cachedResult) as SightengineResponseWrapped;
        if (detections.every(detection => cachedResponse.detections.includes(detection))) {
            console.log("Using cached result");
            return cachedResponse.sightengineResponse;
        }
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
    params.append("models", detections.join(","));
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

    const wrappedResult: SightengineResponseWrapped = {
        detections,
        sightengineResponse: result,
    };

    await context.redis.set(cachedResultKey, JSON.stringify(wrappedResult), { expiration: DateTime.now().plus({ months: 1 }).toJSDate() });

    return result;
}
