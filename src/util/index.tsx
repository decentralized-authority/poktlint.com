import request from 'superagent';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

export const relayIdToName = (relayId: string, backupNames: {[key: string]: string} = {}): string => {
  switch(relayId) {
    case '0029':
      return 'algorand-mainnet';
    case '0003':
      return 'avax-mainnet';
    case '00A3':
      return 'avax-archival';
    case '0004':
      return 'bsc-mainnet';
    case '0010':
      return 'bsc-archival';
    case '0021':
      return 'eth-mainnet';
    case '0022':
      return 'eth-archival';
    case '0028':
      return 'eth-archival-trace';
    case '0026':
      return 'eth-goerli';
    case '0024':
      return 'poa-kovan';
    case '0025':
      return 'eth-rinkeby';
    case '0023':
      return 'eth-ropsten';
    case '0005':
      return 'fuse-mainnet';
    case '000A':
      return 'fuse-archival';
    case '0027':
      return 'gnosischain-mainnet';
    case '000C':
      return 'gnosischain-archival';
    case '0040':
      return 'harmony-0';
    case '0044':
      return 'iotex-mainnet';
    case '0047':
      return 'oec-mainnet';
    case '0001':
      return 'pocket-mainnet';
    case '0009':
      return 'poly-mainnet';
    case '000B':
      return 'poly-archival';
    case '0006':
      return 'sol-mainnet';
    default: {
      const backupName = backupNames[relayId];
      if(backupName && isString(backupName)) {
        const matches = backupName.match(/(.+)\(|$/)
        if(matches) {
          return matches[1]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
        } else {
          return 'unknown';
        }
      } else {
        return 'unknown';
      }
    }
  }
};

const regionDirectionToShortened = (region: string): string => {
  switch(region) {
    case 'north':
      return 'n';
    case 'south':
      return 's';
    case 'east':
      return 'e';
    case 'west':
      return 'w';
    case 'central':
      return 'c';
    case 'northeast':
      return 'ne';
    case 'southeast':
      return 'se';
    case 'northwest':
      return 'nw';
    case 'southwest':
      return 'sw';
    default:
      return region;
  }
};

export const regionToShortened = (region: string): string => {
  try {
    const splitRegion = region.split('-');
    splitRegion[1] = regionDirectionToShortened(splitRegion[1]);
    return splitRegion.join('-');
  } catch(err) {
    // ignore error
    return region;
  }
}

export const regionToName = (region: string): string => {
  switch(region) {
    case 'us-east-1':
      return 'United States East 1';
    case 'us-east-2':
      return 'United States East 2';
    case 'us-west-1':
      return 'United States West 1';
    case 'us-west-2':
      return 'United States West 2';
    case 'ap-east-1':
      return 'Asia Pacific East 1';
    case 'ap-northeast-1':
      return 'Asia Pacific Northeast 1';
    case 'ap-southeast-1':
      return 'Asia Pacific Southeast 1';
    case 'eu-central-1':
      return 'Europe Central 1';
    case 'eu-north-1':
      return 'Europe North 1';
    case 'eu-south-1':
      return 'Europe South 1';
    case 'eu-west-1':
      return 'Europe West 1';
    default:
      return region;
  }
}

export async function getBackupNames(): Promise<{[key: string]: string}> {
  try {
    const { body } = await request
      .get('https://poktscan-v1.nyc3.digitaloceanspaces.com/pokt-chains.json');
    return isPlainObject(body) ? body : {};
  } catch(err) {
    console.error(err);
    return {};
  }
}
