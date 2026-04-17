import { MongoClient } from "mongodb";

export async function GET() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db("enriched-game-data");

  const orphans = await db.collection("dmc-items").aggregate([
    {
      $lookup: {
        from: "enriched-items",
        localField: "_id",
        foreignField: "dmc_entries.folioid",
        as: "match",
      },
    },
    {
      $match: {
        match: { $size: 0 }, // Filter for items with no matches in enriched-items
      },
    },
    { $limit: 100 },
  ]).toArray();

  await client.close();
  return Response.json(orphans);
}



