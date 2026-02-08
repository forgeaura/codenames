import './Card.css';

export function Card({ word, team, revealed, isSpymaster, onClick, disabled }) {
    const getCardClass = () => {
        const classes = ['card'];

        if (revealed || isSpymaster) {
            classes.push(`card--${team}`);
            if (revealed) classes.push('card--revealed');
        } else {
            classes.push('card--hidden');
        }

        if (disabled) classes.push('card--disabled');

        return classes.join(' ');
    };

    return (
        <button
            className={getCardClass()}
            onClick={onClick}
            disabled={disabled || revealed}
        >
            <span className="card__word">{word}</span>
            {isSpymaster && !revealed && (
                <span className="card__team-indicator">{team[0].toUpperCase()}</span>
            )}
        </button>
    );
}
