'use server';

import { fetchGameFromIGDB } from '@/lib/igdb';

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
