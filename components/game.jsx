'use client';
import { useEffect, useRef } from 'react';
import kaplay from 'kaplay';
import { useRouter } from 'next/navigation';

export default function Game() {
    const gameRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        // Cleanup any existing game instance
        if (gameInstanceRef.current) {
            try {
                gameInstanceRef.current.destroy();
                gameInstanceRef.current = null;
            } catch (error) {
                console.warn('Error cleaning up previous game instance:', error);
            }
        }

        let k;

        const initGame = async () => {
            // Clear the container first
            if (gameRef.current) {
                gameRef.current.innerHTML = '';
            }

            // Remove any padding/margin from body and html
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';
            document.documentElement.style.overflow = 'hidden';

            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;

            try {
                k = kaplay({
                    global: false,
                    touchToMouse: true,
                    crisp: true,
                    root: gameRef.current,
                    width: containerWidth,
                    height: containerHeight,
                    background: [20, 20, 60],
                    scale: 1,
                });

                gameInstanceRef.current = k;

                // Force white color for all text by overriding default styles
                const ensureWhiteText = (textObj) => {
                    if (textObj && typeof textObj.color === 'function') {
                        textObj.color(255, 255, 255);
                    }
                };

                // Load game data from localStorage
                const loadGameData = () => {
                    const savedData = localStorage.getItem('currentGameData');
                    if (savedData) {
                        return JSON.parse(savedData);
                    }
                    return {
                        coins: 500,
                        levels: { health: 1, coins: 1, ammo: 1 },
                        highScore: 0
                    };
                };

                const gameData = loadGameData();

                // Game constants - modified by upgrades
                const BASE_MAX_HP = 100;
                const BASE_MAX_AMMO_CAPACITY = 3;
                const BASE_COIN_MULTIPLIER = 1;

                // Apply upgrades
                const MAX_HP = BASE_MAX_HP + (gameData.levels.health - 1) * 20;
                const MAX_AMMO_CAPACITY = (gameData.levels.ammo);
                const COIN_MULTIPLIER = BASE_COIN_MULTIPLIER + (gameData.levels.coins - 1) * 0.5;

                const MAX_SPEED = 400;
                const MIN_SPEED = 100;
                const ENEMY_SPEED = 80;
                const BULLET_SPEED = 300;
                const PLAYER_BULLET_SPEED = 500;
                const KILL_RANGE = 40;
                const JOYSTICK_MAX_DIST = 60;
                const TILE_SIZE = 50;

                // Game speed variables
                const INITIAL_GAME_SPEED = 0.8;
                const MAX_GAME_SPEED = 1.7;
                const GAME_SPEED_INCREASE_RATE = 0.00005;
                let gameSpeed = INITIAL_GAME_SPEED;

                // Player HP
                let playerHP = MAX_HP;

                // Pause state
                let isPaused = false;
                let pauseMenu = null;

                // Define your map
                const map = [
                    "================",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "=              =",
                    "================",
                ];

                let score = 0;
                let enemies = [];
                let joystickActive = false;
                let joystickDir = k.vec2(0, 0);
                let currentSpeed = 0;
                let joystickBasePos = k.vec2(0, 0);
                let joystickInitialized = false;
                let playerDir = k.vec2(0, 1);
                let lastShootTime = 0;
                const SHOOT_COOLDOWN = 0.15;
                let ammo = 0;
                let ammoIndicators = [];
                let totalCoinsEarned = 0;

                // Calculate map position to center it
                const mapWidth = map[0].length * TILE_SIZE;
                const mapHeight = map.length * TILE_SIZE;
                const mapOffsetX = (k.width() - mapWidth) / 2;
                const mapOffsetY = (k.height() - mapHeight) / 2;

                // Create tiled background using rectangles
                for (let x = 0; x < k.width(); x += 100) {
                    for (let y = 0; y < k.height(); y += 100) {
                        k.add([
                            k.rect(100, 100),
                            k.pos(x, y),
                            k.color(30, 30, 70),
                            k.outline(1, k.Color.fromArray([40, 40, 90]))
                        ]);
                    }
                }

                // Create map walls and boundaries
                const walls = [];
                const level = k.add([k.pos(mapOffsetX, mapOffsetY)]);

                map.forEach((row, y) => {
                    for (let x = 0; x < row.length; x++) {
                        const tile = row[x];

                        if (tile === '=') {
                            const wall = level.add([
                                k.rect(TILE_SIZE, TILE_SIZE),
                                k.pos(x * TILE_SIZE, y * TILE_SIZE),
                                k.area(),
                                k.body({ isStatic: true }),
                                k.color(100, 100, 200),
                                k.outline(2, k.Color.fromArray([150, 150, 255])),
                                'wall'
                            ]);
                            walls.push(wall);
                        }
                    }
                });

                // Create player
                const player = k.add([
                    k.circle(15),
                    k.pos(k.width() / 2, k.height() / 2),
                    k.area(),
                    k.body(),
                    k.anchor("center"),
                    k.color(50, 200, 100),
                ]);

                // Score Text - Fixed with explicit white color
                const scoreText = k.add([
                    k.text("Score: 0", {
                        size: 20,
                    }),
                    k.pos(k.width() / 2, 15),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(255, 255, 255), // Explicit white color
                    k.outline(2, k.Color.fromArray([0, 0, 0])),
                    k.z(100)
                ]);
                ensureWhiteText(scoreText);

                // HP Bar foreground
                const hpBar = k.add([
                    k.rect(k.width() * 0.95, 25),
                    k.pos(k.width() / 2, 50),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(0, 250, 50),
                    k.z(101)
                ]);

                // HP Text - Fixed with explicit white color
                const hpText = k.add([
                    k.text(`HP: ${playerHP}/${MAX_HP}`, {
                        size: 14,
                    }),
                    k.pos(k.width() / 2, 50),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(255, 255, 255), // Explicit white color
                    k.outline(1, k.Color.fromArray([0, 0, 0])),
                    k.z(102)
                ]);
                ensureWhiteText(hpText);

                // Pause Button
                const pauseButton = k.add([
                    k.rect(40, 40, { radius: 8 }),
                    k.pos(k.width() - 30, 30),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(100, 100, 200),
                    k.outline(2, k.Color.fromArray([150, 150, 255])),
                    k.area(),
                    k.z(150),
                    "pauseButton"
                ]);

                // Pause Icon - Fixed with explicit white color
                const pauseIcon = k.add([
                    k.text("II", {
                        size: 16,
                    }),
                    k.pos(k.width() - 30, 30),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(255, 255, 255), // Explicit white color
                    k.z(151),
                ]);
                ensureWhiteText(pauseIcon);

                // Create ammo indicator rectangles
                function createAmmoIndicators() {
                    // Clear existing indicators
                    ammoIndicators.forEach(indicator => indicator.destroy());
                    ammoIndicators = [];

                    const indicatorWidth = 20;
                    const indicatorHeight = 10;
                    const spacing = 5;
                    const startX = 30;
                    const startY = 110;

                    for (let i = 0; i < MAX_AMMO_CAPACITY; i++) {
                        const indicator = k.add([
                            k.rect(indicatorWidth, indicatorHeight),
                            k.pos(startX + i * (indicatorWidth + spacing), startY),
                            k.fixed(),
                            k.anchor("left"),
                            k.color(100, 100, 100),
                            k.outline(1, k.Color.fromArray([200, 200, 200])),
                            k.z(100)
                        ]);
                        ammoIndicators.push(indicator);
                    }
                }

                // Update ammo indicators
                function updateAmmoIndicators() {
                    for (let i = 0; i < MAX_AMMO_CAPACITY; i++) {
                        if (i < ammo) {
                            ammoIndicators[i].color = k.Color.fromArray([255, 50, 50]);
                        } else {
                            ammoIndicators[i].color = k.Color.fromArray([100, 100, 100]);
                        }
                    }
                }

                // Initialize ammo indicators
                createAmmoIndicators();
                updateAmmoIndicators();

                // Enhanced joystick
                const joystickBase = k.add([
                    k.circle(50),
                    k.pos(0, 0),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(255, 255, 255),
                    k.opacity(0),
                    k.outline(2, k.Color.fromArray([255, 255, 255])),
                    k.area({ radius: 50 }),
                    "joystick"
                ]);

                const joystickHandle = k.add([
                    k.circle(25),
                    k.pos(0, 0),
                    k.fixed(),
                    k.anchor("center"),
                    k.color(255, 255, 255),
                    k.opacity(0),
                    k.outline(2, k.Color.fromArray([200, 200, 255])),
                    k.area({ radius: 25 }),
                    "joystick"
                ]);

                // Smooth camera tracking
                let camTarget = player.pos;
                const CAMERA_SMOOTHNESS = 0.1;

                // Pause functions
                function showPauseMenu() {
                    if (pauseMenu) return;

                    isPaused = true;

                    // Dark overlay
                    pauseMenu = k.add([
                        k.rect(k.width(), k.height()),
                        k.pos(0, 0),
                        k.fixed(),
                        k.color(0, 0, 0),
                        k.opacity(0.7),
                        k.z(200),
                    ]);

                    // Pause title - Fixed with explicit white color
                    const pauseTitle = k.add([
                        k.text("PAUSED", {
                            size: 48,
                        }),
                        k.pos(k.width() / 2, k.height() / 2 - 100),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.outline(3, k.Color.fromArray([255, 255, 255])),
                        k.z(201),
                    ]);
                    ensureWhiteText(pauseTitle);

                    // Resume button
                    const resumeBtn = k.add([
                        k.rect(200, 50, { radius: 10 }),
                        k.pos(k.width() / 2, k.height() / 2),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(50, 200, 100),
                        k.outline(2, k.Color.fromArray([100, 255, 150])),
                        k.area(),
                        k.z(202),
                        "pauseMenuButton"
                    ]);

                    // Resume text - Fixed with explicit white color
                    const resumeText = k.add([
                        k.text("RESUME", {
                            size: 24,
                        }),
                        k.pos(k.width() / 2, k.height() / 2),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.outline(1, k.Color.fromArray([0, 0, 0])),
                        k.z(203),
                    ]);
                    ensureWhiteText(resumeText);

                    // Menu button
                    const menuBtn = k.add([
                        k.rect(200, 50, { radius: 10 }),
                        k.pos(k.width() / 2, k.height() / 2 + 70),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(200, 100, 100),
                        k.outline(2, k.Color.fromArray([255, 150, 150])),
                        k.area(),
                        k.z(202),
                        "pauseMenuButton"
                    ]);

                    // Menu text - Fixed with explicit white color
                    const menuText = k.add([
                        k.text("MAIN MENU", {
                            size: 24,
                        }),
                        k.pos(k.width() / 2, k.height() / 2 + 70),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.outline(1, k.Color.fromArray([0, 0, 0])),
                        k.z(203),
                    ]);
                    ensureWhiteText(menuText);

                    // Button hover effects
                    resumeBtn.onHover(() => {
                        resumeBtn.color = k.Color.fromArray([100, 255, 150]);
                    });

                    resumeBtn.onHoverEnd(() => {
                        resumeBtn.color = k.Color.fromArray([50, 200, 100]);
                    });

                    menuBtn.onHover(() => {
                        menuBtn.color = k.Color.fromArray([255, 150, 150]);
                    });

                    menuBtn.onHoverEnd(() => {
                        menuBtn.color = k.Color.fromArray([200, 100, 100]);
                    });

                    // Button click handlers
                    resumeBtn.onClick(() => {
                        hidePauseMenu();
                    });

                    menuBtn.onClick(() => {
                        router.push('/');
                    });
                }

                function hidePauseMenu() {
                    if (!pauseMenu) return;

                    // Remove all pause menu elements
                    k.destroyAll("pauseMenuButton");
                    const menuElements = k.get("pauseMenuElement");
                    menuElements.forEach(element => element.destroy());

                    if (pauseMenu.exists()) {
                        pauseMenu.destroy();
                    }

                    pauseMenu = null;
                    isPaused = false;
                }

                function togglePause() {
                    if (isPaused) {
                        hidePauseMenu();
                    } else {
                        showPauseMenu();
                    }
                }

                // Pause button click handler
                pauseButton.onClick(() => {
                    if (player.exists()) {
                        togglePause();
                    }
                });

                // ESC key to pause
                k.onKeyPress("escape", () => {
                    if (player.exists()) {
                        togglePause();
                    }
                });

                // Global touch handlers for bottom area
                k.onTouchStart((pos) => {
                    if (!player.exists() || isPaused) return;
                    if (!joystickActive) {
                        joystickActive = true;
                        joystickBasePos = pos;
                        joystickBase.pos = pos;
                        joystickHandle.pos = pos;
                        joystickBase.opacity = 0.3;
                        joystickHandle.opacity = 0.8;
                        joystickInitialized = true;
                    }
                });

                k.onTouchEnd((pos) => {
                    if (isPaused) return;
                    if (joystickActive) {
                        shoot();
                        joystickActive = false;
                        joystickDir = k.vec2(0, 0);
                        currentSpeed = 0;
                        joystickBase.pos = k.vec2(k.width() / 2, k.height() - 150);
                        joystickHandle.pos = k.vec2(k.width() / 2, k.height() - 150);
                        joystickBase.opacity = 0;
                        joystickHandle.opacity = 0;
                    }
                });

                k.onTouchMove((pos) => {
                    if (!joystickActive || isPaused) return;

                    const diff = pos.sub(joystickBasePos);
                    const dist = Math.min(diff.len(), JOYSTICK_MAX_DIST);
                    const dir = diff.unit();

                    joystickDir = dir;
                    const speedPercentage = dist / JOYSTICK_MAX_DIST;
                    currentSpeed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * speedPercentage;
                    joystickHandle.pos = joystickBasePos.add(dir.scale(dist));

                    const intensity = 0.5 + speedPercentage * 0.5;
                    joystickHandle.color = k.Color.fromArray([intensity * 255, intensity * 255, 255]);
                });

                function shoot(direction) {
                    if (isPaused) return;

                    const now = k.time();
                    if (now - lastShootTime < SHOOT_COOLDOWN) return;
                    if (ammo <= 0) return;

                    lastShootTime = now;
                    ammo--;
                    updateAmmoIndicators();

                    // Find nearest enemy
                    let nearestEnemy = null;
                    let nearestDist = Infinity;

                    enemies.forEach(enemy => {
                        if (enemy.exists()) {
                            const dist = player.pos.dist(enemy.pos);
                            if (dist < nearestDist) {
                                nearestDist = dist;
                                nearestEnemy = enemy;
                            }
                        }
                    });

                    if (nearestEnemy && nearestEnemy.exists()) {
                        const direction = nearestEnemy.pos.sub(player.pos).unit();
                        const bulletStartPos = player.pos.add(direction.scale(20));

                        const bullet = k.add([
                            k.circle(10),
                            k.pos(bulletStartPos),
                            k.move(direction, PLAYER_BULLET_SPEED * gameSpeed * 1.5),
                            k.area({ scale: 1.8 }),
                            k.offscreen({ destroy: true }),
                            k.anchor("center"),
                            k.color(200, 50, 50),
                            k.outline(3, k.Color.fromArray([255, 100, 100])),
                            "playerBullet",
                        ]);
                        k.loop(0.05, () => {
                            if (!bullet.exists() || isPaused) return;
                            k.add([
                                k.circle(4),
                                k.pos(bullet.pos),
                                k.color(200, 50, 50),
                                k.opacity(0.6),
                                k.lifespan(0.2),
                                k.anchor("center"),
                            ]);
                        });

                        player.move(direction.scale(-25 * gameSpeed));
                        k.shake(3);
                    }
                }

                // Function to check if a position is within map boundaries
                function isValidPosition(x, y) {
                    const localX = x - mapOffsetX;
                    const localY = y - mapOffsetY;

                    const tileX = Math.floor(localX / TILE_SIZE);
                    const tileY = Math.floor(localY / TILE_SIZE);

                    if (tileY >= 0 && tileY < map.length &&
                        tileX >= 0 && tileX < map[0].length) {
                        return map[tileY][tileX] !== '=';
                    }

                    return false;
                }

                function createEnemy(x, y) {
                    const enemy = k.add([
                        k.rect(25, 25, { radius: 6 }),
                        k.pos(x, y),
                        k.anchor("center"),
                        k.area(),
                        k.body(),
                        k.color(200, 50, 50),
                        k.outline(3, k.Color.fromArray([255, 100, 100])),
                        k.rotate(k.rand(0, 360)),
                        k.state("move", ["idle", "attack", "move"]),
                        "enemy"
                    ]);

                    enemies.push(enemy);

                    enemy.onStateEnter("idle", async () => {
                        if (isPaused) return;
                        enemy.color = k.Color.fromArray([255, 200, 50]);
                        enemy.outline.color = k.Color.fromArray([255, 220, 100]);

                        await k.wait(0.6 / gameSpeed);
                        if (enemy.exists()) enemy.enterState("attack");
                    });

                    enemy.onStateEnter("attack", async () => {
                        if (isPaused) return;
                        enemy.color = k.Color.fromArray([100, 150, 255]);
                        enemy.outline.color = k.Color.fromArray([150, 200, 255]);

                        if (player.exists() && enemy.exists()) {
                            const dir = player.pos.sub(enemy.pos).unit();
                            k.add([
                                k.rect(12, 12, { radius: 3 }),
                                k.pos(enemy.pos),
                                k.move(dir, BULLET_SPEED * gameSpeed),
                                k.area(),
                                k.offscreen({ destroy: true }),
                                k.anchor("center"),
                                k.color(100, 150, 255),
                                k.outline(2, k.Color.fromArray([150, 200, 255])),
                                "bullet",
                            ]);
                        }
                        await k.wait(0.1 / gameSpeed);
                        if (enemy.exists()) enemy.enterState("move");
                    });

                    enemy.onStateEnter("move", async () => {
                        if (isPaused) return;
                        enemy.color = k.Color.fromArray([200, 50, 50]);
                        enemy.outline.color = k.Color.fromArray([255, 100, 100]);

                        await k.wait(k.rand(2.4, 3) / gameSpeed);
                        if (enemy.exists()) enemy.enterState("idle");
                    });

                    enemy.onStateUpdate("move", () => {
                        if (!player.exists() || !enemy.exists() || isPaused) return;

                        const dir = player.pos.sub(enemy.pos).unit();
                        const newPos = enemy.pos.add(dir.scale(ENEMY_SPEED * k.dt() * gameSpeed));

                        if (isValidPosition(newPos.x, newPos.y)) {
                            enemy.move(dir.scale(ENEMY_SPEED * gameSpeed));
                        }

                        enemy.angle += 2 * gameSpeed;
                    });

                    return enemy;
                }

                // Create initial enemies in valid positions
                function createEnemiesInValidPositions(count) {
                    let created = 0;
                    let attempts = 0;

                    while (created < count && attempts < 100) {
                        const x = k.rand(mapOffsetX + TILE_SIZE, mapOffsetX + mapWidth - TILE_SIZE);
                        const y = k.rand(mapOffsetY + TILE_SIZE, mapOffsetY + mapHeight - TILE_SIZE);

                        if (isValidPosition(x, y) && player.pos.dist(k.vec2(x, y)) > 100) {
                            createEnemy(x, y);
                            created++;
                        }
                        attempts++;
                    }
                }

                createEnemiesInValidPositions(3);

                // Save game progress
                const saveGameProgress = () => {
                    const currentHighScore = parseInt(localStorage.getItem('gameHighScore') || '0');
                    if (score > currentHighScore) {
                        localStorage.setItem('gameHighScore', score.toString());
                    }

                    // Calculate coins earned: score / 20
                    const coinsEarned = Math.floor(score / 20);
                    totalCoinsEarned = coinsEarned;

                    const currentCoins = parseInt(localStorage.getItem('gameCoins') || '500');
                    const newCoins = currentCoins + coinsEarned;
                    localStorage.setItem('gameCoins', newCoins.toString());

                    return { coinsEarned, newCoins };
                };

                // Show game over menu with choice
                function showGameOverMenu() {
                    const { coinsEarned } = saveGameProgress();

                    // Dark overlay
                    k.add([
                        k.rect(k.width(), k.height()),
                        k.pos(0, 0),
                        k.fixed(),
                        k.color(0, 0, 0),
                        k.opacity(0.8),
                        k.z(200),
                    ]);

                    // Game Over title - Fixed with explicit white color
                    const gameOverTitle = k.add([
                        k.text("GAME OVER", {
                            size: 48,
                        }),
                        k.pos(k.width() / 2, k.height() / 2 - 100),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.outline(3, k.Color.fromArray([255, 255, 255])),
                        k.z(201),
                    ]);
                    ensureWhiteText(gameOverTitle);

                    // Score display - Fixed with explicit white color
                    const scoreDisplay = k.add([
                        k.text("Score: " + score, {
                            size: 36,
                        }),
                        k.pos(k.width() / 2, k.height() / 2 - 30),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.outline(2, k.Color.fromArray([0, 0, 0])),
                        k.z(202),
                    ]);
                    ensureWhiteText(scoreDisplay);

                    // Coins earned display - Fixed with explicit white color
                    const coinsDisplay = k.add([
                        k.text(`Coins Earned: +${coinsEarned}$`, {
                            size: 24,
                        }),
                        k.pos(k.width() / 2, k.height() / 2 + 20),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.z(203),
                    ]);
                    ensureWhiteText(coinsDisplay);

                    // Menu button
                    const menuBtn = k.add([
                        k.rect(200, 50, { radius: 10 }),
                        k.pos(k.width() / 2, k.height() / 2 + 80),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(50, 200, 100),
                        k.outline(2, k.Color.fromArray([100, 255, 150])),
                        k.area(),
                        k.z(204),
                        "gameOverButton"
                    ]);

                    // Menu text - Fixed with explicit white color
                    const menuBtnText = k.add([
                        k.text("MAIN MENU", {
                            size: 24,
                        }),
                        k.pos(k.width() / 2, k.height() / 2 + 80),
                        k.fixed(),
                        k.anchor("center"),
                        k.color(255, 255, 255), // Explicit white color
                        k.outline(1, k.Color.fromArray([0, 0, 0])),
                        k.z(205),
                    ]);
                    ensureWhiteText(menuBtnText);

                    // Button hover effects
                    menuBtn.onHover(() => {
                        menuBtn.color = k.Color.fromArray([100, 255, 150]);
                    });

                    menuBtn.onHoverEnd(() => {
                        menuBtn.color = k.Color.fromArray([50, 200, 100]);
                    });

                    // Button click handler
                    menuBtn.onClick(() => {
                        router.push('/');
                    });
                }

                // Smooth camera movement
                k.onUpdate(() => {
                    if (isPaused) return;

                    if (gameSpeed < MAX_GAME_SPEED) {
                        gameSpeed += GAME_SPEED_INCREASE_RATE;
                    }

                    camTarget = camTarget.lerp(player.pos, CAMERA_SMOOTHNESS);
                    k.setCamPos(camTarget);

                    if (joystickActive && joystickDir.len() > 0 && currentSpeed > 0) {
                        const newX = player.pos.x + joystickDir.x * currentSpeed * k.dt() * gameSpeed;
                        const newY = player.pos.y + joystickDir.y * currentSpeed * k.dt() * gameSpeed;

                        if (isValidPosition(newX, newY)) {
                            player.move(joystickDir.x * currentSpeed * gameSpeed, joystickDir.y * currentSpeed * gameSpeed);
                            player.angle += joystickDir.x * 3 * gameSpeed;
                            playerDir = joystickDir;
                        }
                    }

                    if (!player.exists()) return;

                    // Enemy collision and scoring
                    for (let i = enemies.length - 1; i >= 0; i--) {
                        const enemy = enemies[i];
                        if (enemy.exists() && player.pos.dist(enemy.pos) < KILL_RANGE && ammo < MAX_AMMO_CAPACITY) {
                            enemy.destroy();
                            enemies.splice(i, 1);

                            // Eat the enemy - gain ammo (with max cap)
                            if (ammo < MAX_AMMO_CAPACITY) {
                                ammo += 1;
                                updateAmmoIndicators();
                            }

                            score += 100;
                            scoreText.text = `Score: ${score}`;

                            for (let j = 0; j < 8; j++) {
                                const angle = (j / 8) * 360;
                                const dir = k.vec2(Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180));
                                k.add([
                                    k.rect(10, 15),
                                    k.pos(player.pos),
                                    k.move(dir.scale(k.rand(100, 200) * gameSpeed)),
                                    k.color(255, 200, 50),
                                    k.opacity(1),
                                    k.lifespan(0.5 / gameSpeed),
                                    k.anchor("center"),
                                ]);
                            }
                            k.shake(10);

                            for (let j = 0; j < 2; j++) {
                                k.wait(j * 500 / gameSpeed).then(() => {
                                    createEnemiesInValidPositions(2);
                                });
                            }
                        }
                    }
                });

                // Player bullet collision with enemies
                k.onCollide("playerBullet", "enemy", (bullet, enemy) => {
                    if (isPaused) return;

                    bullet.destroy();
                    enemy.destroy();

                    const idx = enemies.indexOf(enemy);
                    if (idx >= 0) enemies.splice(idx, 1);

                    score += 50;
                    scoreText.text = `Score: ${score}`;

                    // Explosion effect
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * 360;
                        const dir = k.vec2(Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180));
                        k.add([
                            k.rect(8, 12),
                            k.pos(enemy.pos),
                            k.move(dir.scale(k.rand(80, 150) * gameSpeed)),
                            k.color(255, 150, 50),
                            k.opacity(1),
                            k.lifespan(0.4 / gameSpeed),
                            k.anchor("center"),
                        ]);
                    }

                    k.shake(10);

                    // Spawn new enemies
                    k.wait(300 / gameSpeed).then(() => {
                        createEnemiesInValidPositions(2);
                    });
                });

                // Player bullet collision with walls
                k.onCollide("playerBullet", "wall", (bullet, wall) => {
                    if (isPaused) return;

                    bullet.destroy();

                    for (let i = 0; i < 5; i++) {
                        k.add([
                            k.circle(2),
                            k.pos(bullet.pos),
                            k.move(k.vec2(k.rand(-1, 1), k.rand(-1, 1)).scale(k.rand(60, 120) * gameSpeed)),
                            k.color(100, 255, 150),
                            k.opacity(1),
                            k.lifespan(0.3 / gameSpeed),
                            k.anchor("center"),
                        ]);
                    }
                });

                // Enemy bullet collision with player
                player.onCollide("bullet", (bullet) => {
                    if (isPaused) return;

                    playerHP -= 10;

                    // Update HP bar
                    const hpPercentage = Math.max(0, playerHP / MAX_HP);
                    hpBar.width = k.width() * 0.95 * hpPercentage;
                    hpText.text = `HP: ${Math.max(0, playerHP)}/${MAX_HP}`;

                    bullet.destroy();

                    if (playerHP <= 0) {
                        joystickActive = false;
                        joystickDir = k.vec2(0, 0);
                        currentSpeed = 0;

                        player.destroy();

                        for (let i = 0; i < 12; i++) {
                            const angle = (i / 12) * 360;
                            const dir = k.vec2(Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180));
                            k.add([
                                k.rect(10, 10),
                                k.pos(player.pos),
                                k.move(dir.scale(k.rand(3, 7) * gameSpeed)),
                                k.color(255, 50, 50),
                                k.opacity(1),
                                k.lifespan(0.8 / gameSpeed),
                                k.anchor("center"),
                            ]);
                        }
                        k.shake(10);

                        // Show game over menu with choice
                        showGameOverMenu();
                    }
                });

                // Enemy bullet collision with walls
                k.onCollide("bullet", "wall", (bullet, wall) => {
                    if (isPaused) return;

                    bullet.destroy();

                    for (let i = 0; i < 5; i++) {
                        k.add([
                            k.circle(3),
                            k.pos(bullet.pos),
                            k.move(k.vec2(k.rand(-1, 1), k.rand(-1, 1)).scale(k.rand(50, 100) * gameSpeed)),
                            k.color(150, 150, 255),
                            k.opacity(1),
                            k.lifespan(0.3 / gameSpeed),
                            k.anchor("center"),
                        ]);
                    }
                });

            } catch (error) {
                console.error('Failed to initialize game:', error);
            }
        };

        initGame();

        return () => {
            if (gameInstanceRef.current && typeof gameInstanceRef.current.destroy === 'function') {
                try {
                    gameInstanceRef.current.destroy();
                    gameInstanceRef.current = null;
                } catch (error) {
                    console.warn('Error destroying game instance:', error);
                }
            }

            // Reset styles when component unmounts
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.overflow = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
            document.documentElement.style.overflow = '';
        };
    }, []); // Removed router from dependencies

    return (
        <div
            ref={gameRef}
            key="game-container" // Add key to force re-render
            style={{
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                backgroundColor: '#141432',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        />
    );
}