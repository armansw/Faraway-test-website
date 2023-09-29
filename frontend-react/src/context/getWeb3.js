
const Web3 = require('web3');

const getWeb3 = () => {
  return new Promise(async (resolve, reject) => {
    // window.addEventListener("load", async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();

        resolve(web3);
      } catch (error) {

        reject(error);
      }
    } else if (window.web3) {
      const web3 = window.web3;

      resolve(web3);
    } else {
      reject(new Error("web3 is not allowed"));
    }
  });
};

export default getWeb3;
