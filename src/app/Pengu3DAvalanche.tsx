import React, { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    PerspectiveCamera,
    Environment,
    useTexture,
    ContactShadows,
    Trail,
    KeyboardControls,
    useKeyboardControls,
    Html,
    Float,
    Text,
    Image,
    MeshReflectorMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import { useNavigate, Link } from 'react-router-dom';
import {
    Coins,
    Trophy,
    Pause,
    Play,
    Egg,
    ArrowLeft,
    LogIn,
    Sparkles,
    AlertCircle,
    RotateCcw,
    X
} from 'lucide-react';
import SEO from './components/SEO';
import api from '../lib/api';
import { toast } from 'sonner';

// --- Configuration ---
const LANES = [-4, 0, 4];
const GAME_SPEED_START = 45;
const GAME_SPEED_MAX = 120;

enum Control {
    left = 'left',
    right = 'right',
    jump = 'jump',
}

const keyboardMap = [
    { name: Control.left, keys: ['ArrowLeft', 'a', 'A'] },
    { name: Control.right, keys: ['ArrowRight', 'd', 'D'] },
    { name: Control.jump, keys: ['ArrowUp', 'Space', 'w', 'W'] },
];

// --- 3D Components ---

function Scarf({ followRef }: { followRef: React.RefObject<THREE.Group> }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!meshRef.current || !followRef.current) return;

        // Scarf physics: wave based on speed and pengu movement
        const time = state.clock.elapsedTime;
        meshRef.current.position.set(0, 0.4, -0.2); // Position relative to pengu neck
        meshRef.current.rotation.x = Math.sin(time * 10) * 0.2 + 0.5;
        meshRef.current.rotation.y = Math.cos(time * 5) * 0.1;
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1.2, 0.1, 0.8]} />
            <meshStandardMaterial color="#D32F2F" roughness={1} />
        </mesh>
    );
}

function PenguModel({ laneRef, jumpRef, isGameOver, isPaused }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const visualRef = useRef<THREE.Group>(null);
    const leftFootRef = useRef<THREE.Group>(null);
    const rightFootRef = useRef<THREE.Group>(null);
    const scarfTailRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!groupRef.current || !visualRef.current || isPaused) return;

        const targetX = LANES[laneRef.current];
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 15);

        const targetY = jumpRef.current ? 3.8 : 0.6;
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * (jumpRef.current ? 8 : 12));

        const tilt = (groupRef.current.position.x - targetX) * 0.25;
        visualRef.current.rotation.z = THREE.MathUtils.lerp(visualRef.current.rotation.z, tilt, delta * 20);

        // Realistic "Waddle" Run Animation
        if (!jumpRef.current && !isGameOver) {
            const time = state.clock.elapsedTime * 12;

            // Body waddle (side to side tilt)
            visualRef.current.rotation.z += Math.sin(time) * 0.1;
            // Head bob
            visualRef.current.position.y = Math.abs(Math.cos(time)) * 0.15;
            // Slight forward lean
            visualRef.current.rotation.x = THREE.MathUtils.lerp(visualRef.current.rotation.x, Math.PI / 10, delta * 5);

            // Foot movement
            if (leftFootRef.current && rightFootRef.current) {
                leftFootRef.current.position.y = Math.max(0, Math.sin(time) * 0.3);
                leftFootRef.current.rotation.x = Math.sin(time) * 0.2;

                rightFootRef.current.position.y = Math.max(0, Math.sin(time + Math.PI) * 0.3);
                rightFootRef.current.rotation.x = Math.sin(time + Math.PI) * 0.2;
            }

            // Scarf physics
            if (scarfTailRef.current) {
                scarfTailRef.current.rotation.y = Math.sin(time * 0.5) * 0.3;
                scarfTailRef.current.rotation.z = Math.cos(time * 0.5) * 0.2;
            }
        } else if (isGameOver) {
            visualRef.current.rotation.x += delta * 15;
            groupRef.current.position.y += delta * 4;
        }
    });

    return (
        <group ref={groupRef}>
            <group ref={visualRef}>
                {/* Main Body - Rounder Proportions */}
                <mesh castShadow>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshStandardMaterial color="#212121" roughness={0.6} />
                </mesh>

                {/* Belly - Large and Round */}
                <mesh position={[0, -0.05, 0.45]} scale={[0.9, 0.95, 0.3]}>
                    <sphereGeometry args={[0.7, 32, 32]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>

                {/* Beanie - Brown Knit (Premium Shape) */}
                <group position={[0, 0.58, 0]}>
                    <mesh castShadow>
                        <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
                        <meshStandardMaterial color="#6D4C41" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 0.35, 0]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color="#6D4C41" />
                    </mesh>
                    {/* Beanie Text (High Visibility) */}
                    <Text
                        position={[0, 0.12, 0.55]}
                        rotation={[-0.2, 0, 0]}
                        fontSize={0.16}
                        color="#212121"
                        anchorX="center"
                        anchorY="middle"
                    >
                        PENGU
                    </Text>
                </group>

                {/* Round Glasses */}
                <group position={[0, 0.3, 0.6]}>
                    <mesh position={[0.25, 0, 0]}>
                        <torusGeometry args={[0.18, 0.02, 16, 32]} />
                        <meshStandardMaterial color="#3E2723" metalness={0.5} />
                    </mesh>
                    <mesh position={[-0.25, 0, 0]}>
                        <torusGeometry args={[0.18, 0.02, 16, 32]} />
                        <meshStandardMaterial color="#3E2723" metalness={0.5} />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[0.2, 0.02, 0.02]} />
                        <meshStandardMaterial color="#3E2723" />
                    </mesh>
                </group>

                {/* Scarf - Brown */}
                <group position={[0, 0.1, 0.35]}>
                    <mesh>
                        <torusGeometry args={[0.6, 0.12, 16, 32]} />
                        <meshStandardMaterial color="#795548" />
                    </mesh>
                    <group ref={scarfTailRef} position={[0.4, -0.2, 0.3]}>
                        <mesh rotation={[0, 0, 0.5]}>
                            <boxGeometry args={[0.15, 0.7, 0.05]} />
                            <meshStandardMaterial color="#795548" />
                        </mesh>
                    </group>
                </group>

                {/* Flippers (Feet) */}
                <group ref={leftFootRef} position={[0.35, -0.65, 0.1]}>
                    <mesh rotation={[0.1, 0, 0]}>
                        <boxGeometry args={[0.45, 0.15, 0.6]} />
                        <meshStandardMaterial color="#FF9800" />
                    </mesh>
                </group>
                <group ref={rightFootRef} position={[-0.35, -0.65, 0.1]}>
                    <mesh rotation={[0.1, 0, 0]}>
                        <boxGeometry args={[0.45, 0.15, 0.6]} />
                        <meshStandardMaterial color="#FF9800" />
                    </mesh>
                </group>

                {/* Eyes */}
                <mesh position={[0.22, 0.35, 0.72]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[-0.22, 0.35, 0.72]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color="black" />
                </mesh>

                {/* Beak */}
                <mesh position={[0, 0.2, 0.8]} rotation={[0.1, 0, 0]} scale={[1, 0.6, 1]}>
                    <coneGeometry args={[0.15, 0.3, 4]} />
                    <meshStandardMaterial color="#FF9800" />
                </mesh>
            </group>

            {/* Run Trail */}
            {!isGameOver && (
                <Trail width={1.8} length={8} color="#FFFFFF" attenuation={(t) => t * t}>
                    <mesh position={[0, -0.7, -0.2]} />
                </Trail>
            )}
        </group>
    );
}

function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-4 min-w-[300px]">
                <div className="size-20 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#0A0E27] font-black uppercase tracking-widest bg-white/80 px-4 py-2 rounded-xl">Waking up Pengu...</p>
            </div>
        </Html>
    );
}

function World({ gameState, isPaused, setIsPaused, onGameOver, onCoin, mobileControls }: any) {
    const laneRef = useRef(1);
    const jumpRef = useRef(false);
    const speedRef = useRef(GAME_SPEED_START);
    const itemsRef = useRef<any[]>([]);
    const lastSpawnRef = useRef(0);
    const [activeItems, setActiveItems] = useState<any[]>([]);

    const [, getKeys] = useKeyboardControls();
    const { camera } = useThree();

    const pathTexture = useTexture('/assets/textures/snow_path.png');
    pathTexture.wrapS = pathTexture.wrapT = THREE.RepeatWrapping;
    pathTexture.repeat.set(1, 40);

    // Explicitly load textures before rendering
    useTexture([
        '/assets/textures/castle_bg.png',
        '/assets/textures/gold_albedo.png',
        '/assets/textures/rock_albedo.png'
    ]);

    useFrame((state, delta) => {
        const isPlaying = gameState === 'PLAYING';
        const isGameOver = gameState === 'GAMEOVER';

        const { jump } = getKeys();

        // Camera follow (Always active for smooth transitions)
        let camX = 0, camY = 5, camZ = 12, lookAhead = -30;
        if (isPlaying) {
            // Apply mobile control overrides
            if (mobileControls.current.left) {
                laneRef.current = Math.max(0, laneRef.current - 1);
                mobileControls.current.left = false;
            }
            if (mobileControls.current.right) {
                laneRef.current = Math.min(2, laneRef.current - 1 + 2); // 1 + 2 = +1
                mobileControls.current.right = false;
            }
            if (mobileControls.current.jump && !jumpRef.current) {
                jumpRef.current = true;
                setTimeout(() => jumpRef.current = false, 750);
                mobileControls.current.jump = false;
            }

            camX = LANES[laneRef.current] * 0.4;
            camY = 4.5 + (jumpRef.current ? 1.5 : 0);
            lookAhead = -25;
        }
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, delta * 4);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, delta * 3);
        camera.position.z = 12;
        camera.lookAt(camera.position.x, 1, lookAhead);

        if (!isPlaying || isGameOver || isPaused) return;

        if (pathTexture) pathTexture.offset.y -= (speedRef.current * 0.01) * delta;

        speedRef.current = Math.min(GAME_SPEED_MAX, speedRef.current + delta * 0.8);
        const moveDist = speedRef.current * delta;

        if (jump && !jumpRef.current) {
            jumpRef.current = true;
            setTimeout(() => jumpRef.current = false, 750);
        }

        // Spawning logic
        if (state.clock.elapsedTime - lastSpawnRef.current > 0.8) {
            const lane = Math.floor(Math.random() * 3);
            const type = Math.random() > 0.35 ? 'coin' : 'rock';
            itemsRef.current.push({ id: Math.random(), lane, type, z: -160, hit: false, isGold: Math.random() > 0.8 });
            lastSpawnRef.current = state.clock.elapsedTime;
            setActiveItems([...itemsRef.current]);
        }

        // Collision
        itemsRef.current.forEach(item => {
            if (item.hit) return;
            item.z += moveDist;
            if (Math.abs(item.z) < 2.0 && item.lane === laneRef.current) {
                if (item.type === 'rock') {
                    if (!jumpRef.current) onGameOver();
                } else {
                    item.hit = true;
                    onCoin(item.isGold);
                    setActiveItems([...itemsRef.current]);
                }
            }
        });

        if (itemsRef.current.some(i => i.z > 20)) {
            itemsRef.current = itemsRef.current.filter(i => i.z <= 20);
            setActiveItems([...itemsRef.current]);
        }
    });

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameState !== 'PLAYING') return;
            if (e.key === 'ArrowLeft') laneRef.current = Math.max(0, laneRef.current - 1);
            if (e.key === 'ArrowRight') laneRef.current = Math.min(2, laneRef.current + 1);
            if (e.key.toLowerCase() === 'p') setIsPaused?.((p: boolean) => !p); // Added pause toggle
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState]);

    return (
        <Suspense fallback={<Loader />}>
            <PerspectiveCamera makeDefault fov={70} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[20, 40, 20]} intensity={1.5} castShadow />

            {/* Ground (Crystal Ice Road) */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[14, 2000]} />
                <meshStandardMaterial
                    map={pathTexture}
                    roughness={0.05}
                    metalness={0.8}
                    color="#B2EBF2"
                    envMapIntensity={2}
                />
            </mesh>

            {/* Side Cliffs */}
            <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[2000, 20]} />
                <meshStandardMaterial color="#90CAF9" roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[2000, 20]} />
                <meshStandardMaterial color="#90CAF9" roughness={0.2} metalness={0.1} />
            </mesh>

            {/* Castle Backdrop */}
            <Image
                url="/assets/textures/castle_bg.png"
                position={[0, 20, -150]}
                scale={[200, 100]}
                transparent
                opacity={0.8}
            />

            <PenguModel laneRef={laneRef} jumpRef={jumpRef} isGameOver={gameState === 'GAMEOVER'} isPaused={isPaused} />

            {activeItems.map(item => !item.hit && (
                <group key={item.id} position={[LANES[item.lane], item.type === 'rock' ? 1.2 : 1.5, item.z]}>
                    {item.type === 'rock' ? (
                        <mesh castShadow>
                            <dodecahedronGeometry args={[1.5, 0]} />
                            <meshStandardMaterial color="#546E7A" roughness={0.8} />
                        </mesh>
                    ) : (
                        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.6, 0.6, 0.12, 32]} />
                            <meshStandardMaterial color="#FFD700" metalness={1} emissive="#FFA000" emissiveIntensity={1} />
                        </mesh>
                    )}
                </group>
            ))}

            <Environment preset="apartment" />
            <ContactShadows opacity={0.4} scale={30} blur={2.5} far={8} color="#000000" />

            <EffectComposer multisampling={0} enableNormalPass={false}>
                <Bloom luminanceThreshold={1} intensity={0.8} mipmapBlur />
            </EffectComposer>
        </Suspense>
    );
}

// --- Main Page Wrapper ---

export default function Pengu3DAvalanche() {
    const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [eggs, setEggs] = useState(0);

    const { currentUser } = useStore();
    const navigate = useNavigate();

    // Mobile control triggers
    const mobileControls = useRef({ left: false, right: false, jump: false });

    const handleStart = () => {
        setGameState('PLAYING');
        setIsPaused(false);
        setScore(0);
        setCoins(0);
        setStartTime(Date.now());
    };

    const submitGameData = async () => {
        if (!currentUser) return; // Don't submit for guests

        try {
            const duration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
            await api.post('/games/submit-score', {
                gameId: 'pengu-3d',
                score,
                coinsCollected: coins,
                sessionDurationSeconds: duration
            });
            // Score submitted successfully
        } catch (error) {
            console.error("Failed to submit score", error);
        }
    };

    useEffect(() => {
        if (gameState === 'GAMEOVER') {
            submitGameData();
        }
    }, [gameState]);

    useEffect(() => {
        let intv: any;
        if (gameState === 'PLAYING' && !isPaused) {
            intv = setInterval(() => setScore(s => s + 1), 50);
        }
        return () => clearInterval(intv);
    }, [gameState, isPaused]);

    return (
        <KeyboardControls map={keyboardMap}>
            <div className="w-full h-screen bg-[#81D4FA] overflow-hidden relative font-['Outfit'] select-none">
                <SEO title="Pengu's 3D Avalanche" description="AAA Penguin Runner" url="https://pengu.work.gd/arcade/pengu-3d" />

                {/* UI Overlay (Premium HUD) */}
                <div className="absolute inset-x-0 top-0 p-4 md:p-10 z-[100] flex justify-between items-start pointer-events-none">
                    {/* Top Left Stats - Condensed for Mobile */}
                    <div className="flex flex-col gap-2 md:gap-3 pointer-events-auto scale-90 md:scale-100 origin-top-left">
                        <div className="flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-[#3E2723]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                            <div className="size-7 md:size-9 rounded-full bg-[#5D4037] flex items-center justify-center shadow-lg border border-white/20">
                                <Coins className="size-4 md:size-5 text-[#FFD54F]" fill="currentColor" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] md:text-[10px] uppercase font-black text-white/40 leading-none mb-1">Coins</span>
                                <span className="text-lg md:text-2xl font-black text-white leading-none tracking-tight">{(currentUser?.wallet?.coins || 0) + coins}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-[#0A0E27]/40 backdrop-blur-xl border border-white/10 shadow-2xl">
                            <div className="size-7 md:size-9 rounded-full bg-pink-100 flex items-center justify-center shadow-lg border border-white/20">
                                <Egg className="size-4 md:size-5 text-[#AD1457]" fill="currentColor" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] md:text-[10px] uppercase font-black text-white/40 leading-none mb-1">Eggs</span>
                                <span className="text-lg md:text-2xl font-black text-white leading-none tracking-tight">{eggs}</span>
                            </div>
                        </div>

                        {!currentUser && (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500 text-[#3E2723] shadow-lg animate-bounce">
                                <AlertCircle className="size-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">GUEST MODE (NO SAVING)</span>
                            </div>
                        )}
                    </div>

                    {/* Top Center Score - Responsive & Premium */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-4 md:top-8 pointer-events-auto scale-75 md:scale-100 origin-top">
                        <div className="px-8 md:px-14 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] bg-[#2D1B18] border-[4px] md:border-[6px] border-[#4E342E] shadow-[0_8px_20px_rgba(0,0,0,0.4),0_4px_0_#1B0D0B] flex flex-col items-center min-w-[140px] md:min-w-[200px]">
                            <span className="text-[8px] md:text-[10px] font-black text-[#8D6E63] uppercase tracking-[0.2em] mb-1">CURRENT SCORE</span>
                            <div className="flex items-center gap-3 md:gap-4">
                                <Trophy className="size-5 md:size-7 text-[#FFD54F]" fill="currentColor" />
                                <span className="text-3xl md:text-5xl font-black text-white tracking-widest font-['Outfit']">{score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Right Pause */}
                    <div className="flex gap-4 pointer-events-auto scale-90 md:scale-100 origin-top-right">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="size-12 md:size-16 rounded-2xl bg-[#3E2723] border-4 border-[#4E342E] shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all group"
                        >
                            {isPaused ? <Play className="size-6 md:size-8 fill-current" /> : <Pause className="size-6 md:size-8 fill-current" />}
                        </button>
                    </div>
                </div>

                {/* 3D Scene */}
                <Canvas shadows dpr={[1, 2]}>
                    <World
                        gameState={gameState}
                        isPaused={isPaused}
                        setIsPaused={setIsPaused}
                        onGameOver={() => setGameState('GAMEOVER')}
                        onCoin={(gold: boolean) => {
                            setCoins(c => c + (gold ? 10 : 1));
                            if (Math.random() > 0.95) setEggs(e => e + 1);
                        }}
                        mobileControls={mobileControls}
                    />
                </Canvas>

                {/* Mobile Virtual D-PAD (Only visible when Playing) */}
                <AnimatePresence>
                    {gameState === 'PLAYING' && !isPaused && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-8 inset-x-0 z-[90] flex justify-between items-center px-4 md:hidden pointer-events-none"
                        >
                            <div className="flex gap-2 pointer-events-auto">
                                <button
                                    onPointerDown={(e) => { e.preventDefault(); mobileControls.current.left = true; }}
                                    className="size-20 rounded-2xl bg-white/20 backdrop-blur-md border-[3px] border-white/40 shadow-xl flex items-center justify-center text-white active:bg-white/40 active:scale-95 transition-all"
                                >
                                    <ArrowLeft className="size-10" />
                                </button>
                                <button
                                    onPointerDown={(e) => { e.preventDefault(); mobileControls.current.right = true; }}
                                    className="size-20 rounded-2xl bg-white/20 backdrop-blur-md border-[3px] border-white/40 shadow-xl flex items-center justify-center text-white active:bg-white/40 active:scale-95 transition-all"
                                >
                                    <ArrowLeft className="size-10 rotate-180" />
                                </button>
                            </div>

                            <div className="pointer-events-auto">
                                <button
                                    onPointerDown={(e) => { e.preventDefault(); mobileControls.current.jump = true; }}
                                    className="w-28 h-20 rounded-2xl bg-amber-500/80 backdrop-blur-md border-[3px] border-amber-300 shadow-xl flex items-center justify-center text-white active:bg-amber-600 active:scale-95 transition-all text-xl font-black uppercase tracking-widest italic"
                                >
                                    JUMP
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overlays */}
                <AnimatePresence>
                    {isPaused && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-[#2D1B18]/60 backdrop-blur-md text-center"
                        >
                            <div className="bg-white p-12 rounded-[3.5rem] border-[10px] border-[#3E2723] shadow-2xl max-w-sm w-full">
                                <h3 className="text-5xl font-black text-[#3E2723] uppercase italic mb-8">Game Paused</h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setIsPaused(false)}
                                        className="w-full py-6 rounded-2xl bg-[#4CAF50] text-white font-black text-2xl shadow-[0_8px_0_#2E7D32] hover:scale-105 active:translate-y-[8px] active:shadow-none transition-all"
                                    >
                                        RESUME
                                    </button>
                                    <button
                                        onClick={() => navigate('/games')}
                                        className="w-full py-6 rounded-2xl bg-[#FAFAFA] text-[#3E2723] font-black text-xl border-2 border-[#3E2723]/10 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        QUIT MISSION
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === 'MENU' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-[#0A0E27]/40 backdrop-blur-md text-center"
                        >
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-12 relative">
                                <h1 className="text-[12vw] md:text-[10rem] font-black text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] italic uppercase tracking-tighter leading-[0.85] mb-12">
                                    SNOW<br />
                                    <span className="text-[#8D6E63]">RUNNER</span>
                                </h1>
                                <button
                                    onClick={handleStart}
                                    className="group relative px-20 py-10 rounded-[3rem] bg-[#3E2723] text-white font-black text-4xl shadow-[0_15px_60px_rgba(62,39,35,0.4)] hover:scale-110 active:scale-95 transition-all border-b-[12px] border-[#1B0D0B]"
                                >
                                    START DASH
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                    {gameState === 'GAMEOVER' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[120] flex items-center justify-center bg-[#2D1B18]/90 backdrop-blur-3xl p-6">
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white p-8 md:p-14 rounded-[3.5rem] border-[8px] md:border-[12px] border-[#3E2723] shadow-2xl text-center max-w-md w-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 translate-x-4 -translate-y-4">
                                    <Trophy className="size-40 md:size-56" />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-200"
                                >
                                    <Sparkles className="size-3" /> Mission Debrief
                                </motion.div>

                                <h2 className="text-5xl md:text-7xl font-black text-[#3E2723] italic mb-8 uppercase tracking-tighter drop-shadow-sm">FINISH!</h2>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-[#F5F5F5] shadow-inner text-center">
                                        <p className="text-[#3E2723]/30 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Distance</p>
                                        <p className="text-4xl md:text-6xl font-black text-[#3E2723] font-['Outfit'] italic tracking-tighter">{score}</p>
                                    </div>
                                    <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-amber-50 shadow-inner text-center border border-amber-100">
                                        <p className="text-amber-800/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Coins Earned</p>
                                        <p className="text-4xl md:text-6xl font-black text-amber-600 font-['Outfit'] italic tracking-tighter">+{coins}</p>
                                    </div>
                                </div>

                                {!currentUser && (
                                    <div className="mb-8 p-6 rounded-3xl bg-blue-50 border border-blue-100 text-center space-y-3">
                                        <div className="flex items-center justify-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                            <AlertCircle className="size-4" /> Guest Warning
                                        </div>
                                        <p className="text-blue-900/60 text-xs font-medium leading-relaxed">
                                            You are playing as a guest. These coins won't be saved to your treasury.
                                            Sign in to start earning BDT!
                                        </p>
                                        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-700 transition-all">
                                            <LogIn className="size-3" /> Sign Up & Claim
                                        </Link>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <button
                                        onClick={handleStart}
                                        className="w-full py-6 rounded-2xl bg-[#3E2723] text-white flex items-center justify-center gap-4 font-black text-2xl shadow-[0_10px_0_#1B0D0B] hover:scale-105 active:translate-y-[10px] active:shadow-none transition-all uppercase tracking-widest italic"
                                    >
                                        <RotateCcw className="size-6" /> REPLAY
                                    </button>
                                    <button
                                        onClick={() => navigate('/games')}
                                        className="w-full py-5 rounded-2xl bg-white text-[#3E2723] font-black text-lg border-2 border-[#3E2723]/10 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-2"
                                    >
                                        <X className="size-5" /> Exit Arena
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </KeyboardControls>
    );
}
