import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";
import { compact, max } from "lodash";

enum ModuleSetting {
    MinorThreshold = "MinorDetection_MinorThreshold",
}

export class DetectMinors extends DetectionBase {
    public name = "MinorDetection";
    public friendlyName = "Minor Detection";
    public helpText = "Detects images containing people who appear to be underage.";
    public sightengineType = "face-attributes";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "number",
            name: ModuleSetting.MinorThreshold,
            label: "Minor likelihood threshold",
            defaultValue: 80,
            helpText: "Likelihood threshold in % for detecting minors. If the likelihood is above this value, the post will be flagged as likely containing a minor.",
            onValidate: event => this.validatePercentage(event),
        },
    ];

    override defaultEnabledForMenu = false;

    private getMinorLikelihood (sightEngineResponse: SightengineResponse): number | undefined {
        const minorLikelihoods = compact(sightEngineResponse.faces?.filter(face => face.attributes?.minor).map(face => face.attributes?.minor));
        return max(minorLikelihoods.map(likelihood => Math.round(likelihood * 100)));
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const minorLikelihood = this.getMinorLikelihood(sightEngineResponse);
        if (minorLikelihood && minorLikelihood > this.getSetting(ModuleSetting.MinorThreshold, 80)) {
            return `Likely minor: ${minorLikelihood}%`;
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string | undefined {
        const minorLikelihood = this.getMinorLikelihood(sightEngineResponse);
        if (minorLikelihood && minorLikelihood > this.getSetting(ModuleSetting.MinorThreshold, 80)) {
            return `Likely minor: ${minorLikelihood}%`;
        } else {
            return "No minors detected";
        }
    }
}
