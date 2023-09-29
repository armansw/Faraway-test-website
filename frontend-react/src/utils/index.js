import getWeb3 from "../context/getWeb3";

export function shortenNumber(value) {
    if( value === undefined) return 0;
    const parsed1 = value.toString();
    const parsed = parseInt(parsed1).toString();
    
    if (parsed.length < 4) {
        return parsed1;
    } 
    if( parsed.length < 7) {
      const ret = value.toString();
      const realRet = parseInt(ret) / 1000;
      return `${realRet}K`;
    }
    if( parsed.length < 10 ) {
      const newValue = (value/100);
      const ret = newValue.toString();
      const realRet = parseInt(ret) / 10000;
      return `${realRet}M`;
    }
    const newValue = (value/100000);
    const ret = newValue.toString();
    const realRet = parseInt(ret) / 10000;
    return `${realRet}B`;
  }
  

  export function shortAddr (hash) {
    if (hash.length < 8) {
      return hash;
    }
    const len = hash.length;
    const shortAccAddress =
      hash.slice(0, 7) + "..." + hash.slice(len - 5, len);

    return shortAccAddress;
  }


  export function firstUpper(str) {
    if (!str) {
      return str;
    }

    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
  }


  export async function getWalletAddresses (){
    
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
     
      if (accounts.length ) {
        window.sessionStorage.setItem('wallet', accounts[0]);
        window.sessionStorage.setItem('wallet_net', networkId);
      }
      
      return accounts;
    } catch (err) {      
      return null;
    }
  }