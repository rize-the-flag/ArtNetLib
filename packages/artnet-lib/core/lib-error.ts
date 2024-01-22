import { ARTNET_ERROR_CODE } from './constants';
import { DeviceApiValidationError } from './device/device.interface';

export type ArtNetErrorCode = keyof typeof ARTNET_ERROR_CODE;

//todo: how about better error handling?
export class ArtNetLibError extends Error {
	public code: ArtNetErrorCode;

	constructor(code: ArtNetErrorCode, message?: string) {
		super(message);
		this.code = code;
	}
}

export class DeviceActionsValidationError extends ArtNetLibError {
	public validationErrors: DeviceApiValidationError[];
	constructor(validationErrors: DeviceApiValidationError[]) {
		super('ACTIONS_VALIDATION_ERROR');
		this.validationErrors = validationErrors;
	}
}
