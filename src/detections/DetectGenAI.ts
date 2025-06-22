import { SettingsFormField } from "@devvit/public-api";
import { SightengineResponse } from "../checkSightEngineAPI.js";
import { DetectionBase } from "./DetectionBase.js";

enum ModuleSetting {
    Threshold = "GenAI_Threshold",
}

export class DetectGenAI extends DetectionBase {
    public name = "GenAI";
    public friendlyName = "Generative AI Detection";
    public sightengineType = "genai";

    override defaultEnabledForMenu = true;

    override moduleSettings: SettingsFormField[] = [
        {
            type: "number",
            label: "Threshold to report",
            name: ModuleSetting.Threshold,
            helpText: "App will report the post if the AI content likelihood is greater than this percentage.",
            defaultValue: 80,
            onValidate: ({ value }) => {
                if (!value) {
                    return;
                }
                if (value < 0 || value > 99) {
                    return "Value must be between 0 and 99.";
                }
            },
        },
    ];

    private getAILikelihood (sightEngineResponse: SightengineResponse): number | undefined {
        if (!sightEngineResponse.type?.ai_generated) {
            return;
        }

        return Math.round(sightEngineResponse.type.ai_generated * 100);
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const aiLikelihood = this.getAILikelihood(sightEngineResponse);
        if (!aiLikelihood) {
            return;
        }

        if (aiLikelihood > this.getSetting<number>(ModuleSetting.Threshold, 80)) {
            return `AI Likelihood: ${aiLikelihood}%.`;
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string {
        const aiLikelihood = this.getAILikelihood(sightEngineResponse);
        if (!aiLikelihood) {
            return "Error checking for AI content.";
        }

        return `AI Likelihood: ${aiLikelihood}%.`;
    }
}
