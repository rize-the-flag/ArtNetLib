import {
    IPacketPayload,
    IPacketSchemaRecord,
} from '../../types'

export class PacketDecoder {
    private constructor() {}

    private static writeNumberToBuffer(
        buffer: Buffer,
        schemaRecord: IPacketSchemaRecord,
        numberValue: number,
        offset: number
    ): void {
        if (schemaRecord.length == 2) {
            schemaRecord.byteOrder === 'LE'
                ? buffer.writeUInt16LE(numberValue, offset)
                : buffer.writeUInt16BE(numberValue, offset)
        } else if (schemaRecord.length == 4) {
            schemaRecord.byteOrder === 'LE'
                ? buffer.writeUInt32LE(numberValue, offset)
                : buffer.writeUInt32BE(numberValue, offset)
        } else {
            buffer.writeUInt8(numberValue, offset)
        }
    }

    private static writeStringToBuffer(
        buffer: Buffer,
        schemeRecord: IPacketSchemaRecord,
        stringValue: string,
        offset: number
    ) {
        buffer.write(stringValue, offset, schemeRecord.length, 'ascii')
    }

    private static writeArrayToBuffer(buffer: Buffer, arrayValue: number[], offset: number) {
        for (const byte of arrayValue) {
            buffer.writeUInt8(byte, offset)
            offset++
        }
        return offset;
    }

    private static readNumberFromBuffer(
        buffer: Buffer,
        schemeRecord: IPacketSchemaRecord,
        offset: number
    ): number {
        let result;
        if (schemeRecord.length > 1) {
            schemeRecord.byteOrder === 'LE'
                ? result = buffer.readUint16LE(offset)
                : result = buffer.readUInt16BE(offset)
        } else {
            result = buffer.readUint8(offset)
        }
        return result
    }

    private static readStringFromBuffer(
        buffer: Buffer,
        schemeRecord: IPacketSchemaRecord,
        offset: number
    ): string {
        const nullTerminatedString = buffer.subarray(offset, offset + schemeRecord.length).toString()
        const lastIndex = nullTerminatedString.indexOf('\x00')
        return nullTerminatedString.substring(0, lastIndex !== -1 ? lastIndex : nullTerminatedString.length)
    }

    private static readArrayFromBuffer(
        buffer: Buffer,
        schemeRecord: IPacketSchemaRecord,
        offset: number
    ): number[] {
        return Array.from(buffer.subarray(offset, offset + schemeRecord.length))
    }

    static decode<T extends IPacketPayload, U extends Record<keyof T, IPacketSchemaRecord>>
    (buffer: Buffer, scheme: U, headerOffset: number): T {

        const packetPayload: IPacketPayload = {} as IPacketPayload
        let offset = headerOffset

        const payloadByteLength = Object.values(scheme)
            .reduce((previousValue, currentValue) => previousValue + currentValue.length, 0)

        if (payloadByteLength + headerOffset > buffer.length) throw new Error(`packet size mismatch`)

        for (const [key, value] of Object.entries(scheme)) {
            if (value.type === 'number') {
                packetPayload[key] = PacketDecoder.readNumberFromBuffer(buffer, value, offset)
            } else if (value.type === 'string') {
                packetPayload[key] = PacketDecoder.readStringFromBuffer(buffer, value, offset)
            } else if (value.type === 'array') {
                packetPayload[key] = PacketDecoder.readArrayFromBuffer(buffer, value, offset)
            }
            offset += value.length
        }
        return packetPayload as T
    }

    static encode<TPayload extends IPacketPayload, TSchema extends Record<keyof TPayload, IPacketSchemaRecord>>
    (payload: Partial<TPayload>, schema: TSchema): Buffer | never {

        const packetByteLength = Object.values(schema)
            .reduce((previousValue, currentValue) => previousValue + currentValue.length, 0)

        let packet: Buffer = Buffer.alloc(packetByteLength)
        let offset = 0

        for (const [key, schemeRecord] of Object.entries(schema)) {
            if (!(key in payload)) throw new Error(`Scheme key:[ ${key} ] doesn't exist in packet`)
            const payloadValue = payload[key]

            if (schemeRecord.type === 'number' && typeof payloadValue === 'number') {
                PacketDecoder.writeNumberToBuffer(packet, schemeRecord, payloadValue, offset)
                offset += schemeRecord.length
            } else if (schemeRecord.type === 'string' && typeof payloadValue === 'string') {
                PacketDecoder.writeStringToBuffer(packet, schemeRecord, payloadValue, offset)
                offset += schemeRecord.length
            } else if (schemeRecord.type === 'array' && Array.isArray(payloadValue)) {
                PacketDecoder.writeArrayToBuffer(packet, payloadValue, offset)
                offset += schemeRecord.length
            }
        }
        return packet
    }
}