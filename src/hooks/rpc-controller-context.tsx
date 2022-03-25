import { createContext } from 'react';
import { RPCController } from '../modules/rpc-controller';

export const RPCControllerContext = createContext(new RPCController());
