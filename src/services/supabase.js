import { createClient } from '@supabase/supabase-js';

// Local development Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3001';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Realtime WebSocket URL for subscriptions
const realtimeUrl = import.meta.env.VITE_REALTIME_URL || 'ws://localhost:4000/socket';

/**
 * Generate a fun game ID like "cosmic-banana"
 */
const adjectives = ['cosmic', 'fuzzy', 'sneaky', 'mighty', 'lazy', 'bold', 'swift', 'clever', 'wild', 'quiet'];
const nouns = ['banana', 'dragon', 'ninja', 'panda', 'rocket', 'wizard', 'tiger', 'falcon', 'phoenix', 'robot'];

export function generateGameId() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`;
}

/**
 * Fetch random words for a new game board
 */
export async function fetchRandomWords(count = 25) {
  const { data, error } = await supabase
    .from('words')
    .select('word')
    .limit(400);
  
  if (error) throw error;
  
  // Shuffle and pick 25
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(w => w.word);
}

/**
 * Create a new game with shuffled board
 */
export async function createGame(gameId) {
  const words = await fetchRandomWords(25);
  
  // Assign teams: 9 red, 8 blue, 1 assassin, 7 neutral
  const teams = [
    ...Array(9).fill('red'),
    ...Array(8).fill('blue'),
    ...Array(7).fill('neutral'),
    'assassin'
  ].sort(() => Math.random() - 0.5);
  
  const board = words.map((word, i) => ({
    word,
    team: teams[i],
    revealed: false
  }));
  
  const { data, error } = await supabase
    .from('games')
    .insert({
      id: gameId,
      board,
      current_team: 'red',
      red_remaining: 9,
      blue_remaining: 8
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get game by ID
 */
export async function getGame(gameId) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Reveal a card and update game state
 */
export async function revealCard(gameId, cardIndex, game) {
  const board = [...game.board];
  const card = board[cardIndex];
  
  if (card.revealed) return game;
  
  card.revealed = true;
  
  let updates = { board };
  
  // Check what was revealed
  if (card.team === 'assassin') {
    // Game over - other team wins
    updates.winner = game.current_team === 'red' ? 'blue' : 'red';
  } else if (card.team === game.current_team) {
    // Correct guess - decrement remaining
    if (game.current_team === 'red') {
      updates.red_remaining = game.red_remaining - 1;
      if (updates.red_remaining === 0) updates.winner = 'red';
    } else {
      updates.blue_remaining = game.blue_remaining - 1;
      if (updates.blue_remaining === 0) updates.winner = 'blue';
    }
    updates.guesses_remaining = game.guesses_remaining - 1;
    
    // If no guesses left, switch turn
    if (updates.guesses_remaining <= 0 && !updates.winner) {
      updates.current_team = game.current_team === 'red' ? 'blue' : 'red';
      updates.current_clue = null;
      updates.guesses_remaining = 0;
    }
  } else {
    // Wrong team or neutral - switch turn
    if (card.team === 'red') {
      updates.red_remaining = game.red_remaining - 1;
      if (updates.red_remaining === 0) updates.winner = 'red';
    } else if (card.team === 'blue') {
      updates.blue_remaining = game.blue_remaining - 1;
      if (updates.blue_remaining === 0) updates.winner = 'blue';
    }
    updates.current_team = game.current_team === 'red' ? 'blue' : 'red';
    updates.current_clue = null;
    updates.guesses_remaining = 0;
  }
  
  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Submit AI clue to game
 */
export async function submitClue(gameId, clueWord, clueCount) {
  const { data, error } = await supabase
    .from('games')
    .update({
      current_clue: { word: clueWord, count: clueCount },
      guesses_remaining: clueCount + 1  // +1 bonus guess
    })
    .eq('id', gameId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * End turn manually
 */
export async function endTurn(gameId, currentTeam) {
  const { data, error } = await supabase
    .from('games')
    .update({
      current_team: currentTeam === 'red' ? 'blue' : 'red',
      current_clue: null,
      guesses_remaining: 0
    })
    .eq('id', gameId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Subscribe to game updates
 */
export function subscribeToGame(gameId, callback) {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
  
  return () => supabase.removeChannel(channel);
}
