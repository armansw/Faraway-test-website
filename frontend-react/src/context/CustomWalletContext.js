/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */
import React, { createContext, useContext } from "react";


import getWeb3 from "./getWeb3";
const BalanceKey = "b_k";


function UseWalletConfig() {

  let savedWallet = window.sessionStorage.getItem("wallet");

  let savedWalletNet = window.sessionStorage.getItem("wallet_net");


  const [selWallet, setSelWallet] = React.useState(savedWalletNet);
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState(savedWallet);
  const [shortAddr, setShortAddr] = React.useState();
  const [balance, setBalance] = React.useState();
  const [balanceSymbol] = React.useState("ETH");
  const [isRightNet, setIsRightNet] = React.useState(undefined);

  const storeBalance = (val) => {
    setBalance(val);
    window.sessionStorage.setItem(BalanceKey, val);
  };


  const connectMetamask = async () => {
    setSelWallet("metamask");
    try {
      setLoading(true);

      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      // const networkId = await web3.eth.net.getId();

      if (accounts.length > 0) {

        setAddress(accounts[0]);
        setSelWallet("meta_mask");
        window.sessionStorage.setItem("wallet", accounts[0]);
        window.sessionStorage.setItem("wallet_net", "meta_mask");

        await checkNetwork();

      } else {
        setLoading(false);
        return undefined;
      }
    } catch (err) {
      setLoading(false);
      return err;
    }
  };

  const clearWalletContext = () => {
    setAddress(undefined);
    setBalance(undefined);
    setShortAddr(undefined);
    setSelWallet(undefined);
  };


  async function checkNetwork() {
    const web3 = await getWeb3();
    const chainInfo = await getNetwork(web3);
    if (!chainInfo) {
      setIsRightNet(false);
      return;
    }
    // setBalanceSymbol(chainInfo.symbol);
    const isLive = process.env.REACT_APP_NETWORK === 'live';
    console.log('>>>>> chainID : ', chainInfo);
    const _isRightNet = isLive && chainInfo.ChainId == 1 || !isLive && chainInfo.ChainId == 4;

    setIsRightNet(_isRightNet);
  }

  const getNetWorkChangeMessage = () => {

    if (!isRightNet) {
      const mode = process.env.REACT_APP_NETWORK === 'live' ? 'Mainnet' : 'Goerli Testnet';
      const msg = `You are not in right network, please change network to ${mode}`;
      return msg;
    } else {
      return null;
    }
  }


  async function getNetwork(web3) {
    const chainID = await web3.eth.net.getId();
    const chainInfo = getNetworkName(chainID);

    return chainInfo;

  }

  function getNetworkName(chainID) {
    //ChainType is an interface that has a chainId and chainName.
    console.log('getNetworkName > chainID: ', chainID);
    const network = [
      { ChainId: 1, ChainName: "Ethereum Mainnet", symbol: "ETH" },
      { ChainId: 3, ChainName: "Ropsten Testnet", symbol: "ETH" },
      { ChainId: 4, ChainName: "Ethereum Rinkeby", symbol: "ETH" },
      { ChainId: 5, ChainName: "Ethereum Goerli", symbol: "ETH" },
      { ChainId: 56, ChainName: "Binance Smart Chain", symbol: "BNB" },
      { ChainId: 97, ChainName: "Binance Smart Chain Testnet", symbol: "BNB" },
      { ChainId: 42, ChainName: "Kovan Testnet", symbol: "ETH" },
      { ChainId: 80001, ChainName: "Polygon Mumbai Testnet", symbol: "MATIC" },
      { ChainId: 137, ChainName: "Polygon Mainnet", symbol: "MATIC" },

    ];

    return network.find((i) => i.ChainId === chainID);
  }


  const accountsChanged = (accounts) => {

    if (accounts.length === 0) {
      clearWalletContext();
    } else {
      setAddress(accounts[0]);
      window.sessionStorage.setItem("wallet", accounts[0]);

    }
  }


  const getBalance = async () => {

    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      setAddress(accounts[0]);
      const val = await web3.eth.getBalance(accounts[0]);

      const balance = web3.utils.fromWei(val);
      storeBalance(parseFloat(balance).toFixed(4));
    } catch (ex) {

      console.log("while getBalance: ex => address: " + address, " ex:", ex);
    }
  }


  React.useEffect(() => {

    (async () => {
      try {
        console.log('address updated : ', address);
        if (address) {
          await getBalance();
          await checkNetwork();
          const shortAccAddress =
            address.slice(0, 5) + ". . ." + address.slice(-4);
          setShortAddr(shortAccAddress);
        } else {
          clearWalletContext();
          setShortAddr('');
        }
      } catch (ex) {
        console.log("error before clean :", ex);
        clearWalletContext();
      }
    })();
  }, [address]);


  const onChainChanged = async (chainId) => {
    console.log('ChainChanged: data : ', chainId);

    await getBalance();
    await checkNetwork();
  }

  const onEthMessage = async (message) => {
  }

  const onDisconnect = async (error) => {
  }

  const onConnect = async (connectInfo) => {
    // alert('onConnect :  ' + JSON.stringify(connectInfo, null, 2))
  }

  React.useEffect(() => {
    if (window.ethereum) {

      window.ethereum.removeListener("accountsChanged", accountsChanged);
      window.ethereum.on("accountsChanged", accountsChanged);

      window.ethereum.removeListener("connect", onConnect);
      window.ethereum.on("connect", onConnect);

      window.ethereum.removeListener("disconnect", onDisconnect);
      window.ethereum.on("disconnect", onDisconnect);

      window.ethereum.removeListener("chainChanged", onChainChanged);
      window.ethereum.on("chainChanged", onChainChanged);

      window.ethereum.removeListener("message", onEthMessage);
      window.ethereum.on("message", onEthMessage);

    }

    // if (savedWalletNet === "meta_mask") {
    //   connectMetamask();
    // }

    return () => {

    }
  }, []);

  return {

    selWallet,
    loading,
    address,
    shortAddr,
    connectMetamask,
    // connectWalletProvider,
    balance,
    balanceSymbol,

    isRightNet,
    getNetWorkChangeMessage
  };
}



const customWalletContext = createContext({

  selWallet: undefined,
  loading: false,
  address: undefined,
  shortAddr: undefined,
  connectMetamask: undefined,
  // connectWalletProvider: undefined,  
  isRightNet: undefined,
  getNetWorkChangeMessage: undefined
});

export const CustomWalletProvider = ({ children }) => {
  const value = UseWalletConfig();

  return (
    <customWalletContext.Provider value={value}>
      {children}
    </customWalletContext.Provider>
  );
};

export const useCustomWallet = () => useContext(customWalletContext);
