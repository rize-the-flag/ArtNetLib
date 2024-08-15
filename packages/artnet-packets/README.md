![Logo](https://svetovik.info/uploads/default/original/2X/a/ac6c237d7d511820d297f43b0d1682b66010e1de.png)

# Installation
`nmp i @rtf-dm/artnet-packets`

## ArtNet-Packets it's a package that contains Classes that implements low level ArtNet protocol packets

## How to use:

```typescript
import {Poll, PollReply} from "@rtf-dm/artnet-packets";
import {Dmx} from "@rtf-dm/artnet-packets";
import {PROTOCOL_VERSION, DIAG_PRIORITY, ARTNET_PORT} from "@rtf-dm/artnet-packets";
import {Socket} from "dgram";

socket = dgram.createSocket({type: 'udp4', reuseAddr: true});

const pollPacket = new Poll({
    protoVersion: PROTOCOL_VERSION,
    diagPriority: DIAG_PRIORITY.DpLow,
    flags: 0b00000110,
    targetPortAddressTop: 0,
    targetPortAddressBottom: 0,
});

const dmxPacket = new Dmx({
    protoVersion: PROTOCOL_VERSION,
    net: 0,
    length: 10,
    subNet: 0,
    sequence: 0,
    physical: 0,
    dmxData: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 255
    ],
});

pollPacket.setDiagnosticsPolicy('BROADCAST');

await socket.send(pollPacket.encode(), ARTNET_PORT, '0.0.0.0') // sending a broadcast poll packet to trigger ArtNet node reply with poll reply

socket.on('message', (data: Buffer, remoteInfo: RemoteInfo) => {
    if (PollReply.is(data)) {
        const pollReply = PollReply.create(data); // new instance of poll reply
        const pollReplyPayload = new PollReply().decode(data) // poll reply payload

        console.log(`remote node response with PollReply`);
        console.dir(remoteInfo);
        console.dir(pollReply);
        console.dir(pollReplyPayload);

        const dmxUdpPacket: Buffer = dmxPacket.encode();

        socket.send(dmxUdpPacket, ARTNET_PORT, remoteInfo.address)
    }
})





```

## VER: 0.5.12
- Implemented packets:
  - ArtAddress (Address) - `no tests`
  - ArtCommand (Command) - `covered with tests`
  - ArtDiagData (DiagData) - `covered with tests`
  - ArtDmx (Dmx) - `covered with tests`
  - ArtIpProg - `covered with tests`
  - ArtPoll (Poll) - `covered with tests`
  - ArtPollReply (PollReply) - `covered with tests`
  - ArtSync (Sync) - `no tests`


Information about protocol and how to work with ArtNet: https://art-net.org.uk/
