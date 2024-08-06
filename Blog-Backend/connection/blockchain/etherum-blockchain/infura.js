var { Web3 } = require("web3");
var provider = 'https://mainnet.infura.io/v3/afeb52f2996b471f878d0bf69d65ca66';
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);

web3.eth.getBlockNumber().then((result) => {
  console.log("Latest Ethereum Block is ", result);
});