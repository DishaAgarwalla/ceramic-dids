const configTestnet = {
  alchemyUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  mnemonic: process.env.MNEMONIC,
  privateKey: process.env.MY_PRIVATE_KEY,
  didKey: process.env.DID_KEY,
  dgApiBaseUrl: "https://api-main.doingud.work",
  chainId: 80001,
};

const configMainnet = {
  alchemyUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  mnemonic: process.env.MNEMONIC,
  privateKey: process.env.MY_PRIVATE_KEY,
  didKey: process.env.DID_KEY,
  dgApiBaseUrl: "https://api.doingud.com",
  chainId: 137,
};

module.exports = configTestnet;
