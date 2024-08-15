import { describe, expect, test } from '@jest/globals';
import { Packet } from './packet/packet';
import { Schema } from './schema/schema';

type TestPacketPayload = {
  ID: string;
  numberField1b: number;
  numberField2b: number;
  numberField4b: number;
  numberField2bBE: number;
  numberField4bBE: number;
  arrayField1b: number[];
  arrayField2bLe: number[];
  arrayField2bBe: number[];
  filler: number;
  filler2: number;
  arrayField4bLe: number[];
  arrayField4bBe: number[];
};

describe('Protocol package tests', () => {
  test('Extends Packet and encode-decode by given schema.', () => {
    class TestPacket extends Packet<TestPacketPayload> {
      constructor(payload: TestPacketPayload) {
        const schema = new Schema<TestPacketPayload>([
          ['ID', { length: 5, type: 'string', encoding: 'utf8' }],
          ['numberField1b', { length: 1, type: 'number' }],
          ['numberField2b', { length: 2, type: 'number', byteOrder: 'LE' }],
          ['numberField4b', { length: 4, type: 'number', byteOrder: 'LE' }],
          ['numberField2bBE', { length: 2, type: 'number', byteOrder: 'BE' }],
          ['numberField4bBE', { length: 4, type: 'number', byteOrder: 'BE' }],
          ['arrayField1b', { length: 4, type: 'array', size: 1 }],
          ['arrayField2bLe', { length: 4, type: 'array', size: 2, byteOrder: 'LE' }],
          ['arrayField2bBe', { length: 4, type: 'array', size: 2, byteOrder: 'BE' }],
          ['filler', { length: 1, type: 'number' }],
          ['filler2', { length: 1, type: 'number' }],
          ['arrayField4bBe', { length: 4, type: 'array', size: 4, byteOrder: 'BE' }],
          ['arrayField4bLe', { length: 4, type: 'array', size: 4, byteOrder: 'LE' }],
        ]);
        super(payload, schema);
      }
    }

    const payload: TestPacketPayload = {
      ID: 'TEST',
      numberField1b: 1,
      numberField2b: 1024,
      numberField4b: 123456,
      numberField2bBE: 0xffdd,
      numberField4bBE: 0xaabbccdd,
      arrayField1b: [0xea, 0xea, 0xea, 0xea],
      arrayField2bLe: [0xfffe, 0xfffe, 0xfffe, 0xfffe],
      arrayField2bBe: [0xfffe, 0xfffe, 0xfffe, 0xfffe],
      filler: 129, // align to
      filler2: 138,
      arrayField4bLe: [0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd],
      arrayField4bBe: [0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd],
    };

    const packet = new TestPacket(payload);
    const buf = packet.encode();
    const decoded = packet.decode(buf);
    expect(decoded).toEqual(payload);
  });
});
