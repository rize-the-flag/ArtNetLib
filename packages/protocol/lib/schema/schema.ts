import { PacketPayload, PacketSchemaFromPayload, PacketSchemaPublic, PacketSchemaRecord } from '../types';

function isRecordWithLength(x: unknown): x is 'array' | 'string' {
  return (
    !!x && typeof x === 'object' && 'type' in x && typeof x.type === 'string' && ['array', 'string'].includes(x.type)
  );
}

export class Schema<TPayload extends PacketPayload> {
  private schema: PacketSchemaFromPayload<TPayload>;
  constructor(schema: PacketSchemaPublic<TPayload>) {
    this.schema = new Map(structuredClone(schema));
  }

  setValue(key: keyof TPayload, value: PacketSchemaRecord) {
    this.schema.set(key, value);
  }

  getValue<T extends keyof TPayload>(key: keyof TPayload) {
    return this.schema.get(key);
  }

  calcBytesInPacket() {
    return Array.from(this.schema.values()).reduce((prev, current) => {
      return isRecordWithLength(current) ? prev + current.length * current.size : prev + current.size;
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
        count += value.size;
      }
    }

    if (this.calcBytesInPacket() === count) return null;
    return count;
  }

  [Symbol.iterator]() {
    return this.schema.entries();
  }
}
