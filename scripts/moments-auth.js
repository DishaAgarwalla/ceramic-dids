const { ethers } = require("hardhat");
const config = require("../utils/config");

// const {
//   EthereumAuthProvider,
// } = require("@ceramicnetwork/blockchain-utils-linking");
// const bip39 = require("bip39");
// const web3 = require("web3");
// const { fromString } = require("uint8arrays");
// const web3 = new Web3();

// import { Ed25519Provider } from "key-did-provider-ed25519";
// import { getResolver } from "key-did-resolver";

// const { CeramicClient } = require("@ceramicnetwork/http-client");
// const ceramic = new CeramicClient("https://your-ceramic-node.com");

// const { DIDDataStore } = require("@glazed/did-datastore");
// const { DIDSession } = require("did-session");
// const { DID } = require("dids");

// import { EthereumAuthProvider } from "@ceramicnetwork/blockchain-utils-linking";
// import { CeramicClient } from "@ceramicnetwork/http-client";
// import { DIDDataStore } from "@glazed/did-datastore";
// import { DIDSession } from "@glazed/did-session";
// import { DID } from "dids";

// const provider = new ethers.providers.Web3Provider(config.alchemyUrl); //.getDefaultProvider(); // providers.JsonRpcProvider(config.alchemyUrl);
const provider = new ethers.providers.JsonRpcProvider(config.alchemyUrl);

// getDefaultProvider // Cannot find package 'key-did-resolver'
//  webSocketProvider // Cannot find package 'key-did-resolver'

// console.log(provider);

const wallet = new ethers.Wallet(process.env.MY_PRIVATE_KEY, provider);
console.log("wallet: ", wallet.address);

async function web3Authenticate(
  provider, // connector.getProvider()
  address
) {
  const { EthereumAuthProvider } = await import(
    "@ceramicnetwork/blockchain-utils-linking"
  );

  // const { Ed25519Provider } = await import("key-did-provider-ed25519");
  // const { getResolver } = await import("key-did-resolver");
  // const { DID } = await import("dids");

  // let seed = await bip39.mnemonicToSeed(config.mnemonic); // creates seed buffer
  // console.log(config.privateKey.length);
  // // seed = ethers.utils.parseBytes32String(config.privateKey);
  // console.log("private key: ", config.privateKey);
  // // seed = web3.utils.hexToBytes("0x" + config.privateKey);
  // const publicKey64 = web3.utils.padLeft(wallet.address.replace("0x", ""), 64);
  // console.log("pub len: ", publicKey64.length);
  // // seed = web3.utils.hexToBytes(seed);
  // console.log(seed);

  // bytes32str = web3.utils.hexToBytes("0x" + config.didKey);
  // console.log(bytes32str);

  // seed = fromString("<64 character seed>", "base16");
  // seed = fromString(config.didKey, "base16");

  // `seed` must be a 32-byte long Uint8Array
  // async function createJWS(seed) {
  // const provider1 = new Ed25519Provider(seed);
  // console.log(provider1);
  //   const did = new DID({ resolver: getResolver() }); //provider1,
  //   const res = await did.resolve(config.didKey);
  //   console.log(res);
  //   // return;
  //   console.log(did);
  //   // Authenticate the DID with the provider
  //   await did.authenticate();

  //   // This will throw an error if the DID instance is not authenticated
  //   const jws = await did.createDagJWS({ hello: "world" });
  //   console.log("jws: ", jws);
  // }

  // await createJWS(seed);

  //
  // const { Ed25519Provider } = await import("key-did-provider-ed25519");
  const authProvider = new EthereumAuthProvider(provider, wallet.address);

  // console.log(authProvider);
  let did;

  // const { DIDSession } = await import("did-session");
  // const didSession = await DIDSession.authorize(authProvider, {
  //   domain: "",
  //   resources: [`ceramic://*`],
  // });
  // did = didSession.did;

  const { DIDSession } = await import("@glazed/did-session");
  const didSession = new DIDSession({ authProvider });
  console.log(didSession);

  const now = new Date();
  did = await didSession.authorize({
    expirationTime: new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ).toISOString(),
    resources: [`ceramic://*`],
    domain: "ethbarcelona.com",
  });

  console.log("did: ", did);

  // return did;
}

web3Authenticate(provider, wallet.address);
