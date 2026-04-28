import 'server-only';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    next: { revalidate: 3600 } // Cache the token for 1 hour
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Twitch Auth failed: ${data.message}`);
  }

  return data.access_token;
}

/**
 * Core logic to fetch game data. 
 * This is exported so it can be used by the Server Action or Server Components.
 */
export async function fetchGameFromIGDB(gameId) {
  const token = await getAccessToken();

  const query = `
    fields name, summary, release_dates.human, cover.image_id, genres.name, platforms.name;
    where id = ${gameId};
  `;

  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    },
    body: query
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("IGDB Query Error:", error);
    throw new Error("Failed to fetch data from IGDB");
  }

  const games = await response.json();
  return games.length > 0 ? games[0] : null;
}
