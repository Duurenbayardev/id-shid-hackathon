"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Menu() {
    const [mounted, setMounted] = useState(false);
    const [coins, setCoins] = useState(500);
    const [levels, setLevels] = useState({ health: 1, coins: 1, ammo: 1 });
    const [highScore, setHighScore] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const upgradeCost = 100;
    const router = useRouter();

    // Image URLs to preload
    const imagesToLoad = [
        '/menu.png',
        '/player.png',
        '/ard.png'
    ];

    useEffect(() => {
        setMounted(true);
        loadGameData();
        checkCachedImages();
    }, []);

    const loadGameData = () => {
        // Load coins from localStorage
        const savedCoins = localStorage.getItem('gameCoins');
        if (savedCoins) {
            setCoins(parseInt(savedCoins));
        } else {
            // Initialize with 500 coins if not exists
            localStorage.setItem('gameCoins', '500');
            setCoins(500);
        }

        // Load levels from localStorage
        const savedLevels = localStorage.getItem('gameLevels');
        if (savedLevels) {
            setLevels(JSON.parse(savedLevels));
        } else {
            // Initialize with level 1 if not exists
            const initialLevels = { health: 1, coins: 1, ammo: 1 };
            localStorage.setItem('gameLevels', JSON.stringify(initialLevels));
            setLevels(initialLevels);
        }

        // Load high score from localStorage
        const savedHighScore = localStorage.getItem('gameHighScore');
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore));
        }
    };

    const saveGameData = (newCoins, newLevels, newHighScore = null) => {
        if (newCoins !== undefined) {
            localStorage.setItem('gameCoins', newCoins.toString());
        }
        if (newLevels) {
            localStorage.setItem('gameLevels', JSON.stringify(newLevels));
        }
        if (newHighScore !== null) {
            localStorage.setItem('gameHighScore', newHighScore.toString());
        }
    };

    const checkCachedImages = () => {
        // Check if images are already cached
        const cached = localStorage.getItem('gameImagesCached');
        if (cached === 'true') {
            setImagesLoaded(true);
            return;
        }

        // Preload images with progress tracking
        preloadImages();
    };

    const preloadImages = () => {
        let loadedCount = 0;
        const totalImages = imagesToLoad.length;

        imagesToLoad.forEach((src) => {
            const img = new window.Image();
            img.onload = () => {
                loadedCount++;
                const progress = Math.round((loadedCount / totalImages) * 100);
                setLoadingProgress(progress);

                if (loadedCount === totalImages) {
                    // All images loaded, cache the result
                    localStorage.setItem('gameImagesCached', 'true');
                    setTimeout(() => {
                        setImagesLoaded(true);
                    }, 500);
                }
            };
            img.onerror = () => {
                loadedCount++;
                const progress = Math.round((loadedCount / totalImages) * 100);
                setLoadingProgress(progress);

                if (loadedCount === totalImages) {
                    setImagesLoaded(true);
                }
            };
            img.src = src;
        });
    };

    const handleUpgrade = (type, e) => {
        e.stopPropagation();
        const currentLevel = levels[type];
        const cost = upgradeCost * currentLevel; // Increasing cost per level

        if (coins >= cost) {
            const newCoins = coins - cost;
            const newLevels = {
                ...levels,
                [type]: currentLevel + 1
            };

            setCoins(newCoins);
            setLevels(newLevels);
            saveGameData(newCoins, newLevels);
        }
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            // Pass game data to the game component
            const gameData = {
                coins,
                levels,
                highScore
            };
            localStorage.setItem('currentGameData', JSON.stringify(gameData));
            router.push('/main');
        }
    };

    const getUpgradeCost = (type) => {
        const currentLevel = levels[type];
        return upgradeCost * currentLevel;
    };

    if (!mounted) return null;

    // Loading Screen
    if (!imagesLoaded) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
                <div className="text-white text-2xl font-bold mb-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    УНШИЖ БАЙНА...
                </div>
                <div className="w-64 h-6 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                    ></div>
                </div>
                <div className="text-white text-sm mt-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    {loadingProgress}%
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden cursor-pointer"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />

            {/* Background Image */}
            <div className="fixed inset-0 -z-10">
                <Image
                    src="/menu.png"
                    alt="Menu Background"
                    fill
                    className="object-cover brightness-50"
                    priority
                />
            </div>

            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Leaderboard Button - Fixed Left */}
                <button
                    className="fixed left-4 top-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg z-50 active:scale-95 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/leader');
                    }}
                >
                    🏆
                </button>

                {/* Top - Coins Right */}
                <div className="flex justify-end gap-3 p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                        <span className="text-white text-xs font-bold" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                            {100}
                        </span>
                        <div className="w-8 h-14 relative">
                            <Image
                                src="/ard.png"
                                alt="Coin"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-white text-xs font-bold" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                            {coins}
                        </span>
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full border border-yellow-400 flex items-center justify-center text-xs font-bold">$</div>
                    </div>
                </div>

                {/* Middle - Center Content */}
                <div className="flex-1 flex flex-col items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <div className="text-white text-xs font-bold">ХАМГИЙН ӨНДӨР: {highScore}</div>
                    <h1 className="text-white text-2xl font-bold text-center"
                        onClick={handleBackgroundClick}>
                        ТОГЛООМ ЭХЛҮҮЛЭХ
                    </h1>

                    <div className="flex items-center gap-1">
                        <span className="text-white text-xs font-bold" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                            {10}
                        </span>
                        <div className="w-8 h-14 relative">
                            <Image
                                src="/ard.png"
                                alt="Coin"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom - Stats Grid */}
                <div className="grid grid-cols-3 gap-2 p-4 h-52" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="bg-blue-500/30 rounded p-2 text-center text-xs cursor-pointer active:scale-95 transition-transform hover:bg-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => handleUpgrade('health', e)}
                        disabled={coins < getUpgradeCost('health')}
                    >
                        <div className="text-lg mb-1">❤️</div>
                        <div className="text-white font-bold">АМЬ</div>
                        <div className="text-gray-300 text-xs">Lvl {levels.health}</div>
                        <div className="text-yellow-300 font-bold mt-1">{getUpgradeCost('health')}$</div>
                    </button>
                    <button
                        className="bg-blue-500/30 rounded p-2 text-center text-xs cursor-pointer active:scale-95 transition-transform hover:bg-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => handleUpgrade('coins', e)}
                        disabled={coins < getUpgradeCost('coins')}
                    >
                        <div className="text-lg mb-1">🪙</div>
                        <div className="text-white font-bold">ҮРЖ</div>
                        <div className="text-gray-300 text-xs">Lvl {levels.coins}</div>
                        <div className="text-yellow-300 font-bold mt-1">{getUpgradeCost('coins')}$</div>
                    </button>
                    <button
                        className="bg-blue-500/30 rounded p-2 text-center text-xs cursor-pointer active:scale-95 transition-transform hover:bg-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => handleUpgrade('ammo', e)}
                        disabled={coins < getUpgradeCost('ammo')}
                    >
                        <div className="text-lg mb-1">🔫</div>
                        <div className="text-white font-bold">СУМ</div>
                        <div className="text-gray-300 text-xs">Lvl {levels.ammo}</div>
                        <div className="text-yellow-300 font-bold mt-1">{getUpgradeCost('ammo')}$</div>
                    </button>
                </div>
            </div>
        </div>
    );
}