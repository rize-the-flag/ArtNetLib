![Logo](https://svetovik.info/uploads/default/original/2X/a/ac6c237d7d511820d297f43b0d1682b66010e1de.png)

# Installation

`npm i @rtf-dm/artnet-lib`

# ArtNet-lib

#### ArtNet-lib is a flexible Node.js library written on `TS` that implements part of `ArtNet` protocol `version 14`. You can easily control `DMX512` devices, detect and configure ArtNet nodes in your network.

# Contact information

- For any questions or suggestions about adding new device drivers in to a library, please contact with me by `dev.denism@yandex.ru`
- Right now, library development under private GitHub repository. It may be changed in the future.
- Library is under active development process (Since it is part of a more complex system), so sometimes it may work unstably (sorry). However, I don't have a plans to change core functionality

## Quick start guide

### Initialize artnet library:

```typescript
/*
You don't need to pass connection information by default.
However due to different network configurations, some times sending limited broadcast restricted.
So to calculate correct broadcast address you have to pass correct ip and netmask of your network
*/
const artNet = new ArtNetImpl({
  discovery: {
    sendReply: true, // or false
  },
  network: {
    networkIp: '192.168.0.1',
    networkMask: '255.255.255.0',
    port: ARTNET_PORT,
  },
});

await artNet.init();
```

### Wait for some ArtNet node reply on a discovery packet.

When you receive `NEW_NODE_REGISTERED` `nodeManager` automatically creates a new ArtNet node instance.

```typescript
const [node1] = await artNet.nodeManager.waitFor('NEW_NODE_REGISTERED');
//or you can add event listener to 'NEW_NODE_REGISTERED' message
artNet.nodeManager.addListener('NEW_NODE_REGISTERED', (payload) => {
  console.log(payload.name, payload.macAddress, payload.ipAddress, payload.lastResponseTime, payload.nodePortsInfo);
});
```

### Create a _`Universe`_ instance and add a devices.

As for now, there are only 2 drivers present `MixPanel150` for a specific device
and `Generic` driver that allows you to control any DMX512 compatible device.
The easiest way is to use a `Generic` driver and pass the number of channels captured by device.
However, adding a new specialized driver is the best way to control devices.

```typescript
//Create Universe with name 'my-Universe' with precreated list of Devices
const verse = artnet.createUniverse('my-Universe', [
  { deviceName: 'Generic', numChannelsCaptured: 5 },
  { deviceName: 'MixPanel150' }, // there is no need set captured channels count since we know that mixpanel150 capture 12 channels
  { deviceName: 'Generic', numChannelsCaptured: 10 },
  { deviceName: 'MixPanel150' },
]);

// Or create device manually and add it to Universe

const device = artNet.createDevice('Generic', 10);
verse.add(device);
// or set it instead of existing device
verse.setDevice(3, device);
```

### Set device action to configure DMX512 data for your device attached to detected ArtNet Node.

You can perform the same command for all devices with the same driver or only for one device in a `DMX chain`
addressed by your `universe`.

```typescript
verse.getDevice('Generic').forEach((device) => {
  device.setAction({
    actionName: 'setChannels',
    parameters: {
      channels: [
        10, //channel 0
        25, //channel 1
        32, //...
        43,
        255,
      ],
    },
  });
});
```

```typescript
verse.getDevice<'Generic'>(0)?.setChannel(10, 255);
verse.getDevice<'MixPanel150'>(1)?.setBrightness({
  percent: 100,
});
```

### Update port info of detached `universe`

By default, created universe is `detached`.
It means that you will be responsible for providing the correct port address to this universe.
If the target `node` has a `port address` _`net: 0, subnet: 0, universe: 12`_, you should update `universe` address.

```typescript
verse.update(
  0, // - net,
  0, // - subnet,
  12 // - Universe
);
```

### Attach universe to node

You can attach a created universe to node port and node automatically update universe address

```typescript
// attach a created Universe to a specific node port
artnet.nodeManager.attachUniverse(node1.name /*name of existed node*/, 0 /*port*/, verse);
```

### Send a universe

After configuration, you can send an attached universe.

```typescript
await artnet.sendBroadcast(verse); //Broadcast Universe to all nodes with the same port address
await artnet.nodeManager.syncAllNodes(); // Multicast universes to all Node. All nodes subscribed to Universe will updated the state of remote DMX chain
await artnet.nodeManager.getByMac(node1.macAddress).syncRemotePort(verse, 0); // Unicast Universe to specific node and port
```

### Configure Artnet node

```typescript
await artNet.nodeManager.getByMac(nodeInfo.macAddress)?.configure({
  netSwitch: 2, // Net
  netSubSwitch: 12, //Subnet
  swOut: [1, 2, 3, 4], // Out universes for ports
  longName: 'The Best ArtNet node ever', // Long name is used as node-name in a library since some ArtNet Wi-Fi dongles have a lot of buggs with shortName
  swIn: [1, 2, 3, 4], // In universes for ports (could be configured but currently unused)
});
```

- Full example

```typescript
(async () => {
  const artnet = new ArtNetImpl({
    discovery: {
      sendReply: true,
    },
  });

  await artnet.init();

  const [node1] = await artnet.nodeManager.waitFor('NEW_NODE_REGISTERED');

  // Each time when node status or settings changed, 'NODE_STATUS_UPDATED' event fired
  artnet.nodeManager.addListener('NODE_STATUS_UPDATED', (payload) => console.log(`node updated: ${payload.name}`));

  // When node didn't response with poll reply for some time, it marked as dead and 'NODE_IS_DEAD' event fired;
  artnet.nodeManager.addListener('NODE_IS_DEAD', (payload) => console.log(`node dead: ${payload.name}`));

  await new Promise((resolve) => setTimeout(() => resolve(1), 5000)); //Timeout to get node updated event

  artnet.discovery.sendArtPollReply = false; //disable reply on poll to demonstrate node dead event;

  await new Promise((resolve) => setTimeout(() => resolve(1), 10000)); //Timeout to get node dead event

  artnet.discovery.sendArtPollReply = true;

  //Add Devices to created Universe mixpanel150 ([index 0]) - Generic ([index 1]) - MixPanel150 ([index 2]) - Generic([index 3]) ... e.t.c.
  const verse = artnet.createUniverse('my-Universe', [
    { deviceName: 'Generic', numChannelsCaptured: 5 },
    { deviceName: 'MixPanel150' },
    { deviceName: 'Generic', numChannelsCaptured: 12 },
    { deviceName: 'Generic', numChannelsCaptured: 2 },
  ]);

  if (!verse) return null; //Universe with the name 'my-Universe' already exists;

  //Set action for device group which implemented 'MixPanel150' interface and call api
  verse.getDevice('MixPanel150').forEach((device) => {
    device.setBrightness({ percent: 100 });
    device.setLightMode({ mode: 'BOOST' });
  });

  //Get a device by index 0 and assume it as a 'Generic' device
  verse.getDevice<'Generic'>(0)?.setChannels({
    channels: [1, 2, 3, 4, 0],
  });

  //Get a device by index 1 and assume it as 'MixPanel150' device
  verse.getDevice<'MixPanel150'>(1)?.setGreenMagentaBias({
    bias: -5,
  });

  // Set a single channel for a generic device with index 2 (Device index is a physical device order in DMX chain)
  verse.getDevice<'Generic'>(2)?.setChannel(0, 255);

  // Set channels [0, 1] to values [100, 255] respectively
  verse.getDevice<'Generic'>(3)?.setChannels({
    channels: [100, 255],
  });

  // Attach a created universe to node port 0.
  // This node will automatically update universe port when you call Node::syncRemotePort method of node instance
  // or when you call NodeManager::syncAllNodes()
  // Interface of this method will be changed in the nearest future (node.name => node.macAddress)
  artnet.nodeManager.attachUniverse(node1.name, 0, verse);

  // Broadcast a universe devices state to entire network.
  // Use this api only for detached universes. Since for controlled universes this doesn't make sense
  const sentBytes = await artnet.sendBroadcast(verse);

  console.log(`${sentBytes} bytes was sent`);

  //Send all attached universes of all nodes and all ports
  const sentBytesArray = await artnet.nodeManager.syncAllNodes();
  console.log(`${sentBytesArray} bytes was sent`);

  await artnet.dispose();
})();
```

### It's possible to use High level API of ArtNetImpl instance to perform operations on DMX devices

```typescript
(async () => {
  const artNet = new ArtNetImpl({
    discovery: {
      sendReply: true, //Only for debug purposes... automaticaly send reply to any poll messages
    },
  });

  //Init library
  await artNet.init();

  //Waiting for the artnet node
  artNet.nodeManager.waitFor('NEW_NODE_REGISTERED').then(async ([nodeInfo]) => {
    //Create Universe 'my_universe', and add Devices
    artNet.createUniverse('my_universe', [
      {
        deviceName: 'Generic',
        numChannelsCaptured: 10,
      },
      {
        deviceName: 'Generic',
        numChannelsCaptured: 10,
      },
    ]);

    // Broadcast Universe 'my_universe' and set actions for group of Devices that implements Generic interface
    await artNet.broadcastUniverse({
      type: 'Group',
      universeName: 'my_universe',
      deviceGroup: 'Generic',
      action: {
        actionName: 'setChannel',
        parameters: {
          channel: 5,
          value: 10,
        },
      },
    });

    // Broadcast Universe 'my_universe' and set actions for device wit index 0 in Universe.
    await artNet.broadcastUniverse({
      type: 'Exact',
      universeName: 'my_universe',
      deviceIndex: 0,
      action: {
        actionName: 'setChannel',
        parameters: {
          channel: 5,
          value: 10,
        },
      },
    });

    // Attach Universe to detected node ports [1,2,3,4] ....
    // The Universe can be attached to numerous nodes
    artNet.attachUniverse(nodeInfo.macAddress, 0, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 1, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 2, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 3, 'my_universe');

    //Muliticast attached to nodes universes
    await artNet.multicastUniverse({
      type: 'Group',
      universeName: 'my_universe',
      deviceGroup: 'Generic',
      action: {
        actionName: 'setChannel',
        parameters: {
          channel: 5,
          value: 10,
        },
      },
    });

    //Unicast Universe to node with specific macAddress
    await artNet.unicastUniverse(nodeInfo.macAddress, {
      type: 'Group',
      universeName: 'my_universe',
      deviceGroup: 'Generic',
      action: {
        actionName: 'setChannel',
        parameters: {
          channel: 5,
          value: 10,
        },
      },
    });

    //cleanup
    await artNet.dispose();
  });
})();
```

## Change log

#### VER 1.5.16

- Move artnet packets to separate package @rtf-dm/artnet-packets
  - Added create() method to each packet 
- Different fixes in types

#### VER 1.2.0

- ADD: ArtNetImpl::enumerateInterfacesInfo(): { address: string, netmask: string, mac: string } - returns available interfaces for connection
- FIX: ArtNetImpl::changeNetwork() method works correctly now. Listening to udp packets only on target ip and port.
- FIX: Discovery correct updating of polling intervals (Restart no needed).

#### VER 1.1.28

- ADD: Detailed comments in readme
- ADD: Example.ts
- ADD: Logs for some methods

#### VER 1.1.25

- FIX - remove .map files

#### VER 1.1.24

- ADD: To setup lib debug output set DEV=1 environment variable
- CLEANUP: Remove unnecessary logs...

#### VER 1.1.22

- FIX: NodeManager will send only one "NODE_IS_DEAD" message
- FIX: Added some missing imports to root index.js
- Disable Logs for production
