import { clientPromise } from "@/lib/mongodb-client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 100;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("enriched-game-data");

    const orphans = await db.collection("dmc-items").aggregate([
      { $match: { ignore: { $ne: true } } },
      {
        $lookup: {
          from: "enriched-items",
          localField: "_id",
          foreignField: "dmc_entries.folioid",
          as: "match",
        },
      },
      { $match: { match: { $size: 0 } } },
      { $skip: skip },
      { $limit: limit },
    ]).toArray();

    return Response.json(orphans);
  } catch (error) {
    console.error("Database Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch" }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
