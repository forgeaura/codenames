const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';

/**
 * Generate a clue from the AI Spymaster
 * @param {Array} board - The game board with word/team/revealed info
 * @param {string} team - The team to give a clue for ('red' or 'blue')
 * @returns {Promise<{word: string, count: number}>}
 */
export async function generateClue(board, team) {
    const myWords = board
        .filter(c => c.team === team && !c.revealed)
        .map(c => c.word);

    const opponentWords = board
        .filter(c => c.team === (team === 'red' ? 'blue' : 'red') && !c.revealed)
        .map(c => c.word);

    const neutralWords = board
        .filter(c => c.team === 'neutral' && !c.revealed)
        .map(c => c.word);

    const assassin = board
        .filter(c => c.team === 'assassin' && !c.revealed)
        .map(c => c.word);

    const prompt = `You are the Spymaster in a game of Codenames. You must give a ONE-WORD clue and a NUMBER.

Your team (${team.toUpperCase()}) needs to guess these words:
${myWords.join(', ')}

AVOID these opponent words:
${opponentWords.join(', ')}

NEUTRAL words (not terrible if guessed):
${neutralWords.join(', ')}

ASSASSIN (instant loss if guessed):
${assassin.join(', ')}

Rules:
1. Your clue must be a SINGLE WORD (no hyphens, no proper nouns from the board)
2. The number indicates how many of YOUR words relate to the clue
3. Aim to connect 2-3 words while avoiding opponent/assassin words
4. The clue cannot be any word on the board or a variant of one

Respond with ONLY this format (no explanation):
CLUE: [your one-word clue]
COUNT: [number of related words]`;

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.response.trim();

        // Parse response
        const clueMatch = text.match(/CLUE:\s*(\w+)/i);
        const countMatch = text.match(/COUNT:\s*(\d+)/i);

        if (!clueMatch || !countMatch) {
            console.warn('Could not parse AI response, using fallback');
            return { word: 'THINK', count: 1 };
        }

        return {
            word: clueMatch[1].toUpperCase(),
            count: parseInt(countMatch[1], 10)
        };
    } catch (error) {
        console.error('AI clue generation failed:', error);
        // Fallback clue
        return { word: 'GUESS', count: 1 };
    }
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaStatus() {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`);
        if (!response.ok) return { available: false };

        const data = await response.json();
        const hasModel = data.models?.some(m => m.name.includes(MODEL));

        return { available: true, hasModel, models: data.models };
    } catch {
        return { available: false };
    }
}
