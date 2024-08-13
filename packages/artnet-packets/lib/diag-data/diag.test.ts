import { describe, expect, test } from '@jest/globals';
import { ARTNET_PACKET_ID, OP_CODE, PROTOCOL_VERSION } from '../constants';
import { DiagDataPayload } from './diag-data.interface';
import { DiagData } from './diag-data';

describe('Diag packet test', () => {
  test('Diag packet encode-decode test', () => {
    const length = 10;
    const defaultPayload: DiagDataPayload = {
      protoVersion: PROTOCOL_VERSION,
      length,
      diagPriority: 11,
      filler1: 0,
      filler3: 0,
      logicalPort: 2,
      data: 'Test data',
    };

    const diagData = new DiagData(defaultPayload);
    const udpPacket = diagData.encode();
    const diagDataPayload = diagData.decode(udpPacket);

    expect(diagDataPayload).toEqual({
      ID: ARTNET_PACKET_ID,
      opCode: OP_CODE.DIAG_DATA,
      ...defaultPayload,
    });

    expect(DiagData.getDiagDataLength(udpPacket)).toBe(length);
  });

  test('Create Diag packet using udp packet', () => {
    const length = 10;
    const defaultPayload: DiagDataPayload = {
      protoVersion: PROTOCOL_VERSION,
      length,
      diagPriority: 11,
      filler1: 0,
      filler3: 0,
      logicalPort: 2,
      data: 'Test data',
    };

    const udpPacket = new DiagData(defaultPayload).encode();
    const newPacket = DiagData.create(udpPacket);

    expect(newPacket?.encode()).toEqual(udpPacket);
  });
});
