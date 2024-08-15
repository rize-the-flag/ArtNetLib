import { Node } from './node';
import { Communicator } from '../communicator/communicator.interface';
import { DEFAULT_NODE_WATCHER_INTERVAL_MS, NODE_DEATH_TIMEOUT_MS } from '../constants';
import { NodeManagerEvents } from './node-manager.interface';
import { Universe } from '../universe/universe';
import { ArtNetLibError } from '../lib-error';
import { Log } from '../logger';
import { TypedEmitter } from '@rtf-dm/typed-emitter';
import { clearInterval } from 'timers';
import { AddressPacketPayload, PollReplyPacketPayload } from '@rtf-dm/artnet-packets';

export class NodeManager extends TypedEmitter<NodeManagerEvents> {
  protected readonly nodes: Node[] = [];
  private nodeWatcherId: NodeJS.Timer;
  private nodeDeathTimeout: number = NODE_DEATH_TIMEOUT_MS;

  /**
   * Create a new instance of node manager .
   * @constructor
   * @param {Communicator} communicator - Communicator interface.
   */
  constructor(private readonly communicator: Communicator) {
    super();
    this.communicator = communicator;
    this.watchNodes();
  }

  private watchNodes(
    watchInterval: number = DEFAULT_NODE_WATCHER_INTERVAL_MS,
    nodeDeathTimout: number = NODE_DEATH_TIMEOUT_MS
  ): void {
    this.nodeDeathTimeout = nodeDeathTimout;
    this.nodeWatcherId = setInterval(() => {
      const now = new Date().getTime();

      const deadNodes = this.get(
        (node) => node.lastResponseTime.getTime() + this.nodeDeathTimeout <= now && node.isAlive
      );

      deadNodes.forEach((node) => (node.isAlive = false));

      deadNodes.forEach((node) => {
        this.emit('NODE_IS_DEAD', {
          name: node.name,
          ipAddress: node.ipAddress,
          macAddress: node.macAddress,
          lastResponseTime: node.lastResponseTime,
          portInfo: node.portInfo,
          isAlive: node.isAlive,
        });
      });
    }, watchInterval);
  }

  private addNode(polReplyPayload: PollReplyPacketPayload): Node {
    const node = new Node(polReplyPayload, this.communicator);

    this.nodes.push(node);

    this.emit('NEW_NODE_REGISTERED', {
      name: node.name,
      ipAddress: node.ipAddress,
      macAddress: node.macAddress,
      lastResponseTime: node.lastResponseTime,
      portInfo: node.portInfo,
      isAlive: node.isAlive,
    });

    return node;
  }

  private updateNode(polReplyPayload: PollReplyPacketPayload): Node | null {
    const node = this.getByMac(polReplyPayload.macAddress.join('.'));
    if (!node) return null;

    node.update(polReplyPayload);
    node.isAlive = true;

    this.emit('NODE_STATUS_UPDATED', {
      name: node.name,
      ipAddress: node.ipAddress,
      macAddress: node.macAddress,
      lastResponseTime: node.lastResponseTime,
      portInfo: node.portInfo,
      isAlive: node.isAlive,
    });

    return node;
  }

  /**
   *
   * @param {number} timeoutMs
   */
  public updateNodeDeathTimeout(timeoutMs: number = NODE_DEATH_TIMEOUT_MS): number {
    this.nodeDeathTimeout = timeoutMs;
    return this.nodeDeathTimeout;
  }

  /**
   * Either update existing or creating a new ArtNet Node and return it.
   * @method
   * @param {PollReplyPacketPayload} polReplyPayload - the decoded ArtPollReply payload.
   * @return {Node}
   */
  public addOrUpdateNode(polReplyPayload: PollReplyPacketPayload): Node {
    return this.updateNode(polReplyPayload) ?? this.addNode(polReplyPayload);
  }

  /**
   * Return's arrays of registered nodes which are satisfying the condition Callback.
   * @method
   * @param {(node: Node) => boolean}  predicate - optional callback function.
   * Returns all detected nodes, if callback function is undefined.
   * @return {Array<Node>}
   */
  public get(predicate?: (node: Node) => boolean): Node[] {
    if (!predicate) return this.nodes.slice();

    return this.nodes.filter(predicate);
  }

  /**
   * Return's 1-st node which is satisfies ArtPollReply['shortName'] === nodeName.
   * @method
   * @param {string} nodeName - nodeName is exactly equal to field ArtPollReply.shortName in ArtPollReply packet.
   * @return {node | null}
   */
  public getByName(nodeName: string): Node | null {
    const node = this.get((node) => nodeName === node.name).pop();
    if (node) return node;

    return null;
  }

  /**
   * Return's 1-st node which is satisfies ArtPollReply['ipAddress'] === nodeIp.
   * @method
   * @param {string} nodeIp - is exactly equal to the field ArtPollReply.ipAddress of ArtPollReply packet.
   * @return {node | null}
   */
  public getByIp(nodeIp: string) {
    const node = this.get((node) => node.ipAddress === nodeIp).pop();
    if (node) return node;

    return null;
  }

  /**
   * Return's 1-st node which is satisfies ArtPollReply['macAddress'] === nodeMac.
   * @method
   * @param {string} nodeMac - is exactly equal to the field ArtPollReply.ipAddress of ArtPollReply packet.
   * @return {node | null}
   */
  public getByMac(nodeMac: string) {
    const node = this.get((node) => node.macAddress === nodeMac).pop();
    if (node) return node;

    return null;
  }

  /**
   * Remove nodes according to results of callback function
   * Note that removed nodes will appear again as discovery found them in the entire network.
   * @method
   * @param {(node: Node) => boolean} predicate - callback function.
   * @return {node | null}
   */
  public removeNodes(predicate: (node: Node) => boolean): Node[] {
    const removedNodes: Node[] = [];

    for (const node of this.nodes) {
      if (predicate(node)) {
        removedNodes.push(...this.nodes.splice(this.nodes.indexOf(node), 1));
      }
    }

    return removedNodes;
  }

  public async configureNode(nodeName: string, config: Partial<AddressPacketPayload>) {
    const node = this.getByName(nodeName);

    if (!node) {
      throw new ArtNetLibError('NODE_NOT_FOUND');
    }

    return node.configure(config);
  }

  /**
   * Attach a Universe on existing node.
   * @method
   * @param {string} nodeName - Target node name
   * @param {number} port - Target node port
   * @param {Universe} universe - The Universe that will be attached to node
   * @return {Universe: Universe}
   */
  public attachUniverse(nodeName: string, port: number, universe: Universe) {
    const node = this.getByName(nodeName);

    if (!node) {
      throw new ArtNetLibError('NODE_NOT_FOUND');
    }

    return node.attachUniverse(port, universe);
  }

  @Log
  public detachUniverse(nodeName: string, port: number) {
    const node = this.getByName(nodeName);

    if (!node) {
      throw new ArtNetLibError('NODE_NOT_FOUND');
    }

    return node.detachUniverse(port);
  }

  @Log
  public async syncNode(nodeName: string, ports: number[]) {
    const node = this.getByName(nodeName);
    return await Promise.all(ports.map((port) => node?.syncRemotePort(port)));
  }

  @Log
  public watch(watchInterval?: number, nodeDeathTimout?: number): void {
    this.stopWatch();
    this.watchNodes(watchInterval, nodeDeathTimout);
  }

  @Log
  public stopWatch(): void {
    clearInterval(this.nodeWatcherId);
  }

  public dispose() {
    this.nodes.splice(0, -1);
    this.stopWatch();
  }

  @Log
  public async syncAllNodes() {
    return await Promise.all(this.get().map((node) => node.syncAll()));
  }
}
