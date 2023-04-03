import {JSONSchemaType} from "ajv";
import {API} from "./types";

const apiSchema: JSONSchemaType<Partial<API>> = {
    type: "object",
    properties: {
        setBrightness: {
            type: "object",
            nullable: true,
            properties: {
                percent: {
                    type: "number",
                    maximum: 100,
                    minimum: 0
                }
            },
            required: [
                "percent"
            ]
        },
        setColorTemperature: {
            type: "object",
            nullable: true,
            properties: {
                kelvins: {
                    type: "number",
                    maximum: 7500,
                    minimum: 2700
                }
            },
            required: [
                "kelvins"
            ]
        },
        setGreenMagentaBias: {
            type: "object",
            nullable: true,
            properties: {
                bias: {
                    type: "number",
                    maximum: 50,
                    minimum: -50
                }
            },
            required: [
                "bias"
            ]
        },
        setHUE: {
            type: "object",
            nullable: true,
            properties: {
                degrees: {
                    type: "number",
                    maximum: 360,
                    minimum: 0
                }
            },
            required: [
                "degrees"
            ]
        },
        setLightDiffuser: {
            type: "object",
            nullable: true,
            properties: {
                diffuserMode: {
                    type: "string",
                    enum: ['HARD', 'SOFT']
                }
            },
            required: [
                "diffuserMode"
            ]
        },
        setSaturation: {
            nullable: true,
            type: "object",
            properties: {
                percent: {
                    type: "number",
                    maximum: 100,
                    minimum: 0
                }
            },
            required: [
                "percent"
            ]
        },
        setLightMode: {
            nullable: true,
            type: "object",
            properties: {
                lightMode: {
                    type: "string",
                    enum: ["NORMAL", "BOOST", "SILENT"]
                }
            },
            required: [
                "lightMode"
            ]
        },
        runCCTLoop: {
            nullable: true,
            type: "object",
            properties: {
                fromCCT: {
                    type: "number",
                    maximum: 7500,
                    minimum: 2500
                },
                toCCT: {
                    type: "number",
                    maximum: 7500,
                    minimum: 2500
                },
                speed: {
                    type: "number",
                    maximum: 255,
                    minimum: 0
                },
                direction: {
                    type: "string",
                    enum: ["ONE_WAY", "BACK_AND_FORCE"]
                }
            },
            required: [
                "fromCCT",
                "toCCT",
                "speed",
                "direction"
            ]
        },
    },
    additionalProperties: false
};

export default apiSchema;