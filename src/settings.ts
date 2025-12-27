import { SettingsFormField } from "@devvit/public-api";
import { ALL_DETECTIONS } from "./detections/allDetections.js";

export enum AppSetting {
    APIUser = "apiUser",

    // Automatic check settings
    CheckAfterApproval = "checkAfterApproval",
    IgnoreApprovedUsers = "ignoreApprovedUsers",
    MaxAgeInWeeks = "maxAgeInWeeks",
    MaxLinkKarma = "maxLinkKarma",
    MaxCommentKarma = "maxCommentKarma",
    AutoCheckAction = "autoCheckAction",
    RemovalMessagePlaceholder = "removalMessagePlaceholder",
};

export enum AutoCheckActionOption {
    ReportPost = "reportPost",
    RemovePost = "removePost",
}

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
        helpText: "Warning: you should be mindful of API usage, and set account age and karma thresholds to keep usage low. Detection will only occur if at least one content type is chosen for proactive detection.",
        fields: [
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
            {
                type: "select",
                label: "Action to take on detection",
                name: AppSetting.AutoCheckAction,
                options: [
                    { label: "Report Post", value: AutoCheckActionOption.ReportPost },
                    { label: "Remove Post", value: AutoCheckActionOption.RemovePost },
                ],
                multiSelect: false,
                helpText: "Action to take when AI-generated content is detected in a new post.",
                defaultValue: [AutoCheckActionOption.ReportPost],
                onValidate: ({ value }) => {
                    if (Array.isArray(value) && value.length !== 1) {
                        return "You must select an action to take on detection.";
                    }
                },
            },
            {
                type: "paragraph",
                label: "Removal message placeholder",
                name: AppSetting.RemovalMessagePlaceholder,
                lineHeight: 7,
                helpText: "Removal message, supports markdown and placeholders {{subreddit}}, {{author}}, {{reasons}}. {{reasons}} will be replaced with bullet points so should be on a line of its own.",
                defaultValue: "Your post has been removed because it was detected for the following reasons:\n\n{{reasons}}",
                onValidate: ({ value }) => {
                    if (!value) {
                        return;
                    }

                    const lines = value.split("\n");
                    const placeholderLines = lines.filter(line => line.includes("{{reasons}}"));
                    if (placeholderLines.some(line => line.trim() !== "{{reasons}}")) {
                        return "The {{reasons}} placeholder must be on a line of its own.";
                    }
                },
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
