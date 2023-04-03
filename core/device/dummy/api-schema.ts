import {JSONSchemaType} from "ajv";
import {DummyDeviceApi} from "./types";

export const api: JSONSchemaType<DummyDeviceApi> = {
    type: 'object',
    properties: {
        setChannels: {
            type: "object",
            properties: {
                channels: {
                    type: 'array',
                    items: {
                        type: 'number'
                    }
                }
            },
            required: ['channels'],
            additionalProperties: false
        },
    },
    required: ['setChannels'],
    additionalProperties: false
}
