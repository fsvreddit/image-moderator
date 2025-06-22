import { ALL_DETECTIONS } from "./allDetections.js";

test("All detections have unique names", () => {
    const uniqueNames = new Set();
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstace = new Detection({});
        uniqueNames.add(detectionInstace.name);
    }

    expect(uniqueNames.size).toBe(ALL_DETECTIONS.length);
});

test("All detections have unique friendly names", () => {
    const uniqueFriendlyNames = new Set();
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstace = new Detection({});
        uniqueFriendlyNames.add(detectionInstace.friendlyName);
    }

    expect(uniqueFriendlyNames.size).toBe(ALL_DETECTIONS.length);
});

test("All detections have unique sightengine types", () => {
    const uniqueSightengineTypes = new Set();
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstace = new Detection({});
        uniqueSightengineTypes.add(detectionInstace.sightengineType);
    }

    expect(uniqueSightengineTypes.size).toBe(ALL_DETECTIONS.length);
});

test("All detections' settings name start with module name", () => {
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstace = new Detection({});
        const settings = detectionInstace.getSettings().fields;
        for (const setting of settings) {
            if (setting.type === "group") {
                assert.fail(`Settings groups are not permitted, but were found in ${detectionInstace.name}.`);
            }
            expect(setting.name).toMatch(new RegExp(`^${detectionInstace.name}_`));
        }
    }
});
