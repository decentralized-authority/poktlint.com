export interface ChainResponseData {
  poktAddress: string
  region: string
  chain_id: string
  chain_name: string
  success: boolean
  status_code: number
  message: string
  duration_avg_ms: number
  duration_min_ms: number
  duration_max_ms: number
}

export class ChainResponse {

  poktAddress: string
  region: string
  chainId: string
  chainName: string
  success: boolean
  statusCode: number
  message: string
  durationAvg: number
  durationMin: number
  durationMax: number

  constructor(data: ChainResponseData) {
    this.poktAddress = data.poktAddress;
    this.region = data.region;
    this.chainId = data.chain_id;
    this.chainName = data.chain_name;
    this.success = data.success;
    this.statusCode = data.status_code;
    this.message = data.message;
    this.durationAvg = data.duration_avg_ms;
    this.durationMin = data.duration_min_ms;
    this.durationMax = data.duration_max_ms;
  }

}
