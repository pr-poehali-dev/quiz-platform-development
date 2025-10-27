const API_URL = 'https://functions.poehali.dev/8ff7de3e-8280-40fb-bb63-2cf7ebb911e1';

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Game {
  game_id: string;
  code: string;
  players: Player[];
  current_image: string | null;
}

export const api = {
  async createGame(): Promise<{ game_id: string; code: string }> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_game' }),
    });
    return response.json();
  },

  async joinGame(gameCode: string, playerName: string): Promise<{ player_id: string; game_id: string; name: string }> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join_game',
        game_code: gameCode,
        player_name: playerName,
      }),
    });
    return response.json();
  },

  async updateScore(playerId: string, scoreDelta: number): Promise<{ new_score: number }> {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: playerId,
        score_delta: scoreDelta,
      }),
    });
    return response.json();
  },

  async getGameState(gameCode: string): Promise<Game> {
    const response = await fetch(`${API_URL}?game_code=${gameCode}`);
    return response.json();
  },

  async setImage(gameId: string, imageUrl: string): Promise<{ success: boolean }> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_image',
        game_id: gameId,
        image_url: imageUrl,
      }),
    });
    return response.json();
  },
};