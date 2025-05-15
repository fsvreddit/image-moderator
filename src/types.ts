export interface SightengineResponse {
    status: string;
    request: {
        id: string;
        timestamp: number;
        operations: number;
    };
    type: {
        ai_generated?: number;
        ai_generators?: {
            other?: number;
            firefly?: number;
            gan?: number;
            recraft?: number;
            dalle?: number;
            gpt40?: number;
            reve?: number;
            midjourney?: number;
            stable_diffusion?: number;
            flux?: number;
            imagen?: number;
            ideogram?: number;
        };
    };
}
