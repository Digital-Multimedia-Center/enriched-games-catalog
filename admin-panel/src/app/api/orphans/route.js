import { MongoClient } from "mongodb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 100;
  const skip = (page - 1) * limit;

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
        match: { $size: 0 },
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]).toArray();

  await client.close();
  return Response.json(orphans);
}
