/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect } from "react";

import MyToken from "../abis/MyToken";
import getWeb3 from "./getWeb3";
import { useCustomWallet } from "./CustomWalletContext";
const Web3 = require('web3');
export const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function ContractConfig() {

  const {
    address
  } = useCustomWallet();

  const [tokenAddress, setTokenAddress] = React.useState();
  const [isInitTokenLoading, setIsInitTokenLoading] = React.useState(true);
  const [myTokenCont, setMyTokenCont] = React.useState();

  const [myTokenSignedCont, setMyTokenSignedCont] = React.useState();

  const [mintedCount, setMintedCount] = React.useState();
  const [balance, setBalance] = React.useState();

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
    const _mytoken = new web3Default.eth.Contract(MyToken.abi, tokenAddress);
    
    setMyTokenCont(_mytoken);
  }

  /**
   * MyToken APIs
   */ 

  /** Read functions */
  /// returns the minted total count
  const getMintedCount = async () => {
    try {
      const res = await myTokenCont.methods.tokenId().call();
      res = res + 1;
      console.log('getMintedCount :', res)
      setMintedCount(res + '');
      return res;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  /// returns the minted token count for address
  const balanceOf = async () => {
    console.log('Token Address :', tokenAddress);
    try {
      const res = await myTokenCont.methods.balanceOf(address).call();
      console.log('balanceOf :', res)
      setBalance(res);
      return res;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  /// returns the minted token IDs for address
  const ownerOf = async (tokenId) => {
    try {
        const res = await myTokenCont.methods.ownerOf(tokenId).call();
        console.log('ownerOf:', res);
        return res;
      } catch (ex) {
        console.error(ex);
      }
  }
 
  const tokenURI = async(tokenId)=>{

    try {
      const res = await myTokenCont.methods.tokenURI(tokenId).call();
      console.log('tokenURI :', res)

      return res;
    } catch (ex) {
      console.log(ex);
      return null;
    }
  }

  /** Write functions */
  const mint = async (receiver, msg, transactionHashCallback) => {
    return new Promise((resolve, reject) => {
      let option = { from: address, }

      myTokenSignedCont.methods
        .mint(receiver, msg)
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
      
      const _mytoken = new _web3.eth.Contract(
        MyToken.abi,
        tokenAddress
      );
      setMyTokenSignedCont(_mytoken);

      return true;
    } catch (ex) {
      return false;
    }
  };

  useEffect(() => {
    if (!address || !tokenAddress) return;
    (async () => {
      await initContracts();
      await initSignedContract();
    })();

    return () => { }
  }, [tokenAddress, address]);

  const loadingTokenData = async () => {
    await getMintedCount();
  }

  useEffect(() => {
    if (!myTokenCont) return;
    (async () => {

      await loadingTokenData();
      setIsInitTokenLoading(false)
      
    })();

  }, [myTokenCont])

  useEffect(()=>{
    if(myTokenCont && address) {
      (async()=>{
        await balanceOf(address);
      })();
    }
  }, [myTokenCont, address])
  

  return {
    web3,
    myTokenCont,
    balance,
    balanceOf,
    mintedCount,
    getMintedCount,
    ownerOf,
    tokenURI,
    mint,
    setTokenAddress,
    loadingTokenData,
    isInitTokenLoading
  };
}

const myTokenContext = createContext({
  web3: undefined,
  myTokenCont: undefined,
  balance: undefined,
  balanceOf: undefined,
  mintedCount: undefined,
  getMintedCount: undefined,
  ownerOf: undefined,
  tokenURI: undefined,
  mint: undefined,
  setTokenAddress: undefined,
  loadingTokenData: undefined,
  isInitTokenLoading: undefined
});

export const MyTokenContractProvider = ({ children }) => {
  const value = ContractConfig();
  return (
    <myTokenContext.Provider value={value}>
      {children}
    </myTokenContext.Provider>
  );
};

export const useMyTokenContract = () => useContext(myTokenContext);
