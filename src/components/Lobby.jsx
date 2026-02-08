import { useState } from 'react';
import { generateGameId } from '../services/supabase';
import './Lobby.css';

export function Lobby({ onJoinGame }) {
    const [gameId, setGameId] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        const newId = generateGameId();
        onJoinGame(newId);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        const trimmed = gameId.trim().toLowerCase();
        if (!trimmed) {
            setError('Please enter a game code');
            return;
        }
        onJoinGame(trimmed);
    };

    return (
        <div className="lobby">
            <div className="lobby__card">
                <div className="lobby__header">
                    <h1 className="lobby__title">CODENAMES</h1>
                    <p className="lobby__subtitle">🤖 AI Spymaster Edition</p>
                </div>

                <div className="lobby__actions">
                    <button className="lobby__btn lobby__btn--create" onClick={handleCreate}>
                        <span className="lobby__btn-icon">🎮</span>
                        Create New Game
                    </button>

                    <div className="lobby__divider">
                        <span>or join existing</span>
                    </div>

                    <form className="lobby__join-form" onSubmit={handleJoin}>
                        <input
                            type="text"
                            className="lobby__input"
                            placeholder="Enter game code (e.g. cosmic-banana)"
                            value={gameId}
                            onChange={(e) => {
                                setGameId(e.target.value);
                                setError('');
                            }}
                        />
                        {error && <p className="lobby__error">{error}</p>}
                        <button type="submit" className="lobby__btn lobby__btn--join">
                            <span className="lobby__btn-icon">🚀</span>
                            Join Game
                        </button>
                    </form>
                </div>

                <div className="lobby__rules">
                    <h3>How to Play</h3>
                    <ul>
                        <li>🎯 Two teams (Red & Blue) compete to find their agents</li>
                        <li>🤖 AI Spymaster gives one-word clues + a number</li>
                        <li>👆 Click cards to guess - match the clue!</li>
                        <li>💀 Avoid the Assassin card (instant loss)</li>
                        <li>🏆 First team to find all their agents wins!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
