const config = {
  alchemyUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
  mnemonic: process.env.MNEMONIC,
  privateKey: process.env.MY_PRIVATE_KEY,
  didKey: process.env.DID_KEY,
};

module.exports = config;
