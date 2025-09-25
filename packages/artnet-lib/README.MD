![Logo](https://svetovik.info/uploads/default/original/2X/a/ac6c237d7d511820d297f43b0d1682b66010e1de.png)

# ArtNet-Lib

**ArtNet-Lib** is a flexible Node.js library written in TypeScript that implements part of the **ArtNet protocol version 14**. It enables easy control of DMX512 devices, discovery, and configuration of ArtNet nodes in your network.

## 📦 Installation

```bash
npm i @rtf-dm/artnet-lib
```

## 🚀 Quick Start

### Basic Initialization

```ts
import { ArtNetImpl } from '@rtf-dm/artnet-lib';

const artNet = new ArtNetImpl({
  discovery: {
    sendReply: true, // Library will respond to ArtPoll requests
  },
});

await artNet.init();
```

### Nodes Discovery

```ts
// Wait for new device to appear in the network
const [node] = await artNet.nodeManager.waitFor('NEW_NODE_REGISTERED');

// Or via event handler
artNet.nodeManager.addListener('NEW_NODE_REGISTERED', (payload) => {
  console.log('Device discovered:', payload.name);
});
```

## 🎯 Key Features

### 🔍 Automatic Device Discovery

> - #### Search for ArtNet nodes in local network
> - #### Device status tracking (online/offline)
> - #### Automatic node information updates

## 🌌 DMX Universe Management

> - #### Create virtual universes for device grouping
> - #### Support for various device drivers
> - #### Flexible DMX channel control

## 💡 Supported Drivers

> - #### Generic — universal driver for any DMX devices
> - #### MixPanel150 — specialized driver for specificequipment
> - #### Custom driver development support

## 📡 Multiple Data Transmission Methods

> - #### Broadcast — network-wide transmission
> - #### Multicast — group transmission
> - #### Unicast — targeted transmission to specific Node

## 📚 Usage Examples

> ### Creating and Configuring a Universe

```ts
// Create universe with devices
const universe = artNet.createUniverse('my-universe', [
  { deviceName: 'Generic', numChannelsCaptured: 5 },
  { deviceName: 'MixPanel150' },
  { deviceName: 'Generic', numChannelsCaptured: 10 },
]);

// Device control
universe.getDevice('MixPanel150').forEach((device) => {
  device.setBrightness({ percent: 100 });
});

universe.getDevice<'Generic'>(0)?.setChannels({
  channels: [255, 128, 64, 32, 16],
});
```

> ### Attaching Universe to Node

```ts
// Attach universe to node port
artNet.nodeManager.attachUniverse(node.macAddress, 0, universe);

// Send data
await artNet.nodeManager.syncAllNodes();
```

> ### Advanced Node Configuration

```ts
await artNet.nodeManager.getByMac(node.macAddress)?.configure({
  netSwitch: 2,
  netSubSwitch: 12,
  swOut: [1, 2, 3, 4],
  longName: 'My Lighting Setup',
});
```

## 🏗️ Library Architecture

### Core Components:

> #### ArtNetImpl — main library class

> #### NodeManager — managed discovered devices

> #### Discovery — device discovery mechanism

> #### Universe — virtual DMX universes

> #### Device — DMX device abstraction

### Data Transmission Types:

> #### broadcastUniverse() — broadcast transmission

> #### multicastUniverse() — multicast transmission

> #### unicastUniverse() — unicast to specific device

## 🔧 Advanced Configuration

### Network Settings

```ts
const artNet = new ArtNetImpl({
  discovery: { sendReply: true },
  network: {
    networkIp: '192.168.0.1',
    networkMask: '255.255.255.0',
    port: 6454, // Standard ArtNet port
  },
});
```

### Device Event Handling

```ts
artNet.nodeManager.addListener('NODE_STATUS_UPDATED', (payload) => {
  console.log('Device updated:', payload.name);
});

artNet.nodeManager.addListener('NODE_IS_DEAD', (payload) => {
  console.log('Device unavailable:', payload.name);
});
```

## 📋 Complete Usage Example

```ts
import { ArtNetImpl } from '@rtf-dm/artnet-lib';

void (async () => {
  const artNet = new ArtNetImpl({ discovery: { sendReply: true } });
  await artNet.init();

  // Wait for device
  const [node] = await artNet.nodeManager.waitFor('NEW_NODE_REGISTERED');

  // Create universe
  const universe = artNet.createUniverse('demo', [
    { deviceName: 'Generic', numChannelsCaptured: 8 },
    { deviceName: 'MixPanel150' },
  ]);

  // Configure devices
  universe.getDevice('MixPanel150').forEach((device) => {
    device.setBrightness({ percent: 75 });
  });

  // Attach and synchronize
  artNet.attachUniverse(node.macAddress, 0, universe);
  await artNet.multicastUniverse({
    type: 'Group',
    universeName: 'demo',
    deviceGroup: 'Generic',
    action: {
      actionName: 'setChannel',
      parameters: { channel: 0, value: 255 },
    },
  });

  await artNet.dispose();
})();
```

## 🔄 Changelog

### Version 1.6.11

##### Minor fixes in readme and examples

### Version 1.6.2

##### Protocol package refactoring

##### Package version updates

### Version 1.6.0

##### Preparation for 2-byte DMX channel support

##### ArtNet packet library updates

### Version 1.5.16

##### ArtNet packets moved to separate package @rtf-dm/artnet-packets

##### Added create() method for each packet

### Version 1.2.0

##### Added ArtNetImpl::enumerateInterfacesInfo()

##### Fixed ArtNetImpl::changeNetwork() method

##### Fixed discovery polling interval updates

### Version 1.1.28

##### Added detailed README comments

##### Added example file

##### Added method logs
