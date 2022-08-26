const { randomBytes } = require("@stablelib/random");

const { SiweMessage, Cacao } = require("ceramic-cacao");
const config = require("../utils/config");
const axios = require("axios");

const provider = new ethers.providers.JsonRpcProvider(config.alchemyUrl);
const wallet = new ethers.Wallet(process.env.MY_PRIVATE_KEY, provider);
console.log("wallet: ", wallet.address);

const addCapToDid = async (wallet, didKey, resource) => {
  // Create CACAO with did:key as aud
  const now = new Date();
  const siweMessage = new SiweMessage({
    domain: "ethbarcelona.com",
    address: wallet.address,
    chainId: config.chainId,
    statement: "Give this application access to some of your data on Ceramic",
    uri: didKey.id,
    version: "1",
    nonce: "23423423",
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ).toISOString(),
    resources: [resource],
  });
  // Sign CACAO with did:pkh
  const signature = await wallet.signMessage(siweMessage.toMessage());
  siweMessage.signature = signature;
  const capability = Cacao.fromSiweMessage(siweMessage);
  // Create new did:key with capability attached
  const didKeyWithCapability = didKey.withCapability(capability);
  await didKeyWithCapability.authenticate();
  return didKeyWithCapability;
};

// didKey
const createDidKey = async () => {
  const { Ed25519Provider } = await import("key-did-provider-ed25519");
  const { getResolver } = await import("key-did-resolver");
  const { DID } = await import("dids");

  // Create did:key for the dApp
  const didKeyProvider = new Ed25519Provider(randomBytes(32));
  didKey = new DID({
    provider: didKeyProvider,
    resolver: getResolver(),
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
    const res = await axios.post(url, data, configOptions);
    console.log(res.data);
  } catch (err) {
    // console.error(err);
    console.log("error getting access token");
  }
};

const run = async () => {
  const didKey = await createDidKey();
  const didKeyWithCapability = await addCapToDid(wallet, didKey, `ceramic://*`);
  console.log(didKey);
  //   console.log(didKeyWithCapability);

  // have the didKey -> have to couple it with the session time
  const jws = await didKeyWithCapability.createDagJWS(
    didKeyWithCapability.capability
  );
  console.log("jws: ", jws);

  const res = await getAccessToken(jws);
};

run();
