import { Configuration, Hex, HttpRpcProvider, Node, Pocket } from '@pokt-network/pocket-js';
import isError from 'lodash/isError';
import { ChainResponse, ChainResponseData } from '../types/chain-response';
import request from 'superagent';
import { SAMPLE_NUM } from '../constants';

export interface GetNodeRes {
  error?: string
  node?: Node
}

export class RPCController {

  _pocket: Pocket;

  constructor() {
    const maxDispatchers = 5;
    const maxSessions = 1000;
    const requestTimeOut = 30000;
    const dispatcher = new URL('https://mainnet.gateway.pokt.network/v1/lb/622f3828b2feb20039807a2e');
    const configuration = new Configuration(maxDispatchers, maxSessions, 0, requestTimeOut, undefined, undefined, undefined, undefined, undefined, undefined, false);
    const rpcProvider = new HttpRpcProvider(dispatcher);
    this._pocket = new Pocket([dispatcher], rpcProvider, configuration);
  }

  async getNode(address: string): Promise<GetNodeRes> {
    const valid = Hex.validateAddress(address);
    if(!valid)
      return {error: `Invalid address:\n\n${address}`};
    try {
      const res = await this._pocket.rpc()?.query.getNode(address);
      if(!res || isError(res))
        throw res;
      return {node:res.node};
    } catch(err) {
      if(isError(err))
        console.error(err);
      return {error: `Unable to fetch node information for:\n\n${address}\n\nMake sure that the address is a POKT validator.`};
    }
  }

  async getRelayData(nodeUrl: string, nodeAddress: string, region: string, chains: string[]): Promise<ChainResponse[]> {
    const res = await request
      .post(`https://cyjsleof37.execute-api.us-east-1.amazonaws.com/beta/relaytest/${region}`)
      .set('x-api-key', 'cNQMO1MhIZ2MUqZghGtrF1vUrPuYRVOU3Bko0Yh9')
      .timeout(60000)
      .send({
        node_url: nodeUrl,
        chain_ids: chains,
        num_samples: SAMPLE_NUM,
      });
    const { body = {}, statusCode } = res;
    if(statusCode !== 200)
      return [];
    const chainResponses: ChainResponse[] = [];
    const rawDataArr: (ChainResponseData|string)[] = Object.values(body);
    for(let i = 0; i < rawDataArr.length; i++) {
      const item = rawDataArr[i];
      if(typeof item === 'string')
        throw new Error(item);
      item.poktAddress = nodeAddress;
      item.region = region;
      chainResponses.push(new ChainResponse(item));
    }
    return chainResponses;
  }

}