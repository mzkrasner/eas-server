import fs from "fs-extra";
import { readFileSync } from 'fs';
import { resolve } from 'path'
import { cwd } from "process";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {VFile} from 'vfile'
import { Composite } from "@composedb/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

const { readFile } = fs;

//our internal dummy endpoint
const ceramic = new CeramicClient("http://localhost:7007");

const getFilePath = (path) => {
  return path instanceof URL ? path.pathname : resolve(cwd(), path);
}

export const dynamicCreate = async(identifier) => {

    //authenticating admin on the node
    // const seed = process.env.SEED
    const seed = readFileSync('./admin_seed.txt')
    const key = fromString(
      seed,
      "base16"
    );
    const did = new DID({
      resolver: getResolver(),
      provider: new Ed25519Provider(key)
    })
    await did.authenticate()
    ceramic.did = did

const encodeComposites = async (hash) => {

  try {
    const schema = await readFile(
      getFilePath("./composites/attestation.graphql")
    );

    // defining a new schema with the txHash of the EAS schema creation as the title
    const string = await schema.toString().replace("Attest", ('A'+ hash.slice(2, hash.length)));

    // using a virtual file instead of using fs write operations
    const file = new VFile({
      path: `./new.json`,
    })

    const newComposite = await Composite.create({
      ceramic,
      schema: string,
    });

    file.value = newComposite.toJSON()

    const deployComposite = await Composite.fromJSON({
      ceramic,
      definition: file.value,
  });

    // console.log(file.value)
   
    await deployComposite.startIndexingOn(ceramic)

    //return the stream ID of the new parent schema
    return deployComposite.modelIDs[0]

  }catch (err) {
    console.error(err)
  }
};

  const stream = await encodeComposites(identifier);
  // await mergeComposites();
  return stream
}

