const { randomBytes } = require("@stablelib/random");
const { SiweMessage, Cacao } = require("ceramic-cacao");
const config = require("../utils/config");
const axios = require("axios");
const { ethers } = require("hardhat");

console.log(config.chainId);
const provider = new ethers.providers.JsonRpcProvider(config.alchemyUrl);
// const wallet = new ethers.Wallet(process.env.MY_PRIVATE_KEY, provider);
const wallet = ethers.Wallet.fromMnemonic(config.mnemonic);
console.log("wallet: ", wallet.address);

const addCapToDid = async (wallet, didKey, resource) => {
  // Create CACAO with did:key as aud
  const now = new Date();
  const siweMessage = new SiweMessage({
    domain: "ethbarcelona.com",
    address: wallet.address,
    chainId: config.chainId,
    statement: "Give this application access to some of your data on Ceramic",
    uri: didKey.id, // changes every time
    version: "1",
    nonce: "23423423",
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ).toISOString(),
    resources: [resource],
  });
  // Sign CACAO with did:pkh
  console.log("wallet for signing: ", wallet.address);
  const signature = await wallet.signMessage(siweMessage.toMessage());
  siweMessage.signature = signature;
  console.log("siwe message: ", siweMessage);
  // capabilty created with siwe message using cacao -> how?
  const capability = Cacao.fromSiweMessage(siweMessage);
  console.log("capability: ", capability);
  // Create new did:key with capability attached
  const didKeyWithCapability = didKey.withCapability(capability);
  await didKeyWithCapability.authenticate();
  return didKeyWithCapability;
};

// didKey
const createDidKey = async (wallet) => {
  const { Ed25519Provider } = await import("key-did-provider-ed25519");
  const { getResolver } = await import("key-did-resolver");
  const { DID } = await import("dids");

  // Create did:key for the dApp
  const didKeyProvider = new Ed25519Provider(randomBytes(32));
  console.log("didKey parent: ", wallet.address);
  didKey = new DID({
    provider: didKeyProvider,
    resolver: getResolver(),
    parent: `did:pkh:eip155:${config.chainId}:${wallet.address}`,
  });
  await didKey.authenticate();
  return didKey;
};

const getAccessToken = async (data) => {
  const configOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log("getting access token");

  try {
    const url = `${config.dgApiBaseUrl}/authentication/authentication`;
    console.log("url: ", url);
    const res = await axios.post(url, data);
    console.log(res.data);
  } catch (err) {
    // console.error(err);
    console.log("error getting access token");
  }
};

const run = async () => {
  const didKey = await createDidKey(wallet);
  console.log("didKey: ", didKey);
  const didKeyWithCapability = await addCapToDid(wallet, didKey, `ceramic://*`);
  console.log("with capability: ", didKeyWithCapability);

  // have the didKey -> have to couple it with the session time
  // with capability you create jws proof
  const { jws, linkedBlock } = await didKeyWithCapability.createDagJWS(
    didKeyWithCapability.capability
  );
  console.log("jws: ", jws);
  if (!jws.link) throw new Error("no jws");
  //   console.log(jws.signatures);

  console.log(Array.from(linkedBlock));
  const data = { proof: jws, cacaoBlock: Array.from(linkedBlock) };
  //   console.log(data);
  const res = await getAccessToken(data);
};

run();
