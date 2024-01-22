import { ThrowsException } from '../../types';
import { ArtNetDevice, ArtNetDeviceAction } from '../device.interface';
import { DeviceActionsValidationError } from '../../lib-error';
import { z, ZodSchema } from 'zod';
import {InjectLogger} from '../../logger';
import {LoggerInterface} from '../../logger/logger.interface';

export abstract class Device implements ArtNetDevice {
	@InjectLogger protected logger: LoggerInterface;
	protected readonly dxmData: number[];
	protected readonly api: ZodSchema;

	protected constructor(dmxDataSize: number = 512, api: ZodSchema) {
		this.dxmData = new Array(dmxDataSize).fill(0);
		this.api = api;
	}

	protected setChannel(channel: number, value: number) {
		if (channel > this.getDmxDataSize() - 1) {
			// FIXME: throw ArtNetLib error
			throw new Error(
				`Channel ${channel} exceeds max device channel ${this.getDmxDataSize() - 1} `,
			);
		}
		this.dxmData[channel] = Math.max(0, Math.min(value, 255));
		this.logger.info(`setChannel(${channel} => ${this.dxmData[channel]})`);
		return this;
	}

	protected validate(action: unknown) {
		const validate = this.api.safeParse(action);
		if (!validate.success) {
			throw new DeviceActionsValidationError(
				validate.error.errors.map((issue) => ({
					message: issue.message,
					instance: '',
				})),
			);
		}
	}

	protected is = <TSchema extends ZodSchema>(
		validator: TSchema,
		action: unknown,
	): action is z.infer<TSchema> => validator.safeParse(action).success;

	public getDmxData(): number[] {
		return [...this.dxmData];
	}

	public getDmxDataSize(): number {
		return this.dxmData.length;
	}

	public getName() {
		return this.constructor.name;
	}

	public abstract getSupportedApi(): string;
	public abstract setAction(action: ArtNetDeviceAction): ThrowsException<void>;
	public abstract setActions(actions: ArtNetDeviceAction[]): ThrowsException<void>;
}
