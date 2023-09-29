import { Interface, JsonRpcProvider, TopicFilter, ethers } from "ethers";
import  {FactoryABI} from './abis/factory_abi';
import { CollectionCreated, TokenMinted } from "./types";
import { TokenABI } from "./abis/token_abi";


require('dotenv').config();


export const FACTORY_ADDR = process.env.FACTORY_ADDRESS;
export const RPC_URL = process.env.RPC_URL_TESTNET;


console.log('>> abi ', {FactoryABI});


export const getContract = (addr:string, abi: any)=>{

    const provider = new JsonRpcProvider(RPC_URL);

    const contract = new ethers.Contract(addr, abi, provider);

    return contract;

}


export const getCollectionCreatedLogs = async(lastBlockNumber: number = 0): Promise<CollectionCreated[]> => {
    return new Promise(async (resolve, reject) => {
      console.log('Begin getCollectionCreatedLogs Logs');
      const provider = new JsonRpcProvider(RPC_URL);

      // const lastBlockNumber = await provider.getBlockNumber();
      console.log('getLogs >> lastBlockNumber', lastBlockNumber);
      const iface = new Interface(FactoryABI);
      const factory = getContract(FACTORY_ADDR, FactoryABI);
      const filterTopic = await factory.filters.CollectionCreated().getTopicFilter();
      
      const filter = {
        address: FACTORY_ADDR,
        topics: filterTopic,
        fromBlock: lastBlockNumber,
        toBlock: 'latest',
      };
      
      provider
        .getLogs(filter)
        .then(function (logs) {
          
          resolve(logs.map(one=>{
            
            const obj = parseLog(one);
            const collectionCreated: CollectionCreated = {
              txhash :one.transactionHash,
              blockNumber: one.blockNumber,
              address: obj.args[0],
              name: obj.args[1],
              symbol: obj.args[2]
            }
            return collectionCreated;
          }));
        })
        .catch(function (err) {
          console.log(err);
          reject(err);
        });
    });
  }


  export const getTokenMintedLogs = async(lastBlockNumber: number = 0): Promise<TokenMinted[]> => {
    return new Promise(async (resolve, reject) => {
      console.log('Begin getTokenMintedLogs Logs');
      const provider = new JsonRpcProvider(RPC_URL);

      // const lastBlockNumber = await provider.getBlockNumber();
      console.log('getLogs >> lastBlockNumber', lastBlockNumber);
      const iface = new Interface(FactoryABI);
      const factory = getContract(FACTORY_ADDR, FactoryABI);
      const filterTopic = await factory.filters.TokenMinted().getTopicFilter();
      
      const filter = {
        address: FACTORY_ADDR,
        topics: filterTopic,
        fromBlock: lastBlockNumber,
        toBlock: 'latest',
      };
      
      provider
        .getLogs(filter)
        .then(function (logs) {
          resolve(logs.map(one=>{            
            const obj = parseLog(one);
            const tokenMinted: TokenMinted = {
              txhash :one.transactionHash,
              blockNumber: one.blockNumber,
              collection: obj.args[0],
              recipient: obj.args[1],
              tokenId:( obj.args[2] as bigint).toString(),
              tokenURI: obj.args[3]
            }
            return tokenMinted;
          }));
        })
        .catch(function (err) {
          console.log(err);
          reject(err);
        });
    });
  }


  export const parseLog = (log: any, abi?: any) => {
    const iface = new Interface(abi ? abi : FactoryABI);
    return iface.parseLog(log);
  }