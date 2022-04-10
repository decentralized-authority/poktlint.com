import React, { useContext, useState } from 'react';
import { RPCControllerContext } from './hooks/rpc-controller-context';
import swal from 'sweetalert';
import { GetNodeRes } from './modules/rpc-controller';
import { Node } from '@pokt-network/pocket-js';
import uniq from 'lodash/uniq';
import { regionToName, regionToShortened, relayIdToName } from './util';
import { AWS_REGIONS, INSTRUCTIONS_URL, SAMPLE_NUM } from './constants';
import { ChainResponse } from './types/chain-response';
// import daLogo from './images/da_logo_white-400.png';

function App() {

  const rpcController = useContext(RPCControllerContext);
  const [ addresses, setAddresses ] = useState('');
  const [ disableRunButton, setDisableRunButton ] = useState(false);
  const [ nodes, setNodes ] = useState<Node[]>([]);
  const [ chainData, setChainData ] = useState<ChainResponse[]>([]);

  const styles = {
    form: {
      width: 700,
      maxWidth: '100%',
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
    },
  };

  const onAddressesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setAddresses(e.target.value);
  };
  const onSubmit = async(e: React.FormEvent) => {
    try {
      e.preventDefault();
      setDisableRunButton(true);
      const splitAddresses = addresses
        .split(',')
        .map(a => a.trim())
        .filter(a => a);
      const resArr: GetNodeRes[] = await Promise.all(uniq(splitAddresses).map(a => {
        return rpcController.getNode(a);
      }));
      const nodes: Node[] = [];
      for(let i = 0; i < resArr.length; i++) {
        const { error, node } = resArr[i];
        if(error) {
          setDisableRunButton(false);
          return await swal({
            title: 'Oops!',
            text: error,
            icon: 'error',
          });
        } else if(node) {
          nodes.push(node);
        }
      }
      setNodes(nodes);
      setChainData([]);
      let newChainData: ChainResponse[] = [];
      await Promise.all(nodes.map(async function(node) {
        for(let j = 0; j < AWS_REGIONS.length; j++) {
          try {
            const region = AWS_REGIONS[j];
            const chainResponses = await rpcController.getRelayData(
              node.serviceURL.href,
              node.address,
              region,
              node.chains,
            );
            newChainData = [...newChainData, ...chainResponses];
            setChainData(newChainData);
          } catch(err) {
            console.error(err);
          }
        }
      }));
      setDisableRunButton(false);
    } catch(err) {
      console.error(err);
      setDisableRunButton(false);
    }
  };

  const addressToResponses: {[address: string]: {[chainId: string]: {[region: string]: ChainResponse}}} = {};
  for(let i = 0; i < chainData.length; i++) {
    const item = chainData[i];
    const { chainId, poktAddress, region } = item;
    if(addressToResponses[poktAddress]) {
      if(addressToResponses[poktAddress][chainId]) {
        addressToResponses[poktAddress][chainId][region] = item;
      } else {
        addressToResponses[poktAddress][chainId] = {
          [region]: item
        };
      }
    } else {
      addressToResponses[poktAddress] = {
        [chainId]: {
          [region]: item
        }
      };
    }
  }

  return (
    <div className={'container-fluid'}>

      <div className={'row'}>
        <div className={'col'}>
          <div className={'d-flex flex-column align-items-center'}>
            <h1 className={'mt-3'}>POKT Lint</h1>
            <form className={'mt-2'} style={styles.form} onSubmit={onSubmit}>
              <div className={'form-group'}>
                <input type={'text'} spellCheck={false} className={'form-control form-control-lg text-monospace'} value={addresses} placeholder={'Enter comma-separated list of POKT validator addresses'} onChange={onAddressesChange} required autoFocus />
              </div>
              <div className={'form-group'}>
                <button className={'btn btn-primary btn-lg w-100'} type={'submit'} disabled={disableRunButton}>Run Tests</button>
              </div>
            </form>
            <h5 className={'mb-3'}>Instructions can be found <a href={INSTRUCTIONS_URL} target={'_blank'} rel={'noreferrer'}>here</a>.</h5>
          </div>
        </div>
      </div>

      {nodes
        .map(node => {
          return (
            <div key={node.address} className={'row'}>
              <div className={'col'}>
                <div className={'card p-2'}>

                  <div className={'row'}>
                    <div className={'col-xl-4 col-lg-6 col-md-6'}>
                      <div className={'form-group'}>
                        <label>Address</label>
                        <input type={'text'} className={'form-control'} value={node.address} readOnly />
                      </div>
                    </div>
                    <div className={'col-xl-4 col-lg-6 col-md-6'}>
                      <div className={'form-group'}>
                        <label>Url</label>
                        <input type={'text'} className={'form-control'} value={node.serviceURL.href} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className={'row'}>
                    <div className={'col'}>
                      <div style={styles.tableContainer as React.CSSProperties}>

                        <table className={'table'}>
                          <thead>
                          <tr>
                            <th>Relay ID</th>
                            <th>Chain Name</th>
                            {AWS_REGIONS
                              .map(r => {
                                return (
                                  <th className={'text-nowrap'} key={`${r}-header`} title={regionToName(r)}>{regionToShortened(r)}</th>
                                );
                              })
                            }
                          </tr>
                          </thead>
                          <tbody>
                          {node.chains
                            .map(id => {
                              return (
                                <tr key={node.address + id}>
                                  <td>{id}</td>
                                  <td>{relayIdToName(id)}</td>
                                  {AWS_REGIONS
                                    .map(region => {
                                      const key = node.address + id + region;
                                      const data = addressToResponses[node.address] && addressToResponses[node.address][id] && addressToResponses[node.address][id][region] ?
                                        addressToResponses[node.address][id][region]
                                        :
                                        null;
                                      if(!data) {
                                        return <td key={key} />;
                                      } else if(data.success) {
                                        return (
                                          <td key={key} title={`total samples: ${SAMPLE_NUM}\navg time: ${data.durationAvg}\nmin time: ${data.durationMin}\nmax time: ${data.durationMax}`}>
                                            <span className={'text-success text-monospace'}>{data.durationAvg.toFixed(3)}</span>
                                          </td>
                                        );
                                      } else {
                                        return (
                                          <td key={key} title={data.message}>
                                          <span className={'text-danger'}>
                                          {/*<i className={'mdi mdi-alpha-x-circle'} />*/}
                                            Error
                                        </span>
                                          </td>
                                        );
                                      }
                                    })
                                  }
                                </tr>
                              );
                            })
                          }
                          </tbody>
                        </table>

                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          );
        })
      }

    </div>
  );
}

export default App;
