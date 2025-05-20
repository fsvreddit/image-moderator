import { Context, FormOnSubmitEvent, JSONObject, TriggerContext } from "@devvit/public-api";
import { AppSetting } from "./settings.js";

const API_KEY_STORAGE_KEY = "sightengine_api_key";

export async function setAPIKeyFormHandler (event: FormOnSubmitEvent<JSONObject>, context: Context) {
    const apiKey = event.values.apiKey as string | undefined;
    if (!apiKey) {
        context.ui.showToast("API key was not provided.");
        return;
    }

    await context.redis.set(API_KEY_STORAGE_KEY, apiKey);
    context.ui.showToast("API key set successfully.");
}

export async function getAPIUserAndKey (context: TriggerContext) {
    const apiUser = await context.settings.get<string>(AppSetting.APIUser);
    const apiKey = await context.redis.get(API_KEY_STORAGE_KEY);
    return { apiUser, apiKey };
}
