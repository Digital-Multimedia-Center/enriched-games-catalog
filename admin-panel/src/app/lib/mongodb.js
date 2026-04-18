"use server";
import { clientPromise } from "./mongodb-client";

export async function markIgnored(folioid, isIgnore) {
  try {
    const db = (await clientPromise).db("enriched-game-data");
    const collection = db.collection("dmc-items");

    await collection.updateOne(
      { _id: folioid },
      { $set: { ignore: isIgnore } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false };
  }
}

export async function handleIgdbMatch(folioid, igdbId) {
  console.log(`Matching ${folioid} with IGDB: ${igdbId}`);
  return { success: true };
}
