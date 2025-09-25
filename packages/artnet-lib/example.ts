import { ArtNetImpl, NodeStatusPayload } from './index';
import { DmxPacketPayload, PROTOCOL_VERSION } from '@rtf-dm/artnet-packets';

void (async () => {
  const artnet = new ArtNetImpl({
    discovery: {
      sendReply: true,
    },
  });

  await artnet.init();

  // Configure discovery reply IP address
  // When a node sends an ArtPoll packet, discovery will reply with the provided information
  // Multiple fields can be configured - refer to ArtPollReply packet definition
  artnet.discovery.setReplyInfo({
    ipAddress: '192.168.1.23'.split('.').map((oct) => parseInt(oct)),
  });

  const [node1] = await artnet.nodeManager.waitFor('NEW_NODE_REGISTERED');

  // Fires whenever node status or settings change
  artnet.nodeManager.addListener('NODE_STATUS_UPDATED', (payload: NodeStatusPayload) => {
    console.log(`Node updated: ${payload.name}`);
  });

  // Fires when a node doesn't respond to poll replies and is marked as dead
  artnet.nodeManager.addListener('NODE_IS_DEAD', (payload: NodeStatusPayload) => {
    console.log(`Node dead: ${payload.name}`);
  });

  // Wait to receive node updated event
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(1);
    }, 5000)
  );

  // Disable poll replies to demonstrate node dead event
  artnet.discovery.sendArtPollReply = false;

  // Wait to receive node dead event
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(1);
    }, 10000)
  );

  artnet.discovery.sendArtPollReply = true;

  // Create universe with devices:
  // MixPanel150 [index 0] - Generic [index 1] - MixPanel150 [index 2] - Generic [index 3]
  const universe = artnet.createUniverse('my-Universe', [
    { deviceDriver: 'Generic', numChannels: 5 },
    { deviceDriver: 'MixPanel150' },
    { deviceDriver: 'Generic', numChannels: 12 },
    { deviceDriver: 'Generic', numChannels: 2 },
  ]);

  if (!universe) return null; // Universe with name 'my-Universe' already exists

  // Configure devices implementing MixPanel150 interface
  universe.getDevice('MixPanel150').forEach((device) => {
    device.setBrightness({ percent: 100 });
    device.setLightMode({ mode: 'BOOST' });
  });

  // Access device at index 0 as Generic device
  universe.getDevice<'Generic'>(0)?.setChannels({
    channels: [1, 2, 3, 4, 0],
  });

  // Access device at index 1 as MixPanel150 device
  universe.getDevice<'MixPanel150'>(1)?.setGreenMagentaBias({
    bias: -5,
  });

  // Set single channel for Generic device at index 2
  // Device index represents physical order in DMX chain
  universe.getDevice<'Generic'>(2)?.setChannel(0, 255);

  // Set channels [0, 1] to values [100, 255] respectively
  universe.getDevice<'Generic'>(3)?.setChannels({
    channels: [100, 255],
  });

  // Attach universe to node port 0
  // The node will automatically update universe port when calling:
  // - Node::syncRemotePort() on node instance
  // - NodeManager::syncAllNodes()
  // Note: Method interface will change soon (node.name → node.macAddress)
  artnet.nodeManager.attachUniverse(node1.name, 0, universe);

  // Broadcast universe state to entire network
  // Use this API only for detached universes (not applicable for controlled universes)
  const sentBytes = await artnet.sendBroadcast(universe);
  console.log(`${sentBytes} bytes sent`);

  // Synchronize all attached universes across all nodes and ports
  const sentBytesArray = await artnet.nodeManager.syncAllNodes();

  // eslint-disable-next-line
  console.log(`${sentBytesArray} bytes sent`);

  const dmxPacketPayload: DmxPacketPayload = {
    protoVersion: PROTOCOL_VERSION,
    net: 6,
    length: 16,
    subNet: 1,
    sequence: 2,
    physical: 3,
    dmxData: new Array<number>(16).fill(255, 0, 16),
  };

  await artnet.dispose();
})().then(async () => {
  const artNet = new ArtNetImpl({
    discovery: {
      sendReply: true,
    },
  });

  await artNet.init();

  void artNet.nodeManager.waitFor('NEW_NODE_REGISTERED').then(async ([nodeInfo]) => {
    artNet.createUniverse('my_universe', [
      {
        deviceDriver: 'Generic',
        numChannels: 10,
      },
      {
        deviceDriver: 'Generic',
        numChannels: 10,
      },
    ]);

    // Broadcast action to all Generic devices in universe
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

    // Broadcast action to specific device at index 0
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

    // Configure node settings
    await artNet.nodeManager.getByMac(nodeInfo.macAddress)?.configure({
      netSwitch: 2, // Net address
      netSubSwitch: 12, // Subnet address
      swOut: [1, 2, 3, 4], // Output universes for ports
      longName: 'The Best ArtNet Node Ever', // Used as node name (some Wi-Fi dongles have issues with shortName)
      swIn: [1, 2, 3, 4], // Input universes for ports (configurable but currently unused)
    });

    // Attach universe to multiple node ports
    artNet.attachUniverse(nodeInfo.macAddress, 0, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 1, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 2, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 3, 'my_universe');

    // Multicast to attached nodes
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

    // Unicast to specific node
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

    await artNet.dispose();
  });
});
