import { Configuration, Hex, HttpRpcProvider, Node, Pocket } from '@pokt-network/pocket-js';
import isError from 'lodash/isError';
import { ChainResponse, ChainResponseData } from '../types/chain-response';
import request from 'superagent';
import { AWS_GATEWAY_API_KEY, AWS_RELAYTEST_ENDPOINT, POCKET_ENDPOINT, SAMPLE_NUM } from '../constants';

export interface GetNodeRes {
  error?: string
  node?: Node
}

export class RPCController {

  _pocket?: Pocket;

  constructor() {
    const maxDispatchers = 5;
    const maxSessions = 1000;
    const requestTimeOut = 30000;
    if(POCKET_ENDPOINT) {
      const dispatcher = new URL(POCKET_ENDPOINT);
      const configuration = new Configuration(maxDispatchers, maxSessions, 0, requestTimeOut, undefined, undefined, undefined, undefined, undefined, undefined, false);
      const rpcProvider = new HttpRpcProvider(dispatcher);
      this._pocket = new Pocket([dispatcher], rpcProvider, configuration);
    }
  }

  async getNode(address: string): Promise<GetNodeRes> {
    const valid = Hex.validateAddress(address);
    if(!valid)
      return {error: `Invalid address:\n\n${address}`};
    if(!this._pocket)
      throw new Error('this._pocket is not defined.');
    try {
      const res = await request
        .post(`${POCKET_ENDPOINT}/v1/query/node`)
        .type('application/json')
        .send({address});
      return {
        node: Node.fromJSON(res.text),
      };
    } catch(err) {
      if(isError(err))
        console.error(err);
      return {error: `Unable to fetch node information for:\n\n${address}\n\nMake sure that the address is a POKT validator.`};
    }
  }

  async getRelayData(nodeUrl: string, nodeAddress: string, region: string, chains: string[]): Promise<ChainResponse[]> {
    const responses = await Promise.all(chains.map(async (chain): Promise<ChainResponse[]> => {
      let body: any;
      let statusCode: number;
      try {
        const res = await request
          .post(`${AWS_RELAYTEST_ENDPOINT}/${region}`)
          .set('x-api-key', AWS_GATEWAY_API_KEY)
          .timeout(60000)
          .send({
            node_url: nodeUrl,
            chain_ids: [chain],
            num_samples: SAMPLE_NUM,
          });
        statusCode = res.statusCode;
        if(statusCode !== 200)
          return [];
        body = res.body;
      } catch(err: any) {
        console.error(err);
        statusCode = 0;
        body = {
          errorMessage: err.message,
        };
      }
      const chainResponses: ChainResponse[] = [];
      if(body.errorMessage) {
        for(let i = 0; i < chains.length; i++) {
          const chain = chains[i];
          chainResponses.push(new ChainResponse({
            poktAddress: nodeAddress,
            region: region,
            chain_id: chain,
            chain_name: '',
            success: false,
            status_code: statusCode,
            message: body.errorMessage,
            duration_avg_ms: 0,
            duration_median_ms: 0,
            duration_min_ms: 0,
            duration_max_ms: 0,
          }));
        }
      } else {
        const rawDataArr: (ChainResponseData|string)[] = Object.values(body);
        for(let i = 0; i < rawDataArr.length; i++) {
          const item = rawDataArr[i];
          if(typeof item === 'string')
            throw new Error(item);
          item.poktAddress = nodeAddress;
          item.region = region;
          chainResponses.push(new ChainResponse(item));
        }
      }
      return chainResponses;
    }));
    return responses.reduce((arr, a) => arr.concat(a), []);
  }

}
