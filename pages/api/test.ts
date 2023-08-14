import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
import {dynamicCreate} from '../../scripts/comp.mjs'
// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
      const {hash, seed} = req.body
      console.log(hash.toString())
      const stream = await dynamicCreate(hash, seed)
      res.status(200).json({ stream });
};
