'use server';

import { fetchGameFromIGDB } from '@/lib/igdb';
import { clientPromise } from "@/lib/mongodb-client";
import { revalidatePath } from "next/cache";

/**
 * Server Action to be called from the UI.
 * @param {number|string} gameId 
 */
export async function getGameById(gameId) {
  if (!gameId) {
    return { error: "Game ID is required" };
  }

  try {
    const gameData = await fetchGameFromIGDB(gameId);
    
    if (!gameData) {
      return { error: "No game found with that ID" };
    }

    return { success: true, data: gameData };
  } catch (error) {
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function searchPlatforms(query) {
  if (!query || query.length < 2) return { success: true, platforms: [] };

  try {
    const client = await clientPromise;
    const db = client.db("enriched-game-data");
    
    // Find up to 5 matching platforms
    const platforms = await db.collection("platform-data")
      .find({ name: { $regex: query, $options: 'i' } })
      .toArray();

    return { success: true, platforms: platforms.map(p => ({ id: p._id, name: p.name })) };
  } catch (error) {
    return { error: "Failed to search platforms" };
  }
}

export async function connectFolioToIgdb(igdbData, formData, folioId) {
  if (!igdbData || !folioId || !formData.platformId) {
    return { error: "Missing required data for connection" };
  }

  try {
    const client = await clientPromise;
    const db = client.db("enriched-game-data");

    // prepare the DMC entry object
    const newDmcEntry = {
      folioid: folioId,
      confidence: 1.0
    };

    // perform the Upsert on enriched-items
    await db.collection("enriched-items").updateOne(
      { _id: igdbData.id },
      {
        $set: {
          name: igdbData.name,
          cover: igdbData.cover,
          summary: igdbData.summary,
          platforms: igdbData.platforms,
          genres: igdbData.genres || [],
          release_date: igdbData.first_release_date
        },
        $addToSet: {
          dmc_entries: newDmcEntry
        }
      },
      { upsert: true }
    );

    // update the original dmc-item to reflect the correct platform
    // this removes it from the "Orphans" list 
    await db.collection("dmc-items").updateOne(
      { _id: folioId },
      { 
        $set: { 
          platform_id_guess: [formData.platformId] 
        } 
      }
    );

    revalidatePath('/orphans');
    return { success: true };
  } catch (error) {
    console.error("Database Connection Error:", error);
    return { error: "Failed to link items in database" };
  }
}
