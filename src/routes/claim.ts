import express from "express";
import axios from "axios";
import db from "../db";

const router = express.Router();

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

  return (
    new Date(item.snippet.publishedAt).getTime() <=
    new Date(drop.endDate).getTime()
  );
};

const mint = async (address: string, imageURI: string) => {
  console.log("Minting");
  console.log("address", address);
  console.log("imageURI", imageURI);
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

  // Mint NFT
  await mint(address, foundDrop.imageURI);

  // Send Confirmation
  res.send({
    nft: {
      address: "",
      tokenId: "",
    },
  });
});
