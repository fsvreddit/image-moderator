import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

export class DetectTextSpam extends DetectionBase {
    public name = "TextSpam";
    public friendlyName = "Text Spam Detection";
    public helpText = "Looks for text in images that may attempt to drive users externally, such as Telegram or Snapchat handles";
    public sightengineType = "text-content";

    public moduleSettings: SettingsFormField[] = [];

    override defaultEnabledForMenu = false;

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        if (sightEngineResponse.text?.spam && sightEngineResponse.text.spam.length > 0) {
            return "Text spam detected";
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string | undefined {
        if (sightEngineResponse.text?.spam && sightEngineResponse.text.spam.length > 0) {
            return "Text spam detected";
        } else {
            return "No text spam detected";
        }
    }
}
