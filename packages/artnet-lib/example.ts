import { ArtNetImpl, NodeStatusPayload } from './index';
import { Command, Dmx, DmxPacketPayload, PROTOCOL_VERSION } from '@rtf-dm/artnet-packets';

void (async () => {
  const artnet = new ArtNetImpl({
    discovery: {
      sendReply: true,
    },
  });

  await artnet.init();

  // Setup discovery reply ip address (When some node sends an art-poll packet, discovery will reply with info provided to this method)
  // There are a lot of fields that could be set.
  // Refer to ArtPollReply packet definition;
  artnet.discovery.setReplyInfo({
    ipAddress: '192.168.1.23'.split('.').map((oct) => parseInt(oct)),
  });

  const [node1] = await artnet.nodeManager.waitFor('NEW_NODE_REGISTERED');

  // Each time when node status or settings changed, 'NODE_STATUS_UPDATED' event fired
  artnet.nodeManager.addListener('NODE_STATUS_UPDATED', (payload: NodeStatusPayload) => {
    console.log(`node updated: ${payload.name}`);
  });

  // When node didn't response with poll reply for some time, it marked as dead and 'NODE_IS_DEAD' event fired;
  artnet.nodeManager.addListener('NODE_IS_DEAD', (payload: NodeStatusPayload) => {
    console.log(`node dead: ${payload.name}`);
  });

  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(1);
    }, 5000)
  ); //Timeout to get node updated event

  artnet.discovery.sendArtPollReply = false; //disable reply on poll to demonstrate node dead event;

  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(1);
    }, 10000)
  ); //Timeout to get node dead event

  artnet.discovery.sendArtPollReply = true;

  //Add Devices to created Universe mixpanel150 ([index 0]) - Generic ([index 1]) - MixPanel150 ([index 2]) - Generic([index 3]) ... e.t.c.
  const verse = artnet.createUniverse('my-Universe', [
    { deviceDriver: 'Generic', numChannels: 5 },
    { deviceDriver: 'MixPanel150' },
    { deviceDriver: 'Generic', numChannels: 12 },
    { deviceDriver: 'Generic', numChannels: 2 },
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

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`${sentBytes} bytes was sent`);

  //Send all attached universes of all nodes and all ports
  const sentBytesArray = await artnet.nodeManager.syncAllNodes();
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`${sentBytesArray} bytes was sent`);

  const dmxPacketPayload: DmxPacketPayload = {
    protoVersion: PROTOCOL_VERSION,
    net: 6,
    length: 16,
    subNet: 1,
    sequence: 2,
    physical: 3,
    dmxData: new Array<number>(16).fill(255, 0, 16),
  };

  await artnet.communicator.sendBroadcast(
    new Command({
      data: 'SOSI HUI',
      length: 'SOSI HUI'.length,
    }).encode()
  );

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

    await artNet.nodeManager.getByMac(nodeInfo.macAddress)?.configure({
      netSwitch: 2, // Net
      netSubSwitch: 12, //Subnet
      swOut: [1, 2, 3, 4], // Out universes for ports
      longName: 'The Best ArtNet node ever', // Long name is used as node-name in a library since some ArtNet Wi-Fi dongles have a lot of buggs with shortName
      swIn: [1, 2, 3, 4], // In universes for ports (could be configured but currently unused)
    });

    artNet.attachUniverse(nodeInfo.macAddress, 0, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 1, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 2, 'my_universe');
    artNet.attachUniverse(nodeInfo.macAddress, 3, 'my_universe');

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
