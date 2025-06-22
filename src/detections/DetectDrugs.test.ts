/* eslint-disable camelcase */
import { SightengineResponse } from "../checkSightEngineAPI.js";
import { DetectDrugs } from "./DetectDrugs.js";

test("Cannabis detection", () => {
    const detector = new DetectDrugs({
        Drugs_EnabledForProactive: true,
        Drugs_Threshold: 80,
    });

    const sightEngineResponse: SightengineResponse = {
        status: "success",
        recreational_drug: {
            prob: 0.99,
            classes: {
                cannabis: 0.99,
                cannabis_logo_only: 0.01,
                cannabis_plant: 0.99,
                cannabis_drug: 0.01,
                recreational_drugs_not_cannabis: 0.01,
            },
        },
    };

    const result = detector.detectProactive(sightEngineResponse);
    expect(result).toBe("Drug likelihood: 99%");
});

test("Cannabis ignored when option is chosen", () => {
    const detector = new DetectDrugs({
        Drugs_EnabledForProactive: true,
        Drugs_AllowCannabis: true,
        Drugs_Threshold: 80,
    });

    const sightEngineResponse: SightengineResponse = {
        status: "success",
        recreational_drug: {
            prob: 0.99,
            classes: {
                cannabis: 0.99,
                cannabis_logo_only: 0.01,
                cannabis_plant: 0.99,
                cannabis_drug: 0.01,
                recreational_drugs_not_cannabis: 0.01,
            },
        },
    };

    const result = detector.detectProactive(sightEngineResponse);
    expect(result).toBeUndefined();
});

test("Other drugs detected when Allow Cannabis is chosen", () => {
    const detector = new DetectDrugs({
        Drugs_EnabledForProactive: true,
        Drugs_AllowCannabis: true,
        Drugs_Threshold: 80,
    });

    const sightEngineResponse: SightengineResponse = {
        status: "success",
        recreational_drug: {
            prob: 0.99,
            classes: {
                cannabis: 0.01,
                cannabis_logo_only: 0.01,
                cannabis_plant: 0.01,
                cannabis_drug: 0.01,
                recreational_drugs_not_cannabis: 0.99,
            },
        },
    };

    const result = detector.detectProactive(sightEngineResponse);
    expect(result).toBe("Drug likelihood: 99%");
});
