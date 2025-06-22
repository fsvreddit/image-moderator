import { SettingsFormField } from "@devvit/public-api";
import { ALL_DETECTIONS } from "./detections/allDetections.js";

export enum AppSetting {
    APIUser = "apiUser",

    // Automatic check settings
    AutoCheckEnabled = "autoCheckEnabled",
    CheckAfterApproval = "checkAfterApproval",
    IgnoreApprovedUsers = "ignoreApprovedUsers",
    MaxAgeInWeeks = "maxAgeInWeeks",
    MaxLinkKarma = "maxLinkKarma",
    MaxCommentKarma = "maxCommentKarma",
};

const appSettings: SettingsFormField[] = [
    {
        type: "group",
        label: "Sightengine API Settings",
        fields: [
            {
                type: "string",
                label: "API User",
                name: AppSetting.APIUser,
                helpText: "Your SightEngine API user ID. Set your API key from the subreddit context menu.",
            },
        ],
    },
    {
        type: "group",
        label: "Detect content in newly created posts",
        helpText: "Warning: you should be mindful of API usage, and set account age and karma thresholds to keep usage low.",
        fields: [
            {
                type: "boolean",
                label: "Enable automatic check",
                name: AppSetting.AutoCheckEnabled,
                helpText: "If enabled, newly created posts will be checked and a report will be made if the image is detected as AI.",
                defaultValue: false,
            },
            {
                type: "boolean",
                label: "Check after approval",
                name: AppSetting.CheckAfterApproval,
                helpText: "If a post is filtered, check only after it is approved.",
                defaultValue: false,
            },
            {
                type: "boolean",
                label: "Ignore approved users",
                name: AppSetting.IgnoreApprovedUsers,
                helpText: "Ignore users who are approved users of the subreddit.",
                defaultValue: true,
            },
            {
                type: "number",
                label: "Maximum account age in weeks",
                name: AppSetting.MaxAgeInWeeks,
                helpText: "Only check users younger than this. Set to 0 to disable. Choosing zero or a high value will result in higher API usage.",
                defaultValue: 1,
            },
            {
                type: "number",
                label: "Maximum post karma",
                name: AppSetting.MaxLinkKarma,
                helpText: "Only check users with post karma lower than this. Set to 0 to disable. Choosing zero or a high value will result in higher API usage.",
                defaultValue: 0,
            },
            {
                type: "number",
                label: "Maxium comment karma",
                name: AppSetting.MaxCommentKarma,
                helpText: "Only check users with comment karma lower than this. Set to 0 to disable. Choosing zero or a high value will result in higher API usage.",
                defaultValue: 0,
            },
        ],
    },
];

export function getAllAppSettings (): SettingsFormField[] {
    const settings = [...appSettings];
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstance = new Detection({});
        settings.push(detectionInstance.getSettings());
    }

    return settings;
}
