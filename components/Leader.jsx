"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Leaderboard() {
    const [mounted, setMounted] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const router = useRouter();

    // Mock data - replace with actual data from your backend
    const [leaderboardData, setLeaderboardData] = useState({
        prizePool: 1250,
        seasonEndsIn: "2 days 12 hours",
        players: [
            { rank: 1, name: "BATZORIG", score: 24500, address: "0x1a2b...c3d4" },
            { rank: 2, name: "GANBOLD", score: 19800, address: "0x5e6f...g7h8" },
            { rank: 3, name: "TEMUUJIN", score: 17650, address: "0x9i0j...k1l2" },
            { rank: 4, name: "NARANBATA", score: 15200, address: "0x3m4n...o5p6" },
            { rank: 5, name: "SARNai", score: 13450, address: "0x7q8r...s9t0" }
        ]
    });

    const prizeDistribution = [50, 25, 15, 5, 5];

    // Image URLs to preload
    const imagesToLoad = [
        '/menu.png',
        '/player.png',
        '/ard.png'
    ];

    useEffect(() => {
        setMounted(true);
        loadCurrentPlayerData();
        checkCachedImages();
    }, []);

    const loadCurrentPlayerData = () => {
        // Load high score from localStorage
        const highScore = parseInt(localStorage.getItem('gameHighScore') || '0');

        // Generate a random player name for the current user
        const playerNames = ["BOLD", "TUGS", "BATA", "KHAN", "NARA", "SUKH", "OD", "ZORIG", "MUNK", "TUMUR"];
        const randomName = playerNames[Math.floor(Math.random() * playerNames.length)];

        // Generate a random wallet address
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 8; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        address += '...';
        for (let i = 0; i < 4; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }

        if (highScore > 0) {
            setCurrentPlayer({
                name: `YOU`,
                score: highScore,
                address: address,
                isCurrentPlayer: true
            });
        }
    };

    const checkCachedImages = () => {
        const cached = localStorage.getItem('gameImagesCached');
        if (cached === 'true') {
            setImagesLoaded(true);
            return;
        }
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

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            router.push('/');
        }
    };

    const calculatePrize = (rank) => {
        const percentage = prizeDistribution[rank - 1];
        return (leaderboardData.prizePool * percentage) / 100;
    };

    // Combine leaderboard data with current player
    const getCombinedLeaderboard = () => {
        if (!currentPlayer) return leaderboardData.players;

        const allPlayers = [...leaderboardData.players];

        // Add current player to the leaderboard
        allPlayers.push({
            ...currentPlayer,
            rank: 0, // Temporary rank
            isCurrentPlayer: true
        });

        // Sort by score and assign ranks
        return allPlayers
            .sort((a, b) => b.score - a.score)
            .map((player, index) => ({
                ...player,
                rank: index + 1
            }));
    };

    const combinedLeaderboard = getCombinedLeaderboard();
    const currentPlayerRank = currentPlayer ? combinedLeaderboard.find(p => p.isCurrentPlayer)?.rank : null;

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
            onClick={handleBackgroundClick}
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
            <div className="relative z-10 flex flex-col h-full p-4">
                {/* Back Button */}
                <button
                    className="fixed left-4 top-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg z-50 active:scale-95 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/');
                    }}
                >
                    ←
                </button>

                {/* Header */}
                <div className="text-center mb-6 mt-16">
                    <h1 className="text-white text-3xl font-bold mb-2">ОНООНЫ ЖАГСААЛТ</h1>
                    <div className="text-yellow-300 text-sm">Улирал дуусах: {leaderboardData.seasonEndsIn}</div>
                </div>

                {/* Current Player Stats */}
                {currentPlayer && (
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 mb-4 border-2 border-white">
                        <div className="text-center text-white text-sm mb-2">ТАНЫ ОНОО</div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-sm">{currentPlayerRank}</span>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">{currentPlayer.name}</div>
                                    <div className="text-gray-200 text-xs">{currentPlayer.address}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold text-sm">{currentPlayer.score.toLocaleString()} оноо</div>
                                <div className="text-yellow-300 text-xs">
                                    {currentPlayerRank <= 5 ? `+${calculatePrize(currentPlayerRank).toFixed(2)} ARD` : 'No prize'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Prize Pool */}
                <div className="bg-black/50 rounded-2xl p-4 mb-6 border-2 border-yellow-400 text-center">
                    <div className="text-yellow-300 text-sm mb-2">ШАГНАЛЫН САН</div>
                    <div className="flex items-center justify-center gap-2">
                        <div className="text-white text-2xl font-bold">{leaderboardData.prizePool.toLocaleString()}</div>
                        <div className="w-6 h-6 relative">
                            <Image
                                src="/ard.png"
                                alt="Crypto"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="flex-1 overflow-y-auto">
                    {combinedLeaderboard.map((player) => (
                        <div
                            key={player.rank}
                            className={`bg-black/40 rounded-xl p-4 mb-3 border-2 ${player.isCurrentPlayer ? 'border-white bg-gradient-to-r from-purple-500/30 to-blue-500/30' :
                                player.rank === 1 ? 'border-yellow-400 bg-yellow-400/20' :
                                    player.rank === 2 ? 'border-gray-400 bg-gray-400/20' :
                                        player.rank === 3 ? 'border-orange-400 bg-orange-400/20' :
                                            'border-blue-400/50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                {/* Rank and Player Info */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${player.isCurrentPlayer ? 'bg-white text-purple-600' :
                                        player.rank === 1 ? 'bg-yellow-500' :
                                            player.rank === 2 ? 'bg-gray-500' :
                                                player.rank === 3 ? 'bg-orange-500' :
                                                    'bg-blue-500'
                                        }`}>
                                        {player.rank}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${player.isCurrentPlayer ? 'text-white' : 'text-white'}`}>
                                            {player.name}
                                        </div>
                                        <div className="text-gray-300 text-xs">{player.address}</div>
                                    </div>
                                </div>

                                {/* Score and Prize */}
                                <div className="text-right">
                                    <div className="text-white font-bold text-sm">{player.score.toLocaleString()} оноо</div>
                                    {player.rank <= 5 && !player.isCurrentPlayer && (
                                        <>
                                            <div className="text-green-400 text-xs">
                                                +{calculatePrize(player.rank).toFixed(2)} ARD
                                            </div>
                                            <div className="text-yellow-300 text-xs">
                                                ({prizeDistribution[player.rank - 1]}%)
                                            </div>
                                        </>
                                    )}
                                    {player.isCurrentPlayer && player.rank <= 5 && (
                                        <>
                                            <div className="text-green-400 text-xs">
                                                +{calculatePrize(player.rank).toFixed(2)} ARD
                                            </div>
                                            <div className="text-yellow-300 text-xs">
                                                ({prizeDistribution[player.rank - 1]}%)
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Prize Distribution Info */}
                <div className="bg-black/50 rounded-2xl p-4 mt-4 border-2 border-purple-400">
                    <div className="text-purple-300 text-sm text-center mb-2">ШАГНАЛЫН ХУВААРИЛАЛТ</div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                        {prizeDistribution.map((percentage, index) => (
                            <div key={index} className="text-white text-xs">
                                <div className="font-bold">{index + 1}р</div>
                                <div className="text-yellow-300">{percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Play to Rank Up Message */}
                {currentPlayer && currentPlayerRank > 5 && (
                    <div className="text-center text-yellow-300 text-sm mt-4 p-2 bg-black/30 rounded-lg">
                        Дээшлэхын тулд тоглоом тоглохыг үргэлжлүүлээрэй!
                    </div>
                )}
            </div>
        </div>
    );
}