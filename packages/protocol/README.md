# Installation
`nmp i @rtf-dm/protocol`

## Simple and small package to describe packets 

## Usage:

```typescript
import {Packet, encode, decode, Schema} from "@rtf-dm/protocol";

//1. Describe your packet payload type:

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



/*2. Describe encoding schema:
*    Note that order of schema fields make sense! 
*    It means if 'ID' field first in array and have a length 5
*    first five bytes in packet will have value of 'ID' payload;
* */

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

//3. Create a new class that extends Packet class:
class TestPacket extends Packet<TestPacketPayload> {
    constructor(payload: TestPacketPayload) {
        super(payload, schema);
    }
}


const packet = new TestPacket({
    ID: 'TEST',
    numberField1b: 1,
    numberField2b: 1024,
    numberField4b: 123456,
    numberField2bBE: 0xffdd,
    numberField4bBE: 0xaabbccdd,
    arrayField1b: [0xfa, 0xfa, 0xfa, 0xfa],
    arrayField2bLe: [0xfffe, 0xfffe, 0xfffe, 0xfffe],
    arrayField2bBe: [0xfffe, 0xfffe, 0xfffe, 0xfffe],
    filler: 129, // align to
    filler2: 138,
    arrayField4bLe: [0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd],
    arrayField4bBe: [0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd, 0xfafbfcfd],
});


const buf = packet.encode();
const decoded = packet.decode(buf);

```

#### VER 0.5.12
- Fixed types.
- Added support for array encoding
- Added support for strings encoding ('utf8' and 'ascii' was tested other encodings not planned to be tested)
- Test coverage: 100% at that moment

