import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

enum ModuleSetting {
    Threshold = "Drugs_Threshold",
    AllowCannabis = "Drugs_AllowCannabis",
    AllowCannabisLogo = "Drugs_AllowCannabisLogoOnly",
}

export class DetectDrugs extends DetectionBase {
    public name = "Drugs";
    public friendlyName = "Drug Detection";
    public helpText = "Detects images containing recreational drugs or related imagery. Useful for identifying posts that may violate community guidelines regarding drug-related content.";
    public sightengineType = "recreational_drug";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "number",
            name: ModuleSetting.Threshold,
            label: "Detection Threshold",
            defaultValue: 80,
            helpText: "Detection threshold in %. If the likelihood of drug-related content is above this value, the post will be flagged.",
            onValidate: event => this.validatePercentage(event),
        },
        {
            type: "boolean",
            name: ModuleSetting.AllowCannabis,
            label: "Allow Cannabis Imagery",
            defaultValue: false,
            helpText: "If enabled, the app will not flag posts containing cannabis imagery of any kind.",
        },
        {
            type: "boolean",
            name: ModuleSetting.AllowCannabisLogo,
            label: "Allow Cannabis 'Logos' Only",
            defaultValue: false,
            helpText: "If enabled, the app will only allow cannabis logos, even if the above option is not enabled.",
        },
    ];

    override defaultEnabledForMenu = false;

    private getDetectionResult (sightEngineResponse: SightengineResponse): number | undefined {
        if (!sightEngineResponse.recreational_drug?.prob || !sightEngineResponse.recreational_drug.classes) {
            return;
        }

        if (this.getSetting<boolean>(ModuleSetting.AllowCannabis, false)) {
            return Math.round(sightEngineResponse.recreational_drug.classes.recreational_drugs_not_cannabis * 100);
        }

        if (this.getSetting<boolean>(ModuleSetting.AllowCannabisLogo, false)) {
            return Math.round(sightEngineResponse.recreational_drug.classes.cannabis_logo_only * 100);
        }

        return Math.round(sightEngineResponse.recreational_drug.prob * 100);
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const drugLikelihood = this.getDetectionResult(sightEngineResponse);
        if (drugLikelihood === undefined) {
            return;
        }

        if (drugLikelihood > this.getSetting<number>(ModuleSetting.Threshold, 80)) {
            return `Drug likelihood: ${drugLikelihood}%`;
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string | undefined {
        const drugLikelihood = this.getDetectionResult(sightEngineResponse);
        if (drugLikelihood === undefined) {
            return;
        }

        if (drugLikelihood > this.getSetting<number>(ModuleSetting.Threshold, 80)) {
            return `Drug likelihood: ${drugLikelihood}%`;
        } else {
            return "No drugs detected";
        }
    }
}
