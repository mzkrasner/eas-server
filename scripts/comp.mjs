import fs from "fs-extra";
import { readFileSync, readdirSync } from 'fs';
import path, { extname, resolve } from 'path'
import { cwd } from "process";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {
    createComposite,
    readEncodedComposite,
    writeEncodedComposite,
    writeEncodedCompositeRuntime,
    mergeEncodedComposites
  } from "@composedb/devtools-node";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";
// import { env } from "./env.mjs";

const { readFile, readJSON, writeFile, writeJSON, ensureDir } = fs;
const ceramic = new CeramicClient("https://ceramic-temp.hirenodes.io/");

const getFilePath = (path) => {
  return path instanceof URL ? path.pathname : resolve(cwd(), path);
}

export const dynamicCreate = async(identifier, inputSeed) => {

    const seed = inputSeed
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
  let composite;
  try {
    const schema = await readFile(
      getFilePath("./composites/attestation.graphql")
    );
    const string = await schema.toString().replace("Attest", hash);
    await writeFile(getFilePath(`./composites/attest.graphql`), string);

    composite = await createComposite(ceramic, `./composites/attest.graphql`)
    await writeEncodedComposite(
      composite, 
      `./src/__generated__/${hash}.json`
    )
   
    const newDef = await readFile(
        getFilePath(`./src/__generated__/${hash}.json`)
      );
     const newString = await newDef.toString();
     const stream = newString.split('"')[7]
     return stream

  }catch (err) {
    console.error(err)
  }
};


const mergeComposites = async () => {
    const files = readdirSync('./src/__generated__/').filter(file => {return extname(file).toLowerCase() === '.json'})
    setTimeout(async () => {
      await mergeEncodedComposites(
        ceramic, 
        files.map(file => (`./src/__generated__/${file}`)), 
        './src/__generated__/definition.json'
      )
      await writeEncodedCompositeRuntime(
        ceramic,
        './src/__generated__/definition.json',
        './src/__generated__/definition.js'
      )
      const deployedComposite = await readEncodedComposite(ceramic, './src/__generated__/definition.json')
      deployedComposite.startIndexingOn(ceramic)
    }, 3000)
  }


  const stream = await encodeComposites(identifier);
  await mergeComposites();
  return stream
}


