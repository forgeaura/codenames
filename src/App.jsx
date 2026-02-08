import { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { useGameState } from './hooks/useGameState';
import './App.css';

function App() {
  const [currentGameId, setCurrentGameId] = useState(null);

  // Check URL for game ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameIdFromUrl = params.get('game');
    if (gameIdFromUrl) {
      setCurrentGameId(gameIdFromUrl);
    }
  }, []);

  const handleJoinGame = (gameId) => {
    setCurrentGameId(gameId);
    // Update URL without reload
    window.history.pushState({}, '', `?game=${gameId}`);
  };

  const handleLeaveGame = () => {
    setCurrentGameId(null);
    window.history.pushState({}, '', '/');
  };

  if (!currentGameId) {
    return <Lobby onJoinGame={handleJoinGame} />;
  }

  return (
    <GameWrapper
      gameId={currentGameId}
      onLeave={handleLeaveGame}
    />
  );
}

function GameWrapper({ gameId, onLeave }) {
  const {
    game,
    loading,
    error,
    isSpymaster,
    generatingClue,
    handleCardClick,
    requestAIClue,
    handleEndTurn,
    toggleSpymaster
  } = useGameState(gameId);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={onLeave}>Back to Lobby</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <nav className="game-nav">
        <button className="nav-btn" onClick={onLeave}>
          ← Leave Game
        </button>
        <div className="game-code">
          Game: <strong>{gameId}</strong>
          <button
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            title="Copy link"
          >
            📋
          </button>
        </div>
        <button
          className={`nav-btn nav-btn--spymaster ${isSpymaster ? 'active' : ''}`}
          onClick={toggleSpymaster}
        >
          {isSpymaster ? '👁️ Spymaster' : '👤 Player'}
        </button>
      </nav>

      <GameBoard
        game={game}
        isSpymaster={isSpymaster}
        generatingClue={generatingClue}
        onCardClick={handleCardClick}
        onRequestClue={requestAIClue}
        onEndTurn={handleEndTurn}
      />
    </div>
  );
}

export default App;
