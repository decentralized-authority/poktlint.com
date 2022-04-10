// POCKET_ENDPOINT is a pocket portal endpoint for making POKT rpc requests
// e.g. https://mainnet.gateway.pokt.network/v1/lb/622f828feb2039807a2e
export const POCKET_ENDPOINT = process.env.REACT_APP_POCKET_ENDPOINT || '';
if(!POCKET_ENDPOINT)
  console.warn('REACT_APP_POCKET_ENDPOINT variable is not defined.');

// REACT_APP_AWS_REGIONS is a comma separated list of AWS regions
// e.g. ap-northeast-1,ap-southeast-1,eu-central-1,eu-north-1,eu-west-1,us-east-1,us-east-2,us-west-1
export const AWS_REGIONS = (process.env.REACT_APP_AWS_REGIONS || '')
  .split(',').map(s => s.trim()).filter(s => !!s);
if(AWS_REGIONS.length === 0)
  console.warn('REACT_APP_AWS_REGIONS variable is not defined.');

// REACT_APP_AWS_RELAYTEST_ENDPOINT is the AWS gateway endpoint for accessing the relaytest function
// e.g. https://cyjleo48.execute-api.us-east-1.amazonaws.com/beta/relaytest
export const AWS_RELAYTEST_ENDPOINT = process.env.REACT_APP_AWS_RELAYTEST_ENDPOINT || '';
if(!AWS_RELAYTEST_ENDPOINT)
  console.warn('REACT_APP_AWS_RELAYTEST_ENDPOINT variable is not defined.');

// REACT_APP_AWS_GATEWAY_API_KEY is the key to access the gateway endpoint
// e.g. cNQMO1MhIZ2MUqZGtrF1vUrPuYRVOU3Bko0Y
export const AWS_GATEWAY_API_KEY = process.env.REACT_APP_AWS_GATEWAY_API_KEY || '';
if(!AWS_RELAYTEST_ENDPOINT)
  console.warn('REACT_APP_AWS_GATEWAY_API_KEY variable is not defined.');

export const SAMPLE_NUM = 5;

export const INSTRUCTIONS_URL = 'https://docs.decentralizedauthority.com/pokt-lint';
