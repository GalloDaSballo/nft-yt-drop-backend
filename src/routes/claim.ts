import express from "express";
import axios from "axios";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import ethers from "ethers";
import { MATIC_RPC, PROOF_OF_SUM_CONTRACT, WALLET_PK } from "../constants";
import db from "../db";

const router = express.Router();

import abiJSON = require("../abis/ProofOfSub.json");

export default router;

interface Drop {
  id: string;
  channelId: string;
  imageURI: string;
  endDate: Date;
}

interface SubItem {
  snippet: {
    publishedAt: string;
  };
}

interface Subscription {
  items: SubItem[];
}

const getSubscription = async (
  channelId: string,
  accessToken: string
): Promise<Subscription | null> => {
  try {
    const res = await axios({
      method: "get",
      url: `https://youtube.googleapis.com/youtube/v3/subscriptions?part=snippet%2CcontentDetails%2Cid&forChannelId=${channelId}&mine=true`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (err) {
    console.log("Exception in getSubscription", err);
    return null;
  }
};

const checkSubscriptionCriteria = (item: SubItem, drop: Drop): boolean => {
  if (!item || !drop) {
    return false;
  }
  console.log(
    "new Date(item.snippet.publishedAt).getTime()",
    new Date(item.snippet.publishedAt).getTime()
  );
  console.log(
    "new Date(drop.endDate).getTime()",
    new Date(drop.endDate).getTime()
  );
  console.log(
    "(boolean)",
    new Date(item.snippet.publishedAt).getTime() <=
      new Date(drop.endDate).getTime()
  );

  return (
    new Date(item.snippet.publishedAt).getTime() <=
    new Date(drop.endDate).getTime()
  );
};

const mint = async (address: string, imageURI: string, channelId: string) => {
  const wallet = new Wallet(WALLET_PK).connect(new JsonRpcProvider(MATIC_RPC));
  console.log("wallet address", await wallet.getAddress());

  console.log("Minting");
  console.log("address", address);
  console.log("imageURI", imageURI);
  // const abi = JSON.parse(`[${abiJSON}]`);
  // console.log("abi", abi);
  const proofOfSub = new Contract(PROOF_OF_SUM_CONTRACT, abiJSON, wallet);
  console.log("proofOfSub", proofOfSub);
  const receipt = await (
    await proofOfSub.awardItem(address, imageURI, channelId)
  ).wait();
  console.log("receipt", receipt);
  return receipt;
};

router.post("/", async (req, res) => {
  // Fetch Drop id
  const { drop, address, accessToken } = req.body;

  const foundDrop = await db<Drop>("drops").where("id", drop).first();

  if (!foundDrop) {
    return res.status(400).send("Please have a product dropId");
  }

  // Check if Subscribed
  const { channelId } = foundDrop;
  // API QUERY HERE
  const subscription = await getSubscription(channelId, accessToken);
  if (!subscription) {
    return res.status(400).send("Please subscribe");
  }

  console.log("subscription", subscription);
  const foundSubscriptionItem = subscription?.items?.[0];
  console.log("foundSubscriptionItem", foundSubscriptionItem);

  const shouldMint = await checkSubscriptionCriteria(
    foundSubscriptionItem,
    foundDrop
  );

  if (!shouldMint) {
    return res.status(400).send("You don't match the criteria for this drop");
  }
  try {
    // Mint NFT
    const result = await mint(address, foundDrop.imageURI, channelId);
    console.log("result", result);

    // Send Confirmation
    res.send({
      nft: {
        imageURI: foundDrop.imageURI,
      },
    });
  } catch (e) {
    res.status(400).send(e);
  }
});
