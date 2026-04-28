'use server';

import { fetchGameFromIGDB } from '@/lib/igdb';
import { clientPromise } from "@/lib/mongodb-client";

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
      .limit(5)
      .toArray();

    return { success: true, platforms: platforms.map(p => ({ id: p._id, name: p.name })) };
  } catch (error) {
    return { error: "Failed to search platforms" };
  }
}
