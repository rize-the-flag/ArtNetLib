import { PacketPayload, PacketSchemaFromPayload, PacketSchemaPublic, PacketSchemaRecord } from '../types';

export class Schema<TPayload extends PacketPayload> {
  private schema: PacketSchemaFromPayload<TPayload>;
  constructor(schema: PacketSchemaPublic<TPayload>) {
    this.schema = new Map(structuredClone(schema));
  }

  setValue(key: keyof TPayload, value: PacketSchemaRecord) {
    this.schema.set(key, value);
  }

  getValue(key: keyof TPayload) {
    return this.schema.get(key);
  }

  calcBytesInPacket() {
    return Array.from(this.schema.values()).reduce((prev, current) => prev + current.length, 0);
  }

  public getOffsetOf(fieldName: keyof TPayload) {
    let count = 0;

    for (const [key, value] of this) {
      if (key === fieldName) {
        return count;
      }
      count += value.length;
    }

    if (this.calcBytesInPacket() === count) return null;
    return count;
  }

  [Symbol.iterator]() {
    return this.schema.entries();
  }
}
