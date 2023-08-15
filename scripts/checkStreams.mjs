import { readFileSync } from 'fs';
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

const ceramic = new CeramicClient("http://localhost:7007");

const seed = readFileSync("./admin_seed.txt");
const key = fromString(seed, "base16");
const did = new DID({
  resolver: getResolver(),
  provider: new Ed25519Provider(key),
});
await did.authenticate();
ceramic.did = did;

const i = await ceramic.admin.getIndexedModels();
console.log(i);
console.log(i.length);
