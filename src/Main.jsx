import React, { useState, useEffect } from 'react';
import './Main.css';
import Modal from 'react-modal';
import video from "./background.mp4"
const modalStyles = {
    overlay: {
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    content: {
        maxWidth: '657px',
        margin: 'auto',
        backgroundColor: 'transparent',
        borderRadius: '0px',
        padding: '20px',
        marginLeft: '27.3%',
        position: 'absolute',
        marginTop: '0%',
    },
};

const Card = ({ card, handleClick, disabled }) => (
    <div
        className={`card ${card.flipped ? 'flipped' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => handleClick(card.id)}
    >
        {card.flipped ? card.value : '?'}
    </div>
);

const Main = () => {

    const levelDurations = {
        easy: 120,    // 2 minutes for Easy
        normal: 90,   // 1 minute 30 seconds for Normal
        hard: 45,     // 45 seconds for Hard
    };

    const initializeCards = () => {
        const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const cards = [];
        for (let i = 0; i < symbols.length; i++) {
            cards.push({ id: i * 2, value: symbols[i], flipped: false });
            cards.push({ id: i * 2 + 1, value: symbols[i], flipped: false });
        }
        return shuffleArray(cards);
    };

    const shuffleArray = (array) => {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    };

    const [selectedLevel, setSelectedLevel] = useState('easy');
    const [gameDuration, setGameDuration] = useState(levelDurations[selectedLevel]);
    const [cards, setCards] = useState(initializeCards());
    const [flippedCount, setFlippedCount] = useState(0);
    const [prevCard, setPrevCard] = useState(null);
    const [score, setScore] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);


    let timer;
    useEffect(() => {
        setGameDuration(levelDurations[selectedLevel]);
    }, [selectedLevel]);

    useEffect(() => {
        if (gameStarted && elapsedTime < gameDuration) {
            timer = setInterval(() => {
                setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
            }, 1000);
        } else if (elapsedTime >= gameDuration) {
            clearInterval(timer);
            if (score === cards.length / 2) {
                alert(`Congratulations! You won in ${elapsedTime} seconds.`);
            } else {
                alert("Oops, you lose. You took too long!");
            }
        }
        return () => {
            clearInterval(timer);
        };
    }, [gameStarted, elapsedTime, score, cards.length, gameDuration]);

    const startGame = () => {
        setGameStarted(true);
    };
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    const handleCardClick = (cardId) => {
        if (!gameStarted) {
            startGame(); // Start the game when the user clicks the first card
        }

        if (flippedCount === 2 || elapsedTime >= gameDuration) {
            return;
        }

        const updatedCards = cards.map((card) => ({ ...card }));
        const card = updatedCards.find((c) => c.id === cardId);

        if (!card.flipped) {
            card.flipped = true;
            setCards(updatedCards);
            setFlippedCount(flippedCount + 1);
            setPrevCard(flippedCount === 0 ? card : prevCard);

            if (flippedCount === 1) {
                if (prevCard.value === card.value) {
                    setScore(score + 1);
                    setFlippedCount(0);
                } else {
                    setTimeout(() => {
                        updatedCards.find((c) => c.id === cardId).flipped = false;
                        updatedCards.find((c) => c.id === prevCard.id).flipped = false;
                        setCards(updatedCards);
                        setFlippedCount(0);
                    }, 1000);
                }
            }
        }
    };

    const restartGame = () => {
        window.location.reload();
    };
    const handleLevelChange = (level) => {
        setSelectedLevel(level);
        setElapsedTime(0); // Reset the timer when changing levels
    };
    return (
        <>
         <video autoPlay loop muted className="video-background">
                <source src={video} type="video/mp4" />
            </video>
        <div className="App">
            <h1>Memory Game</h1>
            <div className="level-buttons">
                <button onClick={() => handleLevelChange('easy')}>Easy</button>
                <button onClick={() => handleLevelChange('normal')}>Normal</button>
                <button onClick={() => handleLevelChange('hard')}>Hard</button>
            </div>
            <div className="scoreboard">
                <p>Score: {score}</p>
                <p>Time: {formatTime(gameDuration - elapsedTime)}</p>
            </div>
            <div className="card-container">
                {cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        handleClick={handleCardClick}
                        disabled={flippedCount === 2 || elapsedTime >= gameDuration}
                    />
                ))}
            </div>
            <div className="button-container">
                <button id='game-btn' onClick={restartGame}>Restart</button>
                <button  id='game-btn'onClick={() => setShowInstructionsModal(true)}>How to Play</button>
            </div>

            <Modal
                isOpen={showInstructionsModal}
                onRequestClose={() => setShowInstructionsModal(false)}
                style={modalStyles}
                className="modal"
                contentLabel="How to Play Modal"
            >
                <div className="modal-content">
                    <span className="close" onClick={() => setShowInstructionsModal(false)}>
                        &times;
                    </span>
                    <h2>Memory Game - How to Play</h2>
                    <div>
                        <p><strong>Objective:</strong> The goal of the Memory Game is to find all the matching pairs of cards with the same symbols.</p>
                        <h3>Getting Started:</h3>
                        <ul>
                            <li><strong>Start a Game:</strong> Click the "Restart" button to begin a new game.</li>
                            <li><strong>Flipping Cards:</strong> You can flip over two cards at a time by clicking on them.</li>
                        </ul>
                        <h3>Game Rules:</h3>
                        <ul>
                            <li><strong>Matching Pairs:</strong> Look for cards with the same symbols. When you find a matching pair, they'll stay face-up.</li>
                            <li><strong>Remember Symbols:</strong> Try to remember where you've seen each symbol.</li>
                            <li><strong>Mismatch:</strong> If two flipped cards don't match, they'll flip back face-down, and you can try again.</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
        </>
    );
};

export default Main;
