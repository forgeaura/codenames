import { Card } from './Card';
import './GameBoard.css';

export function GameBoard({
    game,
    isSpymaster,
    generatingClue,
    onCardClick,
    onRequestClue,
    onEndTurn
}) {
    if (!game) return null;

    const { board, current_team, current_clue, guesses_remaining, red_remaining, blue_remaining, winner } = game;

    return (
        <div className="game-board">
            {/* Header with scores */}
            <header className="game-header">
                <div className={`team-score team-score--red ${current_team === 'red' ? 'team-score--active' : ''}`}>
                    <span className="team-score__label">RED</span>
                    <span className="team-score__count">{red_remaining}</span>
                </div>

                <div className="game-title">
                    <h1>CODENAMES</h1>
                    <p className="ai-badge">🤖 AI Spymaster</p>
                </div>

                <div className={`team-score team-score--blue ${current_team === 'blue' ? 'team-score--active' : ''}`}>
                    <span className="team-score__label">BLUE</span>
                    <span className="team-score__count">{blue_remaining}</span>
                </div>
            </header>

            {/* Winner banner */}
            {winner && (
                <div className={`winner-banner winner-banner--${winner}`}>
                    🎉 {winner.toUpperCase()} TEAM WINS! 🎉
                </div>
            )}

            {/* Clue display */}
            <div className="clue-section">
                {current_clue ? (
                    <div className={`clue-display clue-display--${current_team}`}>
                        <span className="clue-word">{current_clue.word}</span>
                        <span className="clue-count">{current_clue.count}</span>
                        <span className="guesses-left">({guesses_remaining} guesses left)</span>
                    </div>
                ) : (
                    <div className="clue-placeholder">
                        {generatingClue ? (
                            <span className="generating">🤖 AI is thinking...</span>
                        ) : (
                            <span>Waiting for clue...</span>
                        )}
                    </div>
                )}
            </div>

            {/* Game grid */}
            <div className="board-grid">
                {board.map((card, index) => (
                    <Card
                        key={index}
                        word={card.word}
                        team={card.team}
                        revealed={card.revealed}
                        isSpymaster={isSpymaster}
                        onClick={() => onCardClick(index)}
                        disabled={!current_clue || winner || isSpymaster}
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="game-controls">
                <button
                    className="control-btn control-btn--spymaster"
                    onClick={() => { }}
                    data-active={isSpymaster}
                >
                    {isSpymaster ? '👁️ Spymaster View' : '👤 Player View'}
                </button>

                {!winner && !current_clue && (
                    <button
                        className={`control-btn control-btn--clue control-btn--${current_team}`}
                        onClick={onRequestClue}
                        disabled={generatingClue}
                    >
                        {generatingClue ? '🤖 Generating...' : `🎯 Get ${current_team.toUpperCase()} Clue`}
                    </button>
                )}

                {!winner && current_clue && (
                    <button
                        className="control-btn control-btn--end"
                        onClick={onEndTurn}
                    >
                        ⏭️ End Turn
                    </button>
                )}
            </div>
        </div>
    );
}
