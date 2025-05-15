import { SettingsFormField } from "@devvit/public-api";

export enum AppSetting {
    APIUser = "apiUser",
};

export const appSettings: SettingsFormField[] = [
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
];
