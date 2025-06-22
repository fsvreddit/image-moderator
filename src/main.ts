import { Devvit } from "@devvit/public-api";
import { getAllAppSettings } from "./settings.js";
import { setAPIKeyFormHandler } from "./apiKeyManagement.js";
import { checkPostFromMenu } from "./checkFromMenu.js";
import { handlePostApprovalAction, handlePostCreate } from "./checkNewPost.js";
import { handleModListChanges } from "./moderatorChecks.js";
import { handleAppInstallOrUpgrade } from "./installActions.js";

Devvit.addSettings(getAllAppSettings());

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
    label: "Check image using Image Moderator",
    forUserType: "moderator",
    onPress: checkPostFromMenu,
});

Devvit.addTrigger({
    event: "PostCreate",
    onEvent: handlePostCreate,
});

Devvit.addTrigger({
    events: ["AppInstall", "AppUpgrade"],
    onEvent: handleAppInstallOrUpgrade,
});

Devvit.addTrigger({
    event: "ModAction",
    onEvent: handlePostApprovalAction,
});

Devvit.addTrigger({
    event: "ModAction",
    onEvent: handleModListChanges,
});

Devvit.configure({
    redditAPI: true,
    http: true,
});

export default Devvit;
