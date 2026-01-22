// Game State
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const COLOR_NAMES = {
    red: 'RED',
    orange: 'ORANGE', 
    yellow: 'YELLOW',
    green: 'GREEN',
    blue: 'BLUE',
    purple: 'PURPLE'
};

let gameState = {
    targetColor: null,
    balloonCount: 4,
    correctCount: 0,
    incorrectCount: 0
};

// DOM Elements
const targetColorEl = document.getElementById('targetColor');
const balloonArea = document.getElementById('balloonArea');
const correctCountEl = document.getElementById('correctCount');
const incorrectCountEl = document.getElementById('incorrectCount');
const confettiContainer = document.getElementById('confettiContainer');
const settingsPanel = document.getElementById('settingsPanel');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const balloonCountDisplay = document.getElementById('balloonCountDisplay');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const speakBtn = document.getElementById('speakBtn');

// Audio context for buzzer sound
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play buzzer sound
function playBuzzer() {
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Play success sound
function playSuccess() {
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    
    // Play a happy arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const duration = 0.15;
    
    notes.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.2, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + duration);
        }, i * 100);
    });
}

// Speak the color using Web Speech API
function speakColor(color) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(`Pop the ${color} balloon`);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        
        // Try to get a friendly voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Samantha') || 
            v.name.includes('Karen') ||
            v.name.includes('Google') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

// Create explosive confetti burst from balloon position
function createConfetti(balloonElement) {
    const colors = ['#FF4757', '#FF7F50', '#FFD93D', '#2ED573', '#3498DB', '#9B59B6', '#FF6B9D', '#FF1493', '#00CED1', '#FFD700'];
    const shapes = ['square', 'circle', 'triangle'];
    
    // Get balloon position for explosion origin
    const rect = balloonElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    
    // Create LOTS of confetti pieces - explosive burst!
    const confettiCount = 150;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 15 + 8;
        
        // Random explosion angle and distance
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const velocity = Math.random() * 400 + 200;
        const endX = Math.cos(angle) * velocity;
        const endY = Math.sin(angle) * velocity - 200; // Bias upward
        
        // Random rotation
        const rotation = Math.random() * 720 - 360;
        
        let borderRadius = '0';
        let clipPath = 'none';
        if (shape === 'circle') {
            borderRadius = '50%';
        } else if (shape === 'triangle') {
            clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }
        
        confetti.style.cssText = `
            position: fixed;
            left: ${originX}px;
            top: ${originY}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${borderRadius};
            clip-path: ${clipPath};
            pointer-events: none;
            z-index: 1000;
            --end-x: ${endX}px;
            --end-y: ${endY}px;
            --rotation: ${rotation}deg;
            animation: confetti-explode ${Math.random() * 0.5 + 1}s cubic-bezier(0, 0.5, 0.5, 1) forwards;
            animation-delay: ${Math.random() * 0.1}s;
        `;
        
        confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => confetti.remove(), 2000);
    }
    
    // Add some sparkle/star particles too
    for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = '✨';
        
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const velocity = Math.random() * 300 + 150;
        const endX = Math.cos(angle) * velocity;
        const endY = Math.sin(angle) * velocity - 150;
        
        sparkle.style.cssText = `
            position: fixed;
            left: ${originX}px;
            top: ${originY}px;
            font-size: ${Math.random() * 20 + 15}px;
            pointer-events: none;
            z-index: 1001;
            --end-x: ${endX}px;
            --end-y: ${endY}px;
            animation: sparkle-explode ${Math.random() * 0.3 + 0.8}s ease-out forwards;
        `;
        
        confettiContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
    }
}

// Show celebration text
function showCelebration() {
    const celebrations = ['YAY!', 'GREAT!', 'WOW!', 'SUPER!', '🎉'];
    const text = celebrations[Math.floor(Math.random() * celebrations.length)];
    
    const celebEl = document.createElement('div');
    celebEl.className = 'celebration-text';
    celebEl.textContent = text;
    document.body.appendChild(celebEl);
    
    setTimeout(() => celebEl.remove(), 1000);
}

// Generate random balloons
function generateBalloons() {
    balloonArea.innerHTML = '';
    
    // Start with all available colors and shuffle them
    const availableColors = [...COLORS];
    for (let i = availableColors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableColors[i], availableColors[j]] = [availableColors[j], availableColors[i]];
    }
    
    // Ensure target color is included by swapping it into position if needed
    const targetIndex = availableColors.indexOf(gameState.targetColor);
    if (targetIndex >= gameState.balloonCount) {
        // Target color is outside our selection, swap it in
        const swapIndex = Math.floor(Math.random() * gameState.balloonCount);
        [availableColors[swapIndex], availableColors[targetIndex]] = 
            [availableColors[targetIndex], availableColors[swapIndex]];
    }
    
    // Take only the number of balloons we need (all unique colors)
    const balloonColors = availableColors.slice(0, gameState.balloonCount);
    
    // Shuffle one more time for good measure
    for (let i = balloonColors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balloonColors[i], balloonColors[j]] = [balloonColors[j], balloonColors[i]];
    }
    
    // Create balloon elements
    balloonColors.forEach((color, index) => {
        const balloon = document.createElement('div');
        balloon.className = `balloon ${color}`;
        balloon.dataset.color = color;
        balloon.setAttribute('role', 'button');
        balloon.setAttribute('aria-label', `${color} balloon`);
        balloon.setAttribute('tabindex', '0');
        balloon.innerHTML = `
            <div class="balloon-body"></div>
            <div class="balloon-string"></div>
        `;
        
        // Add slight random delay to float animation
        balloon.style.animationDelay = `${Math.random() * -3}s`;
        
        balloon.addEventListener('click', handleBalloonClick);
        balloon.addEventListener('touchstart', handleBalloonClick, { passive: true });
        
        // Allow keyboard activation
        balloon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBalloonClick(e);
            }
        });
        
        balloonArea.appendChild(balloon);
    });
}

// Handle balloon click
function handleBalloonClick(e) {
    e.preventDefault();
    
    // Initialize audio on first interaction
    initAudio();
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const balloon = e.currentTarget;
    const clickedColor = balloon.dataset.color;
    
    // Prevent double-handling
    if (balloon.classList.contains('popping') || balloon.classList.contains('wiggle')) {
        return;
    }
    
    if (clickedColor === gameState.targetColor) {
        // Correct!
        gameState.correctCount++;
        updateScores();
        saveGameState();
        
        // Explode confetti FROM the balloon before it pops!
        createConfetti(balloon);
        playSuccess();
        showCelebration();
        
        balloon.classList.add('popping');
        
        // Start new round after animation
        setTimeout(() => {
            newRound();
        }, 1200);
    } else {
        // Wrong!
        gameState.incorrectCount++;
        updateScores();
        saveGameState();
        
        playBuzzer();
        balloon.classList.add('wiggle');
        
        // Remove wiggle class after animation
        setTimeout(() => {
            balloon.classList.remove('wiggle');
        }, 500);
    }
}

// Pick a new target color
function pickNewColor() {
    const availableColors = COLORS.filter(c => c !== gameState.targetColor);
    gameState.targetColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    targetColorEl.textContent = COLOR_NAMES[gameState.targetColor];
    targetColorEl.className = `target-color ${gameState.targetColor}`;
}

// Start a new round
function newRound() {
    pickNewColor();
    generateBalloons();
    
    // Speak the color after a short delay
    setTimeout(() => {
        speakColor(gameState.targetColor);
    }, 300);
}

// Update score display
function updateScores() {
    correctCountEl.textContent = gameState.correctCount;
    incorrectCountEl.textContent = gameState.incorrectCount;
}

// Save game state to localStorage
function saveGameState() {
    const saveData = {
        balloonCount: gameState.balloonCount,
        correctCount: gameState.correctCount,
        incorrectCount: gameState.incorrectCount
    };
    localStorage.setItem('balloonColorGame', JSON.stringify(saveData));
}

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('balloonColorGame');
    if (saved) {
        const data = JSON.parse(saved);
        // Cap balloon count to number of available colors
        gameState.balloonCount = Math.min(data.balloonCount || 4, COLORS.length);
        gameState.correctCount = data.correctCount || 0;
        gameState.incorrectCount = data.incorrectCount || 0;
    }
}

// Settings handlers
function openSettings() {
    settingsPanel.classList.add('open');
    balloonCountDisplay.textContent = gameState.balloonCount;
}

function closeSettings() {
    settingsPanel.classList.remove('open');
    saveGameState();
    generateBalloons(); // Regenerate with new count
}

function increaseBalloonCount() {
    if (gameState.balloonCount < COLORS.length) {
        gameState.balloonCount++;
        balloonCountDisplay.textContent = gameState.balloonCount;
    }
}

function decreaseBalloonCount() {
    if (gameState.balloonCount > 2) {
        gameState.balloonCount--;
        balloonCountDisplay.textContent = gameState.balloonCount;
    }
}

function resetScores() {
    gameState.correctCount = 0;
    gameState.incorrectCount = 0;
    updateScores();
    saveGameState();
}

// Event listeners
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
increaseBtn.addEventListener('click', increaseBalloonCount);
decreaseBtn.addEventListener('click', decreaseBalloonCount);
resetScoresBtn.addEventListener('click', resetScores);
speakBtn.addEventListener('click', () => speakColor(gameState.targetColor));

// Close settings when clicking outside
settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        closeSettings();
    }
});

// Load voices when available (needed for some browsers)
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
    };
}

// Initialize the game
function init() {
    loadGameState();
    updateScores();
    newRound();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
