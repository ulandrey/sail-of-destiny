// 🏴‍☠️ Sail of Destiny - Ocean Adventure Sound System
class OceanSoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.soundToggle = null;
        this.bgMusicGain = null;
        this.sfxGain = null;

        // Ocean ambiance
        this.oceanAmbiance = null;
        this.stormAmbiance = null;

        // Initialize audio context on user interaction
        this.initAudioContext();
        this.bindControls();
        this.createOceanAmbiance();
    }

    initAudioContext() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.setupAudioNodes();
                this.startBackgroundMusic();
            }
        }, { once: true });
    }

    setupAudioNodes() {
        // Create gain nodes for volume control
        this.bgMusicGain = this.audioContext.createGain();
        this.sfxGain = this.audioContext.createGain();

        this.bgMusicGain.connect(this.audioContext.destination);
        this.sfxGain.connect(this.audioContext.destination);

        this.bgMusicGain.gain.value = 0.3;
        this.sfxGain.gain.value = 0.5;
    }

    createOceanAmbiance() {
        // Create continuous ocean sounds
        this.createOceanWaveSound();
        this.createStormSound();
    }

    createOceanWaveSound() {
        const bufferSize = this.audioContext ? this.audioContext.sampleRate * 4 : 44100 * 4;
        const buffer = this.audioContext ? this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate) : null;

        if (buffer) {
            const data = buffer.getChannelData(0);

            // Generate ocean wave noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() - 0.5) * 0.1 *
                    Math.sin(i * 0.001) *
                    Math.cos(i * 0.0003);
            }

            this.oceanAmbiance = buffer;
        }
    }

    createStormSound() {
        const bufferSize = this.audioContext ? this.audioContext.sampleRate * 2 : 44100 * 2;
        const buffer = this.audioContext ? this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate) : null;

        if (buffer) {
            const data = buffer.getChannelData(0);

            // Generate storm sound with thunder
            for (let i = 0; i < bufferSize; i++) {
                const noise = (Math.random() - 0.5) * 0.3;
                const thunder = Math.random() < 0.01 ? (Math.random() - 0.5) * 0.8 : 0;
                data[i] = noise + thunder;
            }

            this.stormAmbiance = buffer;
        }
    }

    startBackgroundMusic() {
        if (!this.audioContext || !this.oceanAmbiance) return;

        // Play continuous ocean sound
        const source = this.audioContext.createBufferSource();
        source.buffer = this.oceanAmbiance;
        source.loop = true;
        source.connect(this.bgMusicGain);
        source.start();
        this.oceanSource = source;
    }

    playStormMusic() {
        if (!this.audioContext || !this.stormAmbiance) return;

        // Stop normal music and start storm music
        if (this.oceanSource) {
            this.oceanSource.stop();
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.stormAmbiance;
        source.loop = true;
        source.connect(this.bgMusicGain);
        source.start();
        this.stormSource = source;
    }

    stopStormMusic() {
        if (this.stormSource) {
            this.stormSource.stop();
            this.startBackgroundMusic();
        }
    }

    bindControls() {
        this.soundToggle = document.getElementById('soundToggle');
        this.soundToggle.addEventListener('click', () => this.toggleSound());
    }

    toggleSound() {
        this.enabled = !this.enabled;
        this.soundToggle.textContent = this.enabled ? '🔊' : '🔇';
        this.soundToggle.classList.toggle('muted', !this.enabled);

        // Adjust volume
        if (this.bgMusicGain) {
            this.bgMusicGain.gain.value = this.enabled ? 0.3 : 0;
        }
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.enabled ? 0.5 : 0;
        }

        // Play test sound when enabling
        if (this.enabled) {
            this.playOceanWave();
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Ocean and Ship Sounds
    playOceanWave() {
        if (!this.enabled) return;

        // Gentle wave sound
        this.playTone(100, 0.8, 'sine', 0.1);
        setTimeout(() => this.playTone(80, 0.6, 'sine', 0.08), 100);
        setTimeout(() => this.playTone(60, 0.4, 'sine', 0.06), 200);
    }

    playShipMovement() {
        if (!this.enabled || Math.random() > 0.3) return;

        // Soft wood creak sound
        this.playTone(200, 0.1, 'triangle', 0.05);
        setTimeout(() => this.playTone(180, 0.1, 'triangle', 0.04), 50);
    }

    playSailWind() {
        if (!this.enabled || Math.random() > 0.4) return;

        // Wind in sails
        this.playTone(400, 0.3, 'sawtooth', 0.06);
        this.playTone(600, 0.2, 'sawtooth', 0.04);
    }

    // Collision and Damage Sounds
    playShipCrash() {
        if (!this.enabled) return;

        // Dramatic crash sound
        this.playTone(150, 0.2, 'square', 0.3);
        setTimeout(() => this.playTone(100, 0.3, 'square', 0.25), 100);
        setTimeout(() => this.playTone(80, 0.4, 'square', 0.2), 200);
        setTimeout(() => this.playTone(60, 0.3, 'square', 0.15), 300);
    }

    playIcebergHit() {
        if (!this.enabled) return;

        // Ice cracking sound
        this.playTone(800, 0.1, 'triangle', 0.2);
        setTimeout(() => this.playTone(1200, 0.15, 'triangle', 0.15), 50);
        setTimeout(() => this.playTone(600, 0.2, 'square', 0.1), 100);
    }

    playWhirlpoolSound() {
        if (!this.enabled) return;

        // Swirling water sound
        this.playTone(200, 0.5, 'sine', 0.15);
        this.playTone(150, 0.6, 'sine', 0.12);
        setTimeout(() => {
            this.playTone(250, 0.4, 'sine', 0.1);
            this.playTone(100, 0.5, 'sine', 0.08);
        }, 200);
    }

    playWoodCreak() {
        if (!this.enabled) return;

        // Wood stress sound
        this.playTone(300, 0.2, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(250, 0.15, 'sawtooth', 0.08), 50);
    }

    // Treasure Sounds
    playTreasureCollect() {
        if (!this.enabled) return;

        // Sparkling treasure sound
        this.playTone(523.25, 0.1, 'triangle', 0.2); // C5
        setTimeout(() => this.playTone(659.25, 0.15, 'triangle', 0.18), 50); // E5
        setTimeout(() => this.playTone(783.99, 0.2, 'triangle', 0.16), 100); // G5
        setTimeout(() => this.playTone(1046.5, 0.25, 'triangle', 0.14), 150); // C6
    }

    playCoinCollect() {
        if (!this.enabled) return;

        // Coin jingle
        this.playTone(800, 0.05, 'square', 0.15);
        setTimeout(() => this.playTone(1000, 0.05, 'square', 0.12), 50);
        setTimeout(() => this.playTone(1200, 0.08, 'square', 0.1), 100);
    }

    playChestOpen() {
        if (!this.enabled) return;

        // Heavy chest opening
        this.playTone(150, 0.3, 'square', 0.2);
        setTimeout(() => this.playTone(400, 0.1, 'triangle', 0.15), 200);
        setTimeout(() => this.playTone(600, 0.15, 'triangle', 0.12), 300);
    }

    // Power-up Sounds
    playSpeedBoost() {
        if (!this.enabled) return;

        // Speed boost whoosh
        this.playTone(300, 0.1, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(400, 0.15, 'sawtooth', 0.18), 50);
        setTimeout(() => this.playTone(500, 0.2, 'sawtooth', 0.16), 100);
        setTimeout(() => this.playTone(600, 0.15, 'sawtooth', 0.14), 150);
    }

    playShieldActivate() {
        if (!this.enabled) return;

        // Shield bubble sound
        this.playTone(800, 0.2, 'sine', 0.15);
        setTimeout(() => this.playTone(600, 0.2, 'sine', 0.12), 100);
        setTimeout(() => this.playTone(400, 0.2, 'sine', 0.1), 200);
    }

    playSlowTime() {
        if (!this.enabled) return;

        // Time slow effect
        this.playTone(200, 0.3, 'triangle', 0.2);
        setTimeout(() => this.playTone(250, 0.3, 'triangle', 0.18), 150);
        setTimeout(() => this.playTone(300, 0.3, 'triangle', 0.16), 300);
    }

    // Weather Sounds
    playThunder() {
        if (!this.enabled) return;

        // Thunder rumble
        this.playTone(80, 0.8, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(60, 1.0, 'sawtooth', 0.25), 200);
        setTimeout(() => this.playTone(40, 1.2, 'sawtooth', 0.2), 400);
    }

    playLightning() {
        if (!this.enabled) return;

        // Sharp lightning crack
        this.playTone(2000, 0.05, 'square', 0.3);
        setTimeout(() => this.playTone(1000, 0.1, 'square', 0.25), 50);
    }

    playWindGust() {
        if (!this.enabled) return;

        // Strong wind gust
        this.playTone(400, 0.4, 'sawtooth', 0.15);
        this.playTone(500, 0.3, 'sawtooth', 0.12);
        this.playTone(300, 0.5, 'sawtooth', 0.1);
    }

    playRain() {
        if (!this.enabled) return;

        // Rain pitter-patter
        this.playTone(800, 0.05, 'noise', 0.08);
        setTimeout(() => this.playTone(900, 0.05, 'noise', 0.06), 100);
        setTimeout(() => this.playTone(850, 0.05, 'noise', 0.07), 200);
    }

    // Game State Sounds
    playGameOver() {
        if (!this.enabled) return;

        // Sad game over melody
        this.playTone(523.25, 0.3, 'sine', 0.2); // C5
        setTimeout(() => this.playTone(415.30, 0.3, 'sine', 0.18), 300); // Ab4
        setTimeout(() => this.playTone(329.63, 0.3, 'sine', 0.16), 600); // E4
        setTimeout(() => this.playTone(261.63, 0.4, 'sine', 0.14), 900); // C4
        setTimeout(() => this.playTone(196.00, 0.5, 'sine', 0.12), 1300); // G3
    }

    playStartGame() {
        if (!this.enabled) return;

        // Adventure starts!
        this.playTone(440, 0.1, 'square', 0.2); // A4
        setTimeout(() => this.playTone(554.37, 0.1, 'square', 0.18), 100); // C#5
        setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.16), 200); // E5
        setTimeout(() => this.playTone(880, 0.2, 'square', 0.2), 300); // A5
        setTimeout(() => this.playTone(1108.73, 0.3, 'square', 0.22), 500); // C#6
    }

    playNewHighScore() {
        if (!this.enabled) return;

        // Celebratory fanfare
        this.playTone(523.25, 0.2, 'triangle', 0.25); // C5
        setTimeout(() => this.playTone(659.25, 0.2, 'triangle', 0.23), 200); // E5
        setTimeout(() => this.playTone(783.99, 0.2, 'triangle', 0.21), 400); // G5
        setTimeout(() => this.playTone(1046.5, 0.3, 'triangle', 0.25), 600); // C6
        setTimeout(() => this.playTone(1318.51, 0.4, 'triangle', 0.28), 900); // E6
    }

    // UI Sounds
    playButtonClick() {
        if (!this.enabled) return;

        // Click sound
        this.playTone(600, 0.05, 'square', 0.1);
    }

    playHover() {
        if (!this.enabled || Math.random() > 0.5) return;

        // Hover sound
        this.playTone(800, 0.03, 'triangle', 0.05);
    }

    playUnlock() {
        if (!this.enabled) return;

        // Unlock achievement sound
        this.playTone(440, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.18), 100);
        setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.2), 200);
        setTimeout(() => this.playTone(880, 0.2, 'sine', 0.25), 350);
    }
}

// Create noise generator for sound effects
if (typeof AudioContext !== 'undefined') {
    AudioContext.prototype.createNoise = function() {
        const bufferSize = this.sampleRate * 2;
        const buffer = this.createBuffer(1, bufferSize, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() - 0.5) * 2;
        }

        const source = this.createBufferSource();
        source.buffer = buffer;
        return source;
    };
}

// Export for use in main game
window.OceanSoundManager = OceanSoundManager;