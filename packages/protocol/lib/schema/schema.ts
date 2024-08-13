import { PacketPayload, PacketSchemaFromPayload, PacketSchemaPublic, PacketSchemaRecord2 } from '../types';

export class Schema<TPayload extends PacketPayload> {
  private schema: PacketSchemaFromPayload<TPayload>;
  constructor(schema: PacketSchemaPublic<TPayload>) {
    this.schema = new Map(structuredClone(schema));
  }

  setValue(key: keyof TPayload, value: PacketSchemaRecord2) {
    this.schema.set(key, value);
  }

  getValue(key: keyof TPayload) {
    return this.schema.get(key);
  }

  calcBytesInPacket() {
    return Array.from(this.schema.values()).reduce((prev, current) => {
      return current.type === 'array' ? prev + current.length * current.size : prev + current.length;
    }, 0);
  }

  public getOffsetOf(fieldName: keyof TPayload) {
    let count = 0;

    for (const [key, value] of this) {
      if (key === fieldName) {
        return count;
      }

      if (value.type === 'array') {
        count += value.length * value.size;
      } else {
        count += value.length;
      }
    }

    if (this.calcBytesInPacket() === count) return null;
    return count;
  }

  [Symbol.iterator]() {
    return this.schema.entries();
  }
}
