import { Devvit } from "@devvit/public-api";
import { appSettings } from "./settings.js";
import { setAPIKeyFormHandler } from "./apiKeyManagement.js";
import { checkPostForAIContent } from "./checkAIContent.js";

Devvit.addSettings(appSettings);

const setAPIKeyForm = Devvit.createForm({
    title: "SightEngine API Key",
    description: "Set your SightEngine API key.",
    fields: [
        {
            type: "string",
            label: "API Key",
            name: "apiKey",
        },
    ],
}, setAPIKeyFormHandler);

Devvit.addMenuItem({
    location: "subreddit",
    label: "Set SightEngine API Key",
    forUserType: "moderator",
    onPress: (_, context) => {
        context.ui.showForm(setAPIKeyForm);
    },
});

Devvit.addMenuItem({
    location: "post",
    label: "Check image for AI Content",
    forUserType: "moderator",
    onPress: checkPostForAIContent,
});

Devvit.configure({
    redditAPI: true,
    http: true,
});

export default Devvit;
