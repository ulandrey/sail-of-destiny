// 🏴‍☠️ Sail of Destiny - Pirate Adventure Game
class SailOfDestiny {
    constructor() {
        // Game State
        this.isPlaying = false;
        this.isPaused = false;
        this.distance = 0;
        this.treasures = 0;
        this.health = 100;
        this.gameSpeed = 1;

        // Ship Position
        this.shipPosition = { x: 200, y: 250 };
        this.shipVelocity = { x: 0, y: 0 };

        // Game Objects
        this.obstacles = [];
        this.treasureItems = [];
        this.powerUps = [];

        // Weather System
        this.currentWeather = 'clear';
        this.weatherIntensity = 0;

        // Power-ups State
        this.activeBoosts = {
            speed: 0,
            shield: 0,
            slowTime: 0
        };

        // Captain Profile
        this.captainAvatar = 'default';
        this.userPhotoUrl = null;
        this.telegramUser = null;

        // Unlocks
        this.unlockedShips = ['basic'];
        this.currentShip = 'basic';

        // Leaderboard
        this.leaderboardData = [];

        this.initializeElements();
        this.initializeTelegram();
        this.initializeSounds();
        this.bindEvents();
        this.loadGameData();
    }

    initializeElements() {
        // Game Elements
        this.gameArea = document.getElementById('gameArea');
        this.ship = document.getElementById('ship');
        this.distanceDisplay = document.getElementById('distance');
        this.treasureDisplay = document.getElementById('treasureCount');
        this.healthFill = document.getElementById('healthFill');

        // UI Elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.captainSetup = document.getElementById('captainSetup');

        // Avatar Elements
        this.userAvatar = document.getElementById('userAvatar');
        this.shipCaptain = document.getElementById('shipCaptain');
        this.sailFlag = document.getElementById('sailFlag');

        // Modals
        this.shopModal = document.getElementById('shipShop');
        this.leaderboardModal = document.getElementById('leaderboard');
        this.gameOverModal = document.getElementById('gameOver');
    }

    initializeTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#1e3c72');

            // Get user data
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.telegramUser = tg.initDataUnsafe.user;
                this.captainName = this.telegramUser.first_name;

                // Set user avatar if available
                if (this.telegramUser.photo_url) {
                    this.setUserAvatar(this.telegramUser.photo_url);
                }
            }
        }
    }

    initializeSounds() {
        this.sounds = new OceanSoundManager();
    }

    bindEvents() {
        // Game Controls
        this.startBtn.addEventListener('click', () => this.showCaptainSetup());

        // Captain Setup
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAvatar(e.target.dataset.avatar));
        });

        document.getElementById('startGame')?.addEventListener('click', () => this.startGame());

        // Game Controls
        this.pauseBtn?.addEventListener('click', () => this.togglePause());
        this.leaderboardBtn?.addEventListener('click', () => this.showLeaderboard());

        // Touch/Mouse Controls
        this.gameArea.addEventListener('click', (e) => this.steerShip(e));
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.steerShip(e.touches[0]);
        });

        // Keyboard Controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('keyup', (e) => this.handleKeyboardRelease(e));

        // Shop and Leaderboard
        document.getElementById('shopBtn')?.addEventListener('click', () => this.showShop());
        document.getElementById('retryBtn')?.addEventListener('click', () => this.restartGame());

        // Modal Close Buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Ship Shop
        this.bindShopEvents();
    }

    selectAvatar(avatarType) {
        this.captainAvatar = avatarType;

        if (avatarType === 'photo' && this.telegramUser) {
            // Use Telegram user photo
            if (this.telegramUser.photo_url) {
                this.setUserAvatar(this.telegramUser.photo_url);
            } else {
                // Fallback to default if no photo
                this.setDefaultAvatar();
            }
        } else {
            this.setDefaultAvatar();
        }

        // Update visual selection
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.avatar === avatarType);
        });

        this.sounds.playButtonClick();
    }

    setUserAvatar(photoUrl) {
        this.userPhotoUrl = photoUrl;
        this.userAvatar.src = photoUrl;
        this.shipCaptain.src = photoUrl;

        // Add pirate hat overlay to flag
        this.sailFlag.innerHTML = `<img src="${photoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    setDefaultAvatar() {
        const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM4QjQ1MTMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWk0xMiA2QzkuNzkgNiA4IDcuNzkgOCAxMFM5Ljc5IDE0IDEyIDE0UzE2IDEyLjIxIDE2IDEwUzE0LjIxIDYgMTIgNlY2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=";

        this.userAvatar.src = defaultAvatar;
        this.shipCaptain.src = defaultAvatar;
        this.sailFlag.style.backgroundImage = `url("${defaultAvatar}")`;
        this.sailFlag.style.backgroundSize = 'cover';
        this.sailFlag.style.backgroundPosition = 'center';
    }

    showCaptainSetup() {
        this.captainSetup.style.display = 'block';
        this.sounds.playButtonClick();
    }

    startGame() {
        this.captainSetup.style.display = 'none';
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        this.leaderboardBtn.style.display = 'inline-block';

        this.isPlaying = true;
        this.distance = 0;
        this.treasures = 0;
        this.health = 100;
        this.gameSpeed = 1;

        this.updateDisplay();
        this.sounds.playStartGame();
        this.startGameLoops();
    }

    startGameLoops() {
        // Main game loop
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this.updateGame();
            }
        }, 1000 / 60); // 60 FPS

        // Distance counter
        this.distanceLoop = setInterval(() => {
            if (!this.isPaused) {
                this.distance += Math.floor(this.gameSpeed * 10);
                this.distanceDisplay.textContent = this.distance + 'm';

                // Increase difficulty over time
                if (this.distance % 100 === 0) {
                    this.gameSpeed += 0.1;
                }
            }
        }, 100);

        // Obstacle spawning
        this.obstacleLoop = setInterval(() => {
            if (!this.isPaused && Math.random() < 0.3) {
                this.spawnObstacle();
            }
        }, 2000);

        // Treasure spawning
        this.treasureLoop = setInterval(() => {
            if (!this.isPaused && Math.random() < 0.4) {
                this.spawnTreasure();
            }
        }, 3000);

        // Power-up spawning
        this.powerUpLoop = setInterval(() => {
            if (!this.isPaused && Math.random() < 0.2) {
                this.spawnPowerUp();
            }
        }, 5000);

        // Weather events
        this.weatherLoop = setInterval(() => {
            if (!this.isPaused && Math.random() < 0.3) {
                this.triggerWeatherEvent();
            }
        }, 8000);

        // Update boosts
        this.boostLoop = setInterval(() => {
            if (!this.isPaused) {
                this.updateBoosts();
            }
        }, 100);
    }

    updateGame() {
        this.updateShipPosition();
        this.checkCollisions();
        this.updateObstacles();
        this.updateTreasures();
        this.updatePowerUps();
        this.applyWeatherEffects();
    }

    steerShip(e) {
        if (!this.isPlaying || this.isPaused) return;

        const gameRect = this.gameArea.getBoundingClientRect();
        const targetX = e.clientX - gameRect.left;

        // Calculate steering force
        const direction = targetX > this.shipPosition.x ? 1 : -1;
        const distance = Math.abs(targetX - this.shipPosition.x);
        const maxSpeed = 8 * (1 + this.activeBoosts.speed * 0.5);

        // Apply acceleration
        this.shipVelocity.x += direction * Math.min(distance * 0.02, maxSpeed * 0.1);

        // Apply friction
        this.shipVelocity.x *= 0.9;

        // Limit max speed
        this.shipVelocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, this.shipVelocity.x));

        this.sounds.playShipMovement();
    }

    handleKeyboard(e) {
        if (!this.isPlaying || this.isPaused) return;

        const maxSpeed = 8 * (1 + this.activeBoosts.speed * 0.5);

        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.shipVelocity.x = -maxSpeed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.shipVelocity.x = maxSpeed;
                break;
            case ' ':
                this.togglePause();
                e.preventDefault();
                break;
        }
    }

    handleKeyboardRelease(e) {
        if (!this.isPlaying || this.isPaused) return;

        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.shipVelocity.x *= 0.5;
                break;
        }
    }

    updateShipPosition() {
        // Apply velocity
        this.shipPosition.x += this.shipVelocity.x;

        // Keep ship in bounds
        const gameRect = this.gameArea.getBoundingClientRect();
        const shipWidth = 60;
        this.shipPosition.x = Math.max(shipWidth/2, Math.min(gameRect.width - shipWidth/2, this.shipPosition.x));

        // Apply ship effects
        if (this.activeBoosts.speed > 0) {
            this.ship.classList.add('speed-effect');
        } else {
            this.ship.classList.remove('speed-effect');
        }

        if (this.activeBoosts.shield > 0) {
            this.addShieldEffect();
        }

        // Update ship visual position
        const shipBottom = gameRect.height * 0.4;
        this.ship.style.left = (this.shipPosition.x - shipWidth/2) + 'px';
        this.ship.style.bottom = shipBottom + 'px';

        // Tilt ship based on velocity
        const tilt = Math.max(-15, Math.min(15, this.shipVelocity.x * 2));
        this.ship.style.transform = `rotate(${tilt}deg)`;
    }

    spawnObstacle() {
        const types = ['iceberg', 'whirlpool', 'log', 'sea-mine'];
        const type = types[Math.floor(Math.random() * types.length)];

        const obstacle = document.createElement('div');
        obstacle.className = `obstacle ${type}`;
        obstacle.style.left = Math.random() * (this.gameArea.offsetWidth - 70) + 'px';
        obstacle.style.top = '-100px';

        this.gameArea.appendChild(obstacle);
        this.obstacles.push({
            element: obstacle,
            type: type,
            y: -100,
            speed: 2 + Math.random() * 2
        });
    }

    spawnTreasure() {
        const types = ['coin', 'chest', 'gem'];
        const type = types[Math.floor(Math.random() * types.length)];

        const treasure = document.createElement('div');
        treasure.className = `treasure ${type}`;

        const icons = {
            coin: '💰',
            chest: '📦',
            gem: '💎'
        };

        treasure.textContent = icons[type];
        treasure.style.left = Math.random() * (this.gameArea.offsetWidth - 40) + 'px';
        treasure.style.top = '-80px';

        this.gameArea.appendChild(treasure);
        this.treasureItems.push({
            element: treasure,
            type: type,
            y: -80,
            speed: 1.5 + Math.random() * 1.5,
            value: type === 'coin' ? 1 : type === 'gem' ? 3 : 5
        });
    }

    spawnPowerUp() {
        const types = ['speed', 'shield', 'slow-time'];
        const type = types[Math.floor(Math.random() * types.length)];

        const powerUp = document.createElement('div');
        powerUp.className = `powerup ${type}`;

        const icons = {
            speed: '💨',
            shield: '🛡️',
            'slow-time': '⏰'
        };

        powerUp.textContent = icons[type];
        powerUp.style.left = Math.random() * (this.gameArea.offsetWidth - 35) + 'px';
        powerUp.style.top = '-70px';

        this.gameArea.appendChild(powerUp);
        this.powerUps.push({
            element: powerUp,
            type: type,
            y: -70,
            speed: 1,
            duration: type === 'speed' ? 5000 : type === 'shield' ? 8000 : 6000
        });
    }

    updateObstacles() {
        const gameSpeed = this.activeBoosts.slowTime > 0 ? 0.3 : 1;

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += obstacle.speed * this.gameSpeed * gameSpeed;
            obstacle.element.style.top = obstacle.y + 'px';

            // Remove off-screen obstacles
            if (obstacle.y > this.gameArea.offsetHeight) {
                obstacle.element.remove();
                return false;
            }
            return true;
        });
    }

    updateTreasures() {
        const gameSpeed = this.activeBoosts.slowTime > 0 ? 0.3 : 1;

        this.treasureItems = this.treasureItems.filter(treasure => {
            treasure.y += treasure.speed * this.gameSpeed * gameSpeed;
            treasure.element.style.top = treasure.y + 'px';

            // Remove off-screen treasures
            if (treasure.y > this.gameArea.offsetHeight) {
                treasure.element.remove();
                return false;
            }
            return true;
        });
    }

    updatePowerUps() {
        const gameSpeed = this.activeBoosts.slowTime > 0 ? 0.3 : 1;

        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += powerUp.speed * this.gameSpeed * gameSpeed;
            powerUp.element.style.top = powerUp.y + 'px';

            // Remove off-screen power-ups
            if (powerUp.y > this.gameArea.offsetHeight) {
                powerUp.element.remove();
                return false;
            }
            return true;
        });
    }

    checkCollisions() {
        const shipRect = this.ship.getBoundingClientRect();

        // Check obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            const obstacleRect = obstacle.element.getBoundingClientRect();

            if (this.isColliding(shipRect, obstacleRect)) {
                if (this.activeBoosts.shield > 0) {
                    // Shield blocks damage
                    this.showFloatingText('💥 BLOCKED!', obstacleRect.left, obstacleRect.top);
                    this.sounds.playShieldActivate();
                } else {
                    this.takeDamage(20);
                    this.ship.classList.add('damaged');
                    setTimeout(() => this.ship.classList.remove('damaged'), 500);

                    // Play specific damage sounds
                    if (obstacle.type === 'iceberg') {
                        this.sounds.playIcebergHit();
                    } else if (obstacle.type === 'whirlpool') {
                        this.sounds.playWhirlpoolSound();
                    } else {
                        this.sounds.playShipCrash();
                    }
                }

                obstacle.element.remove();
                this.obstacles.splice(index, 1);
            }
        });

        // Check treasure collisions
        this.treasureItems.forEach((treasure, index) => {
            const treasureRect = treasure.element.getBoundingClientRect();

            if (this.isColliding(shipRect, treasureRect)) {
                this.collectTreasure(treasure);
                treasure.element.remove();
                this.treasureItems.splice(index, 1);
            }
        });

        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            const powerUpRect = powerUp.element.getBoundingClientRect();

            if (this.isColliding(shipRect, powerUpRect)) {
                this.collectPowerUp(powerUp);
                powerUp.element.remove();
                this.powerUps.splice(index, 1);
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
    }

    collectTreasure(treasure) {
        this.treasures += treasure.value;
        this.treasureDisplay.textContent = this.treasures;

        this.showFloatingText(`+${treasure.value} 💰`,
            treasure.element.offsetLeft, treasure.element.offsetTop);

        // Play appropriate sound
        if (treasure.type === 'coin') {
            this.sounds.playCoinCollect();
        } else if (treasure.type === 'gem') {
            this.sounds.playTreasureCollect();
        } else {
            this.sounds.playChestOpen();
        }
    }

    collectPowerUp(powerUp) {
        this.activeBoosts[powerUp.type] = powerUp.duration;

        this.showFloatingText(`${powerUp.type.toUpperCase()}!`,
            powerUp.element.offsetLeft, powerUp.element.offsetTop);

        // Play appropriate sound
        if (powerUp.type === 'speed') {
            this.sounds.playSpeedBoost();
        } else if (powerUp.type === 'shield') {
            this.sounds.playShieldActivate();
        } else {
            this.sounds.playSlowTime();
        }

        this.updateBoostDisplay();
    }

    updateBoosts() {
        Object.keys(this.activeBoosts).forEach(boostType => {
            if (this.activeBoosts[boostType] > 0) {
                this.activeBoosts[boostType] -= 100;

                if (this.activeBoosts[boostType] <= 0) {
                    this.activeBoosts[boostType] = 0;
                    this.updateBoostDisplay();
                }
            }
        });
    }

    updateBoostDisplay() {
        const boostIndicators = {
            speed: document.getElementById('speedBoost'),
            shield: document.getElementById('shieldBoost'),
            slowTime: document.getElementById('slowBoost')
        };

        Object.keys(this.activeBoosts).forEach(boostType => {
            const indicator = boostIndicators[boostType];
            if (indicator) {
                if (this.activeBoosts[boostType] > 0) {
                    indicator.style.display = 'block';
                    const timer = indicator.querySelector('.boost-timer');
                    if (timer) {
                        const duration = this.getBoostDuration(boostType);
                        timer.style.width = `${(this.activeBoosts[boostType] / duration) * 100}%`;
                    }
                } else {
                    indicator.style.display = 'none';
                }
            }
        });
    }

    getBoostDuration(boostType) {
        const durations = {
            speed: 5000,
            shield: 8000,
            slowTime: 6000
        };
        return durations[boostType] || 5000;
    }

    addShieldEffect() {
        if (!this.ship.querySelector('.shield-effect')) {
            const shield = document.createElement('div');
            shield.className = 'shield-effect';
            this.ship.appendChild(shield);
        }
    }

    triggerWeatherEvent() {
        const events = ['rain', 'storm', 'fog'];
        const event = events[Math.floor(Math.random() * events.length)];

        this.currentWeather = event;
        this.applyWeatherEffects();

        if (event === 'storm') {
            this.sounds.playStormMusic();
            this.scheduleLightning();
        }
    }

    applyWeatherEffects() {
        const overlay = document.getElementById('weatherOverlay');
        overlay.className = 'weather-overlay';

        if (this.currentWeather !== 'clear') {
            overlay.classList.add(this.currentWeather);
            overlay.style.display = 'block';

            if (this.currentWeather === 'rain') {
                this.sounds.playRain();
            } else if (this.currentWeather === 'wind') {
                this.sounds.playWindGust();
            }
        } else {
            overlay.style.display = 'none';
            this.sounds.stopStormMusic();
        }
    }

    scheduleLightning() {
        if (this.currentWeather === 'storm' && this.isPlaying) {
            setTimeout(() => {
                if (this.currentWeather === 'storm' && this.isPlaying) {
                    this.showLightning();
                    this.scheduleLightning();
                }
            }, 3000 + Math.random() * 4000);
        }
    }

    showLightning() {
        const lightning = document.getElementById('lightning');
        lightning.style.display = 'block';

        this.sounds.playLightning();

        setTimeout(() => {
            lightning.style.display = 'none';
        }, 200);

        // Thunder after delay
        setTimeout(() => {
            this.sounds.playThunder();
        }, 500 + Math.random() * 1000);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.healthFill.style.width = this.health + '%';

        if (this.health <= 0) {
            this.gameOver();
        }
    }

    showFloatingText(text, x, y) {
        const floatText = document.createElement('div');
        floatText.className = 'floating-text';
        floatText.textContent = text;
        floatText.style.left = x + 'px';
        floatText.style.top = y + 'px';
        floatText.style.cssText = `
            position: absolute;
            color: #FFD700;
            font-weight: bold;
            font-size: 18px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 150;
            animation: floatUp 2s ease-out forwards;
            pointer-events: none;
        `;

        this.gameArea.appendChild(floatText);

        setTimeout(() => {
            if (floatText.parentNode) {
                floatText.remove();
            }
        }, 2000);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        this.sounds.playButtonClick();
    }

    updateDisplay() {
        this.distanceDisplay.textContent = this.distance + 'm';
        this.treasureDisplay.textContent = this.treasures;
        this.healthFill.style.width = this.health + '%';
    }

    gameOver() {
        this.isPlaying = false;
        this.sounds.playGameOver();

        // Clear intervals
        clearInterval(this.gameLoop);
        clearInterval(this.distanceLoop);
        clearInterval(this.obstacleLoop);
        clearInterval(this.treasureLoop);
        clearInterval(this.powerUpLoop);
        clearInterval(this.weatherLoop);
        clearInterval(this.boostLoop);

        // Update game over screen
        document.getElementById('finalDistance').textContent = this.distance + 'm';
        document.getElementById('finalTreasures').textContent = this.treasures;
        document.getElementById('bestRun').textContent = this.getBestDistance() + 'm';

        // Show game over modal
        this.gameOverModal.style.display = 'block';

        // Update leaderboard
        this.updateLeaderboard(this.distance, this.treasures);

        // Save game data
        this.saveGameData();

        // Send to Telegram
        this.sendGameResult();
    }

    restartGame() {
        // Reset game state
        this.gameOverModal.style.display = 'none';

        // Clear game objects
        this.clearGameObjects();

        // Start new game
        this.startGame();
    }

    clearGameObjects() {
        this.obstacles.forEach(obstacle => obstacle.element.remove());
        this.treasureItems.forEach(treasure => treasure.element.remove());
        this.powerUps.forEach(powerUp => powerUp.element.remove());

        this.obstacles = [];
        this.treasureItems = [];
        this.powerUps = [];
    }

    bindShopEvents() {
        // Ship selection
        const ships = [
            { id: 'basic', name: 'Basic Ship', cost: 0, unlocked: true },
            { id: 'fast', name: 'Speed Ship', cost: 100, unlocked: false },
            { id: 'tough', name: 'Armored Ship', cost: 150, unlocked: false },
            { id: 'collector', name: 'Treasure Ship', cost: 200, unlocked: false }
        ];

        const shipGrid = document.getElementById('shipGrid');
        if (shipGrid) {
            shipGrid.innerHTML = '';

            ships.forEach(ship => {
                const shipItem = document.createElement('div');
                shipItem.className = `ship-item ${ship.unlocked ? '' : 'locked'} ${this.currentShip === ship.id ? 'selected' : ''}`;
                shipItem.innerHTML = `
                    <div style="font-size: 30px;">🚢</div>
                    <div>${ship.name}</div>
                    ${ship.unlocked ? '' : `<div>💰${ship.cost}</div>`}
                `;

                shipItem.addEventListener('click', () => {
                    if (ship.unlocked) {
                        this.selectShip(ship.id);
                    } else if (this.treasures >= ship.cost) {
                        this.unlockShip(ship);
                    }
                });

                shipGrid.appendChild(shipItem);
            });
        }
    }

    selectShip(shipId) {
        this.currentShip = shipId;
        this.updateShipDisplay();
        this.bindShopEvents();
    }

    unlockShip(ship) {
        if (this.treasures >= ship.cost) {
            this.treasures -= ship.cost;
            ship.unlocked = true;
            this.unlockedShips.push(ship.id);

            this.sounds.playUnlock();
            this.updateDisplay();
            this.bindShopEvents();
            this.saveGameData();
        }
    }

    updateShipDisplay() {
        // Update ship visual based on selection
        const shipHull = this.ship.querySelector('.ship-hull');
        const shipSkins = {
            basic: '#8B4513',
            fast: '#FF6B35',
            tough: '#4A5568',
            collector: '#FFD700'
        };

        if (shipHull && shipSkins[this.currentShip]) {
            shipHull.style.background = shipSkins[this.currentShip];
        }
    }

    showShop() {
        this.shopModal.style.display = 'block';
        this.bindShopEvents();
        this.sounds.playButtonClick();
    }

    showLeaderboard() {
        this.leaderboardModal.style.display = 'block';
        this.displayLeaderboard();
        this.sounds.playButtonClick();
    }

    updateLeaderboard(distance, treasures) {
        const entry = {
            name: this.captainName || 'Anonymous Captain',
            distance: distance,
            treasures: treasures,
            date: new Date().toLocaleDateString()
        };

        this.leaderboardData.push(entry);
        this.leaderboardData.sort((a, b) => b.distance - a.distance);
        this.leaderboardData = this.leaderboardData.slice(0, 10);

        this.saveLeaderboard();
    }

    displayLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList) {
            leaderboardList.innerHTML = '';

            this.leaderboardData.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.distance}m 💰${entry.treasures}</span>
                `;
                leaderboardList.appendChild(item);
            });
        }
    }

    closeModals() {
        document.getElementById('shipShop').style.display = 'none';
        document.getElementById('leaderboard').style.display = 'none';
        this.sounds.playButtonClick();
    }

    // Data Management
    saveGameData() {
        const gameData = {
            unlockedShips: this.unlockedShips,
            currentShip: this.currentShip,
            treasures: this.treasures,
            captainAvatar: this.captainAvatar
        };
        localStorage.setItem('sailOfDestinyData', JSON.stringify(gameData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('sailOfDestinyData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.unlockedShips = data.unlockedShips || ['basic'];
            this.currentShip = data.currentShip || 'basic';
            this.treasures = data.treasures || 0;
            this.captainAvatar = data.captainAvatar || 'default';

            this.updateDisplay();
            this.updateShipDisplay();
        }

        this.loadLeaderboard();
    }

    saveLeaderboard() {
        localStorage.setItem('sailOfDestinyLeaderboard', JSON.stringify(this.leaderboardData));
    }

    loadLeaderboard() {
        const savedLeaderboard = localStorage.getItem('sailOfDestinyLeaderboard');
        if (savedLeaderboard) {
            this.leaderboardData = JSON.parse(savedLeaderboard);
        }
    }

    getBestDistance() {
        const bestEntry = this.leaderboardData[0];
        return bestEntry ? bestEntry.distance : 0;
    }

    sendGameResult() {
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'game_result',
                    distance: this.distance,
                    treasures: this.treasures,
                    captain: this.captainName
                }));
            } catch (e) {
                console.log('Could not send data to Telegram');
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SailOfDestiny();
});

// Add floating text animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
    }

    .avatar-btn.selected {
        background: rgba(255, 215, 0, 0.3);
        border-color: #FFD700;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);