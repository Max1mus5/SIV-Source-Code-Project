const dotenv = require("dotenv");
dotenv.config();

var { Web3 } = require("web3");
var provider = process.env.INFURA_BLOCKCHAIN_URL;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);

web3.eth.getBlockNumber().then((result) => {
  console.log("Latest Ethereum Block is ", result);
});

module.exports = { web3 };