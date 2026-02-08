import { useState, useEffect, useCallback } from 'react';
import {
    getGame,
    createGame,
    subscribeToGame,
    revealCard,
    submitClue,
    endTurn
} from '../services/supabase';
import { generateClue } from '../services/ollama';

export function useGameState(gameId) {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSpymaster, setIsSpymaster] = useState(false);
    const [generatingClue, setGeneratingClue] = useState(false);

    // Fetch or create game
    useEffect(() => {
        if (!gameId) return;

        let unsubscribe;

        async function initGame() {
            try {
                setLoading(true);
                let gameData = await getGame(gameId);

                if (!gameData) {
                    gameData = await createGame(gameId);
                }

                setGame(gameData);
                setError(null);

                // Subscribe to realtime updates
                unsubscribe = subscribeToGame(gameId, (updatedGame) => {
                    setGame(updatedGame);
                });
            } catch (err) {
                console.error('Failed to init game:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        initGame();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [gameId]);

    // Handle card click
    const handleCardClick = useCallback(async (index) => {
        if (!game || game.winner) return;
        if (isSpymaster) return; // Spymasters can't click cards
        if (game.board[index].revealed) return;
        if (!game.current_clue) return; // Must have a clue first

        try {
            const updatedGame = await revealCard(gameId, index, game);
            setGame(updatedGame);
        } catch (err) {
            console.error('Failed to reveal card:', err);
        }
    }, [game, gameId, isSpymaster]);

    // Request AI clue
    const requestAIClue = useCallback(async () => {
        if (!game || game.winner || game.current_clue) return;

        setGeneratingClue(true);
        try {
            const clue = await generateClue(game.board, game.current_team);
            await submitClue(gameId, clue.word, clue.count);
        } catch (err) {
            console.error('Failed to generate clue:', err);
        } finally {
            setGeneratingClue(false);
        }
    }, [game, gameId]);

    // End turn manually
    const handleEndTurn = useCallback(async () => {
        if (!game || game.winner) return;

        try {
            await endTurn(gameId, game.current_team);
        } catch (err) {
            console.error('Failed to end turn:', err);
        }
    }, [game, gameId]);

    // Toggle spymaster view
    const toggleSpymaster = useCallback(() => {
        setIsSpymaster(prev => !prev);
    }, []);

    return {
        game,
        loading,
        error,
        isSpymaster,
        generatingClue,
        handleCardClick,
        requestAIClue,
        handleEndTurn,
        toggleSpymaster
    };
}
