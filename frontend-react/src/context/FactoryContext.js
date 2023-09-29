/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect } from "react";

import MyTokenFactory from "../abis/MyTokenFactory";
import getWeb3 from "./getWeb3";
import { useCustomWallet } from "./CustomWalletContext";
const Web3 = require('web3');
export const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function ContractConfig() {

  const {
    address
  } = useCustomWallet();

  const [isInitLoading, setIsInitLoading] = React.useState(true);
  const [factoryCont, setFactoryCont] = React.useState();
  const [factorySignedCont, setFactorySignedCont] = React.useState();
  const [addressList, setAddressList] = React.useState([]);

  const [web3, setWeb3] = React.useState();


  const _getProviderUrls = () => {
    return process.env.REACT_APP_NETWORK !== 'live' ?
      [
        process.env.REACT_APP_GOERLI_ALCHEMY_HTTP,
        process.env.REACT_APP_GOERLI_ALCHEMY_WEBSOCKET
      ] : [
        process.env.REACT_APP_MAINNET_ALCHEMY_HTTP,
        process.env.REACT_APP_MAINNET_ALCHEMY_WEBSOCKET
      ];
  }

  const initContracts = async () => {
    let web3Default;
    console.log('_getProviderUrls()[0]:', _getProviderUrls()[0])
    web3Default = new Web3(new Web3.providers.HttpProvider(_getProviderUrls()[0]));
    const _factory = new web3Default.eth.Contract(MyTokenFactory.abi, MyTokenFactory.address);
    
    setFactoryCont(_factory);
  }

  /**
   * MyTokenFactory APIs
   */ 

  /** Read functions */
  /// returns the minted total count
  const getAddresses = async () => {
    try {
      const res = await factoryCont.methods.getAddresses().call();
      console.log('getAddresses :', res)
      setAddressList(res);
      return res;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  /// returns the minted token count for address
  const getLastCollection = async () => {
    try {
      const res = await factoryCont.methods.getLastCollection().call();
      console.log('Last Collection :', res)
      return res;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  /** Write functions */
  const createCollection = async (name, symbol, uri, transactionHashCallback) => {
    return new Promise((resolve, reject) => {
      let option = { from: address, }

      factorySignedCont.methods
        .createCollection(name, symbol, uri)
        .send(option)
        .on("transactionHash", function (hash) {
          if (transactionHashCallback) {
            transactionHashCallback(hash);
          }
        })
        .on("error", function (error, receipt) {
          reject({ error, receipt });
        })
        .then((receipt) => {

          resolve(receipt);
        });

    })
  }

  const mintToken = async (collection, receiver, uri, transactionHashCallback) => {
    return new Promise((resolve, reject) => {
      let option = { from: address, }

      factorySignedCont.methods
        .mintToken(collection, receiver, uri)
        .send(option)
        .on("transactionHash", function (hash) {
          if (transactionHashCallback) {
            transactionHashCallback(hash);
          }
        })
        .on("error", function (error, receipt) {
          reject({ error, receipt });
        })
        .then((receipt) => {

          resolve(receipt);
        });

    })
  }

  const initSignedContract = async () => {

    try {
      const _web3 = await getWeb3();
      setWeb3(_web3);
      
      const _factory = new _web3.eth.Contract(
        MyTokenFactory.abi,
        MyTokenFactory.address
      );
      setFactorySignedCont(_factory);

      return true;
    } catch (ex) {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      await initContracts();
    })();

    return () => { }
  }, []);

  useEffect(() => {
    if (!address) return;
    (async () => {
      await initSignedContract();
    })();
  }, [address])

  const loadingFactoryData = async () => {
    await getAddresses();
  }

  useEffect(() => {
    if (!factoryCont) return;
    (async () => {

      await loadingFactoryData();
      setIsInitLoading(false)
      
    })();

  }, [factoryCont])
  

  return {
    web3,
    factoryCont,
    addressList,
    getAddresses,
    getLastCollection,
    createCollection,
    mintToken,
    loadingFactoryData,
    isInitLoading
  };
}

const factoryContext = createContext({
  web3: undefined,
  factoryCont: undefined,
  addressList: undefined,
  getAddresses: undefined,
  getLastCollection: undefined,
  createCollection: undefined,
  mintToken: undefined,
  loadingFactoryData: undefined,
  isInitLoading: undefined
});

export const FactoryContractProvider = ({ children }) => {
  const value = ContractConfig();
  return (
    <factoryContext.Provider value={value}>
      {children}
    </factoryContext.Provider>
  );
};

export const useFactoryContract = () => useContext(factoryContext);
