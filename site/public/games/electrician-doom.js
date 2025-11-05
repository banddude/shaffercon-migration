// ====================================
// ELECTRICIAN DOOM - Episode 1: Shock to the System
// A complete 8-bit Doom-style game with 9 levels
// ====================================

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const NUM_RAYS = 120;
const MAX_DEPTH = 20;
const DELTA_ANGLE = FOV / NUM_RAYS;

// Game State
let gameState = 'menu'; // menu, playing, levelComplete, gameOver, victory
let currentLevel = 1;
let gameTime = 0;
let levelStartTime = 0;
let totalKills = 0;
let totalItems = 0;
let totalSecrets = 0;

// Player State
const player = {
    x: 3.5,
    y: 3.5,
    angle: 0,
    health: 100,
    armor: 0,
    currentWeapon: 0,
    weapons: [true, false, false, false, false, false], // which weapons player has
    ammo: [999, 0, 0, 0, 0, 0], // infinite for weapon 0
    keys: { yellow: false, red: false, blue: false },
    kills: 0,
    items: 0,
    secrets: 0
};

// Weapons Data
const weapons = [
    { name: 'VOLTAGE TESTER', damage: 10, fireRate: 10, range: 10, infinite: true, color: '#FFD700' },
    { name: 'WIRE STRIPPERS', damage: 50, fireRate: 20, range: 5, ammoUse: 1, spread: 5, color: '#FF6600' },
    { name: 'POWER DRILL', damage: 8, fireRate: 3, range: 15, ammoUse: 1, color: '#00FFFF' },
    { name: 'ARC WELDER', damage: 30, fireRate: 12, range: 15, ammoUse: 1, color: '#0080FF' },
    { name: 'CIRCUIT BREAKER', damage: 80, fireRate: 25, range: 20, ammoUse: 1, explosive: true, color: '#FF0000' },
    { name: 'TESLA COIL', damage: 200, fireRate: 40, range: 20, ammoUse: 40, area: 3, color: '#FF00FF' }
];

let weaponCooldown = 0;

// Enemy Types
const enemyTypes = {
    sparkImp: {
        name: 'Spark Imp',
        health: 20,
        damage: 5,
        speed: 0.02,
        size: 0.3,
        color: '#FFFF00',
        fireRate: 60,
        range: 8,
        points: 50
    },
    wireZombie: {
        name: 'Wire Zombie',
        health: 30,
        damage: 10,
        speed: 0.015,
        size: 0.4,
        color: '#00FF00',
        fireRate: 40,
        range: 1.5,
        points: 100
    },
    circuitDemon: {
        name: 'Circuit Demon',
        health: 50,
        damage: 15,
        speed: 0.035,
        size: 0.4,
        color: '#FF0000',
        fireRate: 30,
        range: 1.5,
        points: 150
    },
    voltageSpectre: {
        name: 'Voltage Spectre',
        health: 40,
        damage: 12,
        speed: 0.03,
        size: 0.4,
        color: '#8080FF',
        fireRate: 50,
        range: 10,
        invisible: true,
        points: 200
    },
    arcTrooper: {
        name: 'Arc Trooper',
        health: 70,
        damage: 20,
        speed: 0.02,
        size: 0.5,
        color: '#FF6600',
        fireRate: 35,
        range: 12,
        points: 250
    },
    teslaBaron: {
        name: 'Tesla Baron',
        health: 150,
        damage: 30,
        speed: 0.025,
        size: 0.6,
        color: '#FF00FF',
        fireRate: 40,
        range: 10,
        points: 500
    },
    masterBreaker: {
        name: 'Master Breaker',
        health: 500,
        damage: 50,
        speed: 0.02,
        size: 0.8,
        color: '#FFD700',
        fireRate: 30,
        range: 15,
        boss: true,
        points: 1000
    }
};

// Pickup Types
const pickupTypes = {
    coffee: { health: 10, color: '#8B4513', size: 0.2, sprite: '☕' },
    energy: { health: 25, color: '#00FF00', size: 0.25, sprite: '🔋' },
    vest: { armor: 50, color: '#FF6600', size: 0.25, sprite: '🦺' },
    fullGear: { armor: 100, color: '#0080FF', size: 0.3, sprite: '🛡️' },
    yellowKey: { key: 'yellow', color: '#FFD700', size: 0.25, sprite: '🔑' },
    redKey: { key: 'red', color: '#FF0000', size: 0.25, sprite: '🔑' },
    blueKey: { key: 'blue', color: '#0080FF', size: 0.25, sprite: '🔑' },
    ammo1: { ammo: 1, amount: 10, color: '#FFD700', size: 0.2, sprite: '📦' },
    ammo2: { ammo: 2, amount: 50, color: '#00FFFF', size: 0.2, sprite: '📦' },
    ammo3: { ammo: 3, amount: 20, color: '#0080FF', size: 0.2, sprite: '📦' },
    ammo4: { ammo: 4, amount: 5, color: '#FF0000', size: 0.2, sprite: '📦' },
    ammo5: { ammo: 5, amount: 40, color: '#FF00FF', size: 0.2, sprite: '📦' },
    weapon1: { weapon: 1, color: '#FF6600', size: 0.3, sprite: '✂️' },
    weapon2: { weapon: 2, color: '#00FFFF', size: 0.3, sprite: '🔧' },
    weapon3: { weapon: 3, color: '#0080FF', size: 0.3, sprite: '⚡' },
    weapon4: { weapon: 4, color: '#FF0000', size: 0.3, sprite: '💥' },
    weapon5: { weapon: 5, color: '#FF00FF', size: 0.3, sprite: '⚡' }
};

// Level Definitions - All 9 Levels!
const levels = [
    // E1M1: Power Plant Entrance
    {
        name: 'E1M1: POWER PLANT',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,2,1,1,1,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,2,0,0,0,0,0,2,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,1,1,1,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 2.5, angle: 0 },
        enemies: [
            { type: 'sparkImp', x: 7.5, y: 5.5 },
            { type: 'sparkImp', x: 10.5, y: 8.5 },
            { type: 'wireZombie', x: 12.5, y: 10.5 }
        ],
        pickups: [
            { type: 'coffee', x: 6.5, y: 5.5 },
            { type: 'ammo1', x: 9.5, y: 5.5 },
            { type: 'weapon1', x: 12.5, y: 6.5 }
        ],
        doors: [
            { x: 7, y: 3, vertical: false, locked: false },
            { x: 4, y: 6, vertical: true, locked: false },
            { x: 10, y: 6, vertical: true, locked: false }
        ]
    },

    // E1M2: Transformer Station
    {
        name: 'E1M2: TRANSFORMER STATION',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,3,0,0,0,0,0,3,0,0,0,0,1],
            [1,1,2,1,1,0,0,1,1,0,1,1,2,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,1,1,2,1,1,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 2.5, angle: 0 },
        enemies: [
            { type: 'sparkImp', x: 7.5, y: 2.5 },
            { type: 'sparkImp', x: 7.5, y: 9.5 },
            { type: 'wireZombie', x: 2.5, y: 6.5 },
            { type: 'wireZombie', x: 13.5, y: 6.5 },
            { type: 'circuitDemon', x: 7.5, y: 6.5 }
        ],
        pickups: [
            { type: 'yellowKey', x: 7.5, y: 9.5 },
            { type: 'energy', x: 2.5, y: 10.5 },
            { type: 'vest', x: 13.5, y: 10.5 },
            { type: 'ammo1', x: 5.5, y: 5.5 },
            { type: 'ammo1', x: 10.5, y: 5.5 }
        ],
        doors: [
            { x: 2, y: 4, vertical: false, locked: false },
            { x: 12, y: 4, vertical: false, locked: false },
            { x: 4, y: 3, vertical: true, locked: true, key: 'yellow' },
            { x: 10, y: 3, vertical: true, locked: true, key: 'yellow' },
            { x: 7, y: 11, vertical: false, locked: false }
        ]
    },

    // E1M3: Circuit Breaker Hell
    {
        name: 'E1M3: CIRCUIT BREAKER HELL',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,0,1,0,1,1,1,0,1],
            [1,0,1,0,0,0,2,0,0,2,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1],
            [1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],
            [1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 1.5, angle: 0 },
        enemies: [
            { type: 'sparkImp', x: 5.5, y: 3.5 },
            { type: 'sparkImp', x: 10.5, y: 3.5 },
            { type: 'wireZombie', x: 7.5, y: 5.5 },
            { type: 'circuitDemon', x: 3.5, y: 7.5 },
            { type: 'circuitDemon', x: 12.5, y: 7.5 },
            { type: 'voltageSpectre', x: 7.5, y: 9.5 }
        ],
        pickups: [
            { type: 'redKey', x: 7.5, y: 7.5 },
            { type: 'energy', x: 3.5, y: 3.5 },
            { type: 'energy', x: 12.5, y: 3.5 },
            { type: 'weapon2', x: 7.5, y: 1.5 },
            { type: 'ammo2', x: 2.5, y: 9.5 },
            { type: 'ammo2', x: 13.5, y: 9.5 }
        ],
        doors: [
            { x: 6, y: 3, vertical: false, locked: false },
            { x: 9, y: 3, vertical: false, locked: false },
            { x: 2, y: 5, vertical: true, locked: true, key: 'red' },
            { x: 13, y: 5, vertical: true, locked: true, key: 'red' }
        ]
    },

    // E1M4: High Voltage Zone
    {
        name: 'E1M4: HIGH VOLTAGE ZONE',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,1,0,2,0,1,0,0,0,0,1,0,1],
            [1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,1,0,1],
            [1,0,1,0,0,0,3,0,1,0,1,0,0,0,0,2,0,1],
            [1,0,1,1,2,1,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 1.5, angle: 0 },
        enemies: [
            { type: 'sparkImp', x: 5.5, y: 3.5 },
            { type: 'sparkImp', x: 12.5, y: 3.5 },
            { type: 'circuitDemon', x: 8.5, y: 5.5 },
            { type: 'voltageSpectre', x: 4.5, y: 7.5 },
            { type: 'voltageSpectre', x: 13.5, y: 7.5 },
            { type: 'arcTrooper', x: 8.5, y: 7.5 }
        ],
        pickups: [
            { type: 'blueKey', x: 4.5, y: 4.5 },
            { type: 'fullGear', x: 12.5, y: 4.5 },
            { type: 'weapon3', x: 8.5, y: 1.5 },
            { type: 'ammo3', x: 2.5, y: 7.5 },
            { type: 'energy', x: 15.5, y: 7.5 }
        ],
        doors: [
            { x: 8, y: 3, vertical: false, locked: false },
            { x: 6, y: 5, vertical: true, locked: true, key: 'blue' },
            { x: 15, y: 5, vertical: true, locked: true, key: 'blue' },
            { x: 4, y: 6, vertical: false, locked: false }
        ]
    },

    // E1M5: The Substation
    {
        name: 'E1M5: THE SUBSTATION',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,3,0,1,1,1,1,0,0,2,0,0,0,0,1],
            [1,1,1,2,1,1,1,0,1,0,0,1,0,0,1,1,1,2,1,1],
            [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
            [1,1,1,2,1,1,1,0,1,1,1,1,0,0,1,1,1,2,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 2.5, angle: 0 },
        enemies: [
            { type: 'sparkImp', x: 9.5, y: 2.5 },
            { type: 'sparkImp', x: 10.5, y: 2.5 },
            { type: 'wireZombie', x: 3.5, y: 5.5 },
            { type: 'wireZombie', x: 16.5, y: 5.5 },
            { type: 'circuitDemon', x: 9.5, y: 5.5 },
            { type: 'circuitDemon', x: 10.5, y: 7.5 },
            { type: 'voltageSpectre', x: 3.5, y: 10.5 },
            { type: 'arcTrooper', x: 16.5, y: 10.5 },
            { type: 'teslaBaron', x: 10.5, y: 10.5 }
        ],
        pickups: [
            { type: 'yellowKey', x: 9.5, y: 4.5 },
            { type: 'redKey', x: 10.5, y: 4.5 },
            { type: 'blueKey', x: 10.5, y: 9.5 },
            { type: 'fullGear', x: 2.5, y: 6.5 },
            { type: 'weapon4', x: 17.5, y: 6.5 },
            { type: 'ammo4', x: 9.5, y: 6.5 }
        ],
        doors: [
            { x: 6, y: 3, vertical: true, locked: true, key: 'yellow' },
            { x: 14, y: 3, vertical: false, locked: true, key: 'red' },
            { x: 3, y: 4, vertical: false, locked: false },
            { x: 17, y: 4, vertical: false, locked: false },
            { x: 8, y: 6, vertical: true, locked: false },
            { x: 11, y: 6, vertical: true, locked: false },
            { x: 3, y: 8, vertical: false, locked: false },
            { x: 17, y: 8, vertical: false, locked: false }
        ]
    },

    // E1M6: Wire Management Nightmare
    {
        name: 'E1M6: WIRE NIGHTMARE',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1],
            [1,0,1,0,2,0,0,0,0,0,0,2,0,1,0,1],
            [1,0,1,0,1,1,1,2,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,2,1,1,1,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,1,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 1.5, angle: 0 },
        enemies: [
            { type: 'wireZombie', x: 7.5, y: 2.5 },
            { type: 'wireZombie', x: 7.5, y: 5.5 },
            { type: 'circuitDemon', x: 3.5, y: 7.5 },
            { type: 'circuitDemon', x: 11.5, y: 7.5 },
            { type: 'voltageSpectre', x: 7.5, y: 9.5 },
            { type: 'voltageSpectre', x: 7.5, y: 11.5 },
            { type: 'arcTrooper', x: 2.5, y: 9.5 },
            { type: 'arcTrooper', x: 13.5, y: 9.5 },
            { type: 'teslaBaron', x: 7.5, y: 7.5 }
        ],
        pickups: [
            { type: 'redKey', x: 7.5, y: 4.5 },
            { type: 'fullGear', x: 2.5, y: 5.5 },
            { type: 'fullGear', x: 13.5, y: 5.5 },
            { type: 'energy', x: 7.5, y: 10.5 },
            { type: 'ammo3', x: 4.5, y: 7.5 },
            { type: 'ammo4', x: 10.5, y: 7.5 }
        ],
        doors: [
            { x: 4, y: 3, vertical: true, locked: false },
            { x: 11, y: 3, vertical: true, locked: false },
            { x: 7, y: 4, vertical: false, locked: true, key: 'red' },
            { x: 7, y: 10, vertical: false, locked: false }
        ]
    },

    // E1M7: Generator Core
    {
        name: 'E1M7: GENERATOR CORE',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1],
            [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
            [1,2,2,1,0,0,0,0,0,0,0,0,0,0,1,2,2,1],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 1.5, angle: 0 },
        enemies: [
            { type: 'sparkImp', x: 6.5, y: 5.5 },
            { type: 'sparkImp', x: 11.5, y: 5.5 },
            { type: 'circuitDemon', x: 5.5, y: 6.5 },
            { type: 'circuitDemon', x: 12.5, y: 6.5 },
            { type: 'voltageSpectre', x: 8.5, y: 5.5 },
            { type: 'voltageSpectre', x: 9.5, y: 6.5 },
            { type: 'arcTrooper', x: 6.5, y: 10.5 },
            { type: 'arcTrooper', x: 11.5, y: 10.5 },
            { type: 'teslaBaron', x: 5.5, y: 10.5 },
            { type: 'teslaBaron', x: 12.5, y: 10.5 },
            { type: 'teslaBaron', x: 9.5, y: 10.5 }
        ],
        pickups: [
            { type: 'blueKey', x: 9.5, y: 5.5 },
            { type: 'weapon5', x: 8.5, y: 1.5 },
            { type: 'fullGear', x: 2.5, y: 10.5 },
            { type: 'fullGear', x: 15.5, y: 10.5 },
            { type: 'ammo5', x: 4.5, y: 5.5 },
            { type: 'ammo5', x: 13.5, y: 5.5 },
            { type: 'energy', x: 8.5, y: 10.5 }
        ],
        doors: [
            { x: 8, y: 1, vertical: false, locked: false },
            { x: 9, y: 1, vertical: false, locked: false },
            { x: 1, y: 7, vertical: false, locked: true, key: 'blue' },
            { x: 15, y: 7, vertical: false, locked: true, key: 'blue' }
        ]
    },

    // E1M8: Control Room Chaos
    {
        name: 'E1M8: CONTROL ROOM',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,3,3,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
            [1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 1.5, angle: 0 },
        enemies: [
            { type: 'circuitDemon', x: 5.5, y: 3.5 },
            { type: 'circuitDemon', x: 10.5, y: 3.5 },
            { type: 'voltageSpectre', x: 7.5, y: 5.5 },
            { type: 'voltageSpectre', x: 8.5, y: 5.5 },
            { type: 'arcTrooper', x: 5.5, y: 6.5 },
            { type: 'arcTrooper', x: 10.5, y: 6.5 },
            { type: 'arcTrooper', x: 7.5, y: 7.5 },
            { type: 'teslaBaron', x: 5.5, y: 9.5 },
            { type: 'teslaBaron', x: 10.5, y: 9.5 },
            { type: 'teslaBaron', x: 7.5, y: 9.5 },
            { type: 'teslaBaron', x: 8.5, y: 9.5 }
        ],
        pickups: [
            { type: 'redKey', x: 7.5, y: 6.5 },
            { type: 'fullGear', x: 2.5, y: 3.5 },
            { type: 'fullGear', x: 13.5, y: 3.5 },
            { type: 'fullGear', x: 2.5, y: 9.5 },
            { type: 'fullGear', x: 13.5, y: 9.5 },
            { type: 'ammo5', x: 6.5, y: 6.5 },
            { type: 'ammo5', x: 9.5, y: 6.5 },
            { type: 'energy', x: 7.5, y: 1.5 },
            { type: 'energy', x: 8.5, y: 1.5 }
        ],
        doors: [
            { x: 7, y: 1, vertical: true, locked: true, key: 'red' },
            { x: 8, y: 1, vertical: true, locked: true, key: 'red' }
        ]
    },

    // E1M9: Master Breaker (Boss Level)
    {
        name: 'E1M9: MASTER BREAKER',
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 2.5, y: 2.5, angle: 0 },
        enemies: [
            { type: 'masterBreaker', x: 10.5, y: 7.5 },
            { type: 'teslaBaron', x: 6.5, y: 5.5 },
            { type: 'teslaBaron', x: 14.5, y: 5.5 },
            { type: 'teslaBaron', x: 6.5, y: 9.5 },
            { type: 'teslaBaron', x: 14.5, y: 9.5 },
            { type: 'arcTrooper', x: 8.5, y: 5.5 },
            { type: 'arcTrooper', x: 12.5, y: 5.5 },
            { type: 'arcTrooper', x: 8.5, y: 9.5 },
            { type: 'arcTrooper', x: 12.5, y: 9.5 }
        ],
        pickups: [
            { type: 'fullGear', x: 2.5, y: 5.5 },
            { type: 'fullGear', x: 17.5, y: 5.5 },
            { type: 'fullGear', x: 2.5, y: 9.5 },
            { type: 'fullGear', x: 17.5, y: 9.5 },
            { type: 'energy', x: 2.5, y: 7.5 },
            { type: 'energy', x: 17.5, y: 7.5 },
            { type: 'ammo5', x: 10.5, y: 2.5 },
            { type: 'ammo5', x: 10.5, y: 11.5 },
            { type: 'ammo4', x: 5.5, y: 7.5 },
            { type: 'ammo4', x: 15.5, y: 7.5 }
        ],
        doors: []
    }
];

// Current level data
let currentLevelData = null;
let enemies = [];
let pickups = [];
let doors = [];
let projectiles = [];
let particles = [];

// Input State
const keys = {};
let mouseX = 0;
let mouseY = 0;
let mouseLocked = false;

// UI Elements
const startScreen = document.getElementById('start-screen');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');
const hud = document.getElementById('hud');
const mobileControls = document.getElementById('mobile-controls');
const messageDisplay = document.getElementById('message-display');

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-level-btn').addEventListener('click', nextLevel);
document.getElementById('restart-btn').addEventListener('click', restartLevel);
document.getElementById('main-menu-btn').addEventListener('click', showMainMenu);
document.getElementById('play-again-btn').addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Weapon switching
    if (e.key >= '1' && e.key <= '6') {
        const weaponIndex = parseInt(e.key) - 1;
        if (player.weapons[weaponIndex]) {
            player.currentWeapon = weaponIndex;
            updateHUD();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mouse controls
canvas.addEventListener('click', () => {
    if (gameState === 'playing' && !mouseLocked) {
        canvas.requestPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    mouseLocked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (e) => {
    if (mouseLocked && gameState === 'playing') {
        player.angle += e.movementX * 0.002;
    }
});

// Mobile controls
if ('ontouchstart' in window) {
    mobileControls.classList.remove('hidden');

    const setupButton = (id, action) => {
        const btn = document.getElementById(id);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            action(true);
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            action(false);
        });
    };

    setupButton('btn-forward', (down) => keys['w'] = down);
    setupButton('btn-backward', (down) => keys['s'] = down);
    setupButton('btn-left', (down) => keys['q'] = down);
    setupButton('btn-right', (down) => keys['e'] = down);
    setupButton('btn-strafe-left', (down) => keys['a'] = down);
    setupButton('btn-strafe-right', (down) => keys['d'] = down);
    setupButton('btn-shoot', (down) => keys[' '] = down);
    setupButton('btn-use', (down) => keys['e'] = down);
}

// ====================================
// GAME FUNCTIONS
// ====================================

function startGame() {
    currentLevel = 1;
    totalKills = 0;
    totalItems = 0;
    totalSecrets = 0;
    gameTime = 0;
    loadLevel(1);
}

function loadLevel(levelNum) {
    currentLevel = levelNum;
    currentLevelData = levels[levelNum - 1];

    // Reset player
    player.x = currentLevelData.start.x;
    player.y = currentLevelData.start.y;
    player.angle = currentLevelData.start.angle;
    player.health = 100;
    player.armor = 0;
    player.currentWeapon = 0;
    player.weapons = [true, false, false, false, false, false];
    player.ammo = [999, 0, 0, 0, 0, 0];
    player.keys = { yellow: false, red: false, blue: false };
    player.kills = 0;
    player.items = 0;
    player.secrets = 0;

    // Load enemies
    enemies = currentLevelData.enemies.map(e => ({
        ...enemyTypes[e.type],
        x: e.x,
        y: e.y,
        alive: true,
        shootTimer: 0,
        targetAngle: 0
    }));

    // Load pickups
    pickups = currentLevelData.pickups.map(p => ({
        ...pickupTypes[p.type],
        x: p.x,
        y: p.y,
        type: p.type,
        collected: false
    }));

    // Load doors
    doors = currentLevelData.doors.map(d => ({
        ...d,
        open: false,
        opening: false,
        openAmount: 0
    }));

    projectiles = [];
    particles = [];
    levelStartTime = Date.now();
    gameState = 'playing';

    // Hide all screens, show game
    startScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    hud.classList.remove('hidden');

    updateHUD();
    showMessage(currentLevelData.name);
    requestAnimationFrame(gameLoop);
}

function nextLevel() {
    if (currentLevel >= levels.length) {
        showVictory();
    } else {
        loadLevel(currentLevel + 1);
    }
}

function restartLevel() {
    loadLevel(currentLevel);
}

function showMainMenu() {
    gameState = 'menu';
    hud.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function showVictory() {
    gameState = 'victory';
    hud.classList.add('hidden');

    document.getElementById('victory-kills').textContent = totalKills;
    document.getElementById('victory-items').textContent = totalItems;
    document.getElementById('victory-secrets').textContent = totalSecrets;
    document.getElementById('victory-time').textContent = formatTime(gameTime);

    victoryScreen.classList.remove('hidden');
}

function levelComplete() {
    gameState = 'levelComplete';

    const levelTime = Math.floor((Date.now() - levelStartTime) / 1000);
    totalKills += player.kills;
    totalItems += player.items;
    totalSecrets += player.secrets;
    gameTime += levelTime;

    document.getElementById('completed-level').textContent = currentLevelData.name;
    document.getElementById('kill-count').textContent = player.kills + ' / ' + enemies.length;
    document.getElementById('item-count').textContent = player.items + ' / ' + pickups.length;
    document.getElementById('secret-count').textContent = player.secrets + ' / 0';
    document.getElementById('level-time').textContent = formatTime(levelTime);

    levelCompleteScreen.classList.remove('hidden');
}

function gameOver() {
    gameState = 'gameOver';

    document.getElementById('final-level').textContent = currentLevelData.name;
    document.getElementById('total-kills').textContent = totalKills + player.kills;

    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function showMessage(text, duration = 3000) {
    messageDisplay.textContent = text;
    messageDisplay.classList.remove('hidden');
    setTimeout(() => {
        messageDisplay.classList.add('hidden');
    }, duration);
}

function updateHUD() {
    // Health
    document.getElementById('health-value').textContent = Math.max(0, player.health);
    document.getElementById('health-fill').style.width = Math.max(0, player.health) + '%';

    // Armor
    document.getElementById('armor-value').textContent = player.armor;
    document.getElementById('armor-fill').style.width = Math.min(100, player.armor) + '%';

    // Weapon and ammo
    const weapon = weapons[player.currentWeapon];
    document.getElementById('weapon-name').textContent = weapon.name;
    document.getElementById('ammo-count').textContent = weapon.infinite ? '∞' : player.ammo[player.currentWeapon];

    // Keys
    document.getElementById('yellow-key').classList.toggle('hidden', !player.keys.yellow);
    document.getElementById('red-key').classList.toggle('hidden', !player.keys.red);
    document.getElementById('blue-key').classList.toggle('hidden', !player.keys.blue);

    // Level name
    document.getElementById('level-name').textContent = currentLevelData.name;

    // Face
    const face = player.health > 75 ? '😊' : player.health > 50 ? '😐' : player.health > 25 ? '😰' : '🤕';
    document.getElementById('face-display').textContent = face;
}

// ====================================
// RAYCASTING ENGINE
// ====================================

function castRay(angle) {
    const map = currentLevelData.map;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    let depth = 0;
    let hitWall = false;
    let hitDoor = false;
    let doorAmount = 0;
    let wallType = 1;

    while (!hitWall && depth < MAX_DEPTH) {
        depth += 0.1;
        const testX = player.x + cos * depth;
        const testY = player.y + sin * depth;

        const mapX = Math.floor(testX);
        const mapY = Math.floor(testY);

        // Check bounds
        if (mapX < 0 || mapX >= map[0].length || mapY < 0 || mapY >= map.length) {
            hitWall = true;
            depth = MAX_DEPTH;
            break;
        }

        const cell = map[mapY][mapX];

        // Check for doors
        const door = doors.find(d => d.x === mapX && d.y === mapY);
        if (door) {
            const doorPos = door.vertical ? testX - mapX : testY - mapY;
            if (doorPos > door.openAmount) {
                hitDoor = true;
                hitWall = true;
                doorAmount = door.openAmount;
                wallType = door.locked ? 3 : 2;
            }
        } else if (cell > 0 && cell !== 9) {
            hitWall = true;
            wallType = cell;
        } else if (cell === 9) {
            // Exit found
            hitWall = true;
            wallType = 9;
        }
    }

    return { depth, wallType, hitDoor, doorAmount };
}

function render() {
    // Clear screen
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw ceiling
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

    // Draw floor
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

    // Cast rays for walls
    for (let ray = 0; ray < NUM_RAYS; ray++) {
        const rayAngle = player.angle - HALF_FOV + (ray / NUM_RAYS) * FOV;
        const hit = castRay(rayAngle);

        // Fix fish-eye
        const correctedDepth = hit.depth * Math.cos(rayAngle - player.angle);

        // Calculate wall height
        const wallHeight = (SCREEN_HEIGHT / correctedDepth) * 0.5;
        const wallTop = (SCREEN_HEIGHT - wallHeight) / 2;

        // Wall color based on type
        let color;
        switch(hit.wallType) {
            case 1: color = '#444444'; break; // Normal wall
            case 2: color = '#FFD700'; break; // Door
            case 3: color = '#FF0000'; break; // Locked door
            case 9: color = '#00FF00'; break; // Exit
            default: color = '#666666';
        }

        // Darken based on distance
        const brightness = Math.max(0.2, 1 - (correctedDepth / MAX_DEPTH));
        const r = parseInt(color.substr(1, 2), 16) * brightness;
        const g = parseInt(color.substr(3, 2), 16) * brightness;
        const b = parseInt(color.substr(5, 2), 16) * brightness;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(
            (ray / NUM_RAYS) * SCREEN_WIDTH,
            wallTop,
            Math.ceil(SCREEN_WIDTH / NUM_RAYS) + 1,
            wallHeight
        );
    }

    // Draw sprites (enemies, pickups)
    drawSprites();

    // Draw particles
    drawParticles();
}

function drawSprites() {
    const sprites = [];

    // Add enemies
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - player.angle;

        sprites.push({
            distance,
            angle,
            size: enemy.size,
            color: enemy.color,
            invisible: enemy.invisible,
            isEnemy: true
        });
    });

    // Add pickups
    pickups.forEach(pickup => {
        if (pickup.collected) return;
        const dx = pickup.x - player.x;
        const dy = pickup.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - player.angle;

        sprites.push({
            distance,
            angle,
            size: pickup.size,
            color: pickup.color,
            sprite: pickup.sprite
        });
    });

    // Sort by distance (far to near)
    sprites.sort((a, b) => b.distance - a.distance);

    // Draw sprites
    sprites.forEach(sprite => {
        // Check if in FOV
        let spriteAngle = sprite.angle;
        if (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;
        if (spriteAngle < -Math.PI) spriteAngle += 2 * Math.PI;

        if (Math.abs(spriteAngle) < HALF_FOV + 0.5) {
            const spriteHeight = (SCREEN_HEIGHT / sprite.distance) * sprite.size;
            const spriteWidth = spriteHeight;
            const spriteX = (SCREEN_WIDTH / 2) + (spriteAngle / HALF_FOV) * (SCREEN_WIDTH / 2) - spriteWidth / 2;
            const spriteY = (SCREEN_HEIGHT - spriteHeight) / 2;

            // Brightness based on distance
            const brightness = Math.max(0.2, 1 - (sprite.distance / MAX_DEPTH));

            if (sprite.sprite) {
                // Draw pickup sprite
                ctx.font = `${spriteHeight}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sprite.sprite, spriteX + spriteWidth / 2, spriteY + spriteHeight / 2);
            } else {
                // Draw enemy
                const alpha = sprite.invisible ? 0.3 : 1.0;
                const r = parseInt(sprite.color.substr(1, 2), 16) * brightness;
                const g = parseInt(sprite.color.substr(3, 2), 16) * brightness;
                const b = parseInt(sprite.color.substr(5, 2), 16) * brightness;

                ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.fillRect(spriteX, spriteY, spriteWidth, spriteHeight);

                // Draw eyes for enemies
                if (sprite.isEnemy) {
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(spriteX + spriteWidth * 0.3, spriteY + spriteHeight * 0.3, spriteWidth * 0.15, spriteHeight * 0.15);
                    ctx.fillRect(spriteX + spriteWidth * 0.55, spriteY + spriteHeight * 0.3, spriteWidth * 0.15, spriteHeight * 0.15);
                }
            }
        }
    });
}

function drawParticles() {
    particles.forEach(p => {
        const dx = p.x - player.x;
        const dy = p.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - player.angle;

        let particleAngle = angle;
        if (particleAngle > Math.PI) particleAngle -= 2 * Math.PI;
        if (particleAngle < -Math.PI) particleAngle += 2 * Math.PI;

        if (Math.abs(particleAngle) < HALF_FOV + 0.5 && distance < MAX_DEPTH) {
            const size = (SCREEN_HEIGHT / distance) * 0.05;
            const x = (SCREEN_WIDTH / 2) + (particleAngle / HALF_FOV) * (SCREEN_WIDTH / 2);
            const y = (SCREEN_HEIGHT / 2) + ((p.z - 0.5) / distance) * SCREEN_HEIGHT;

            ctx.fillStyle = p.color;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
    });
}

// ====================================
// GAME LOGIC
// ====================================

function update(deltaTime) {
    if (gameState !== 'playing') return;

    // Player movement
    const moveSpeed = 0.05;
    const rotSpeed = 0.05;

    // Rotation
    if (keys['arrowleft'] || keys['q']) player.angle -= rotSpeed;
    if (keys['arrowright'] || keys['e']) player.angle += rotSpeed;

    // Movement
    let newX = player.x;
    let newY = player.y;

    if (keys['w'] || keys['arrowup']) {
        newX += Math.cos(player.angle) * moveSpeed;
        newY += Math.sin(player.angle) * moveSpeed;
    }
    if (keys['s'] || keys['arrowdown']) {
        newX -= Math.cos(player.angle) * moveSpeed;
        newY -= Math.sin(player.angle) * moveSpeed;
    }
    if (keys['a']) {
        newX += Math.cos(player.angle - Math.PI / 2) * moveSpeed;
        newY += Math.sin(player.angle - Math.PI / 2) * moveSpeed;
    }
    if (keys['d']) {
        newX += Math.cos(player.angle + Math.PI / 2) * moveSpeed;
        newY += Math.sin(player.angle + Math.PI / 2) * moveSpeed;
    }

    // Collision detection
    if (!checkWallCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }

    // Check for exit
    const exitCell = currentLevelData.map[Math.floor(player.y)][Math.floor(player.x)];
    if (exitCell === 9) {
        levelComplete();
        return;
    }

    // Use/Open doors
    if (keys['e']) {
        useDoor();
        keys['e'] = false;
    }

    // Shooting
    if (keys[' '] && weaponCooldown <= 0) {
        shoot();
        weaponCooldown = weapons[player.currentWeapon].fireRate;
    }

    if (weaponCooldown > 0) weaponCooldown--;

    // Update enemies
    updateEnemies();

    // Update projectiles
    updateProjectiles();

    // Update particles
    updateParticles();

    // Update doors
    updateDoors();

    // Check pickups
    checkPickups();

    // Check death
    if (player.health <= 0) {
        gameOver();
    }
}

function checkWallCollision(x, y) {
    const map = currentLevelData.map;
    const margin = 0.2;

    // Check four corners
    const corners = [
        [x - margin, y - margin],
        [x + margin, y - margin],
        [x - margin, y + margin],
        [x + margin, y + margin]
    ];

    for (const [cx, cy] of corners) {
        const mapX = Math.floor(cx);
        const mapY = Math.floor(cy);

        if (mapX < 0 || mapX >= map[0].length || mapY < 0 || mapY >= map.length) {
            return true;
        }

        const cell = map[mapY][mapX];
        if (cell > 0 && cell !== 9) {
            // Check doors
            const door = doors.find(d => d.x === mapX && d.y === mapY);
            if (!door || door.openAmount < 0.9) {
                return true;
            }
        }
    }

    return false;
}

function useDoor() {
    // Find door in front of player
    const checkDist = 1.5;
    const checkX = player.x + Math.cos(player.angle) * checkDist;
    const checkY = player.y + Math.sin(player.angle) * checkDist;

    const door = doors.find(d => {
        const dx = d.x + 0.5 - checkX;
        const dy = d.y + 0.5 - checkY;
        return Math.sqrt(dx * dx + dy * dy) < 1.0;
    });

    if (door && !door.open && !door.opening) {
        if (door.locked) {
            if (player.keys[door.key]) {
                door.opening = true;
                showMessage('Door opened with ' + door.key + ' key', 1000);
            } else {
                showMessage('You need the ' + door.key + ' key!', 2000);
            }
        } else {
            door.opening = true;
        }
    }
}

function updateDoors() {
    doors.forEach(door => {
        if (door.opening) {
            door.openAmount += 0.05;
            if (door.openAmount >= 1) {
                door.openAmount = 1;
                door.open = true;
                door.opening = false;
            }
        }
    });
}

function shoot() {
    const weapon = weapons[player.currentWeapon];

    // Check ammo
    if (!weapon.infinite) {
        if (player.ammo[player.currentWeapon] < weapon.ammoUse) {
            showMessage('Out of ammo!', 1000);
            return;
        }
        player.ammo[player.currentWeapon] -= weapon.ammoUse;
    }

    // Create muzzle flash particles
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + Math.cos(player.angle) * 0.5,
            y: player.y + Math.sin(player.angle) * 0.5,
            z: 0.5,
            vx: Math.cos(player.angle) * 0.1 + (Math.random() - 0.5) * 0.1,
            vy: Math.sin(player.angle) * 0.1 + (Math.random() - 0.5) * 0.1,
            vz: (Math.random() - 0.5) * 0.1,
            life: 10,
            color: weapon.color
        });
    }

    // Hitscan weapons (most weapons)
    if (!weapon.explosive) {
        const spread = weapon.spread || 1;
        for (let i = 0; i < spread; i++) {
            const spreadAngle = weapon.spread ? (Math.random() - 0.5) * 0.2 : 0;
            const hitEnemy = castRayForEnemy(player.angle + spreadAngle);
            if (hitEnemy) {
                damageEnemy(hitEnemy, weapon.damage);
            }
        }
    } else {
        // Projectile weapons (circuit breaker, tesla coil)
        projectiles.push({
            x: player.x,
            y: player.y,
            angle: player.angle,
            speed: 0.3,
            damage: weapon.damage,
            explosive: weapon.explosive,
            area: weapon.area || 0,
            color: weapon.color,
            life: 100
        });
    }

    updateHUD();
}

function castRayForEnemy(angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    let closest = null;
    let closestDist = Infinity;

    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const enemyAngle = Math.atan2(dy, dx);

        const angleDiff = Math.abs(enemyAngle - angle);
        if (angleDiff < 0.1 && distance < closestDist) {
            // Check if wall is blocking
            const hit = castRay(angle);
            if (hit.depth > distance) {
                closest = enemy;
                closestDist = distance;
            }
        }
    });

    return closest;
}

function damageEnemy(enemy, damage) {
    enemy.health -= damage;

    // Create blood/spark particles
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: enemy.x,
            y: enemy.y,
            z: 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            vz: Math.random() * 0.1,
            life: 20,
            color: enemy.color
        });
    }

    if (enemy.health <= 0) {
        enemy.alive = false;
        player.kills++;

        // Create death particles
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: enemy.x,
                y: enemy.y,
                z: 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                vz: Math.random() * 0.2,
                life: 40,
                color: enemy.color
            });
        }
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // AI behavior
        if (distance < enemy.range) {
            // In range - attack or chase
            enemy.shootTimer--;

            if (enemy.shootTimer <= 0 && distance < enemy.range) {
                // Attack player
                if (distance < 1.5) {
                    // Melee attack
                    damagePlayer(enemy.damage);
                } else {
                    // Ranged attack
                    const angle = Math.atan2(dy, dx);
                    projectiles.push({
                        x: enemy.x,
                        y: enemy.y,
                        angle: angle,
                        speed: 0.15,
                        damage: enemy.damage,
                        color: enemy.color,
                        fromEnemy: true,
                        life: 100
                    });
                }
                enemy.shootTimer = enemy.fireRate;
            }

            // Chase player if not too close
            if (distance > 2) {
                const moveX = enemy.x + (dx / distance) * enemy.speed;
                const moveY = enemy.y + (dy / distance) * enemy.speed;

                if (!checkWallCollision(moveX, moveY)) {
                    enemy.x = moveX;
                    enemy.y = moveY;
                }
            }
        }
    });
}

function damagePlayer(damage) {
    if (player.armor > 0) {
        const armorAbsorb = Math.min(damage / 2, player.armor);
        player.armor -= armorAbsorb;
        damage -= armorAbsorb;
    }

    player.health -= damage;
    updateHUD();

    // Screen flash effect
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];

        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life--;

        // Check wall collision
        const mapX = Math.floor(p.x);
        const mapY = Math.floor(p.y);
        const cell = currentLevelData.map[mapY]?.[mapX];

        if (!cell || cell > 0) {
            if (p.explosive && p.area) {
                // Explosion damage
                enemies.forEach(enemy => {
                    if (!enemy.alive) return;
                    const dx = enemy.x - p.x;
                    const dy = enemy.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < p.area) {
                        damageEnemy(enemy, p.damage * (1 - dist / p.area));
                    }
                });
            }
            projectiles.splice(i, 1);
            continue;
        }

        // Check enemy hits (for player projectiles)
        if (!p.fromEnemy) {
            for (const enemy of enemies) {
                if (!enemy.alive) continue;
                const dx = enemy.x - p.x;
                const dy = enemy.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 0.5) {
                    damageEnemy(enemy, p.damage);
                    if (!p.explosive) {
                        projectiles.splice(i, 1);
                    }
                    break;
                }
            }
        } else {
            // Enemy projectile hit player
            const dx = player.x - p.x;
            const dy = player.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.5) {
                damagePlayer(p.damage);
                projectiles.splice(i, 1);
            }
        }

        if (p.life <= 0) {
            projectiles.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vz -= 0.01; // Gravity
        p.life--;

        if (p.life <= 0 || p.z < 0) {
            particles.splice(i, 1);
        }
    }
}

function checkPickups() {
    pickups.forEach(pickup => {
        if (pickup.collected) return;

        const dx = player.x - pickup.x;
        const dy = player.y - pickup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.5) {
            pickup.collected = true;
            player.items++;

            // Apply pickup effect
            if (pickup.health) {
                player.health = Math.min(100, player.health + pickup.health);
                showMessage('+ ' + pickup.health + ' Health', 1000);
            }
            if (pickup.armor) {
                player.armor = Math.min(200, player.armor + pickup.armor);
                showMessage('+ ' + pickup.armor + ' Armor', 1000);
            }
            if (pickup.key) {
                player.keys[pickup.key] = true;
                showMessage('Picked up ' + pickup.key + ' key', 2000);
            }
            if (pickup.weapon !== undefined) {
                if (!player.weapons[pickup.weapon]) {
                    player.weapons[pickup.weapon] = true;
                    player.currentWeapon = pickup.weapon;
                    showMessage('New weapon: ' + weapons[pickup.weapon].name, 2000);
                }
                // Also give ammo
                player.ammo[pickup.weapon] += 20;
            }
            if (pickup.ammo !== undefined) {
                player.ammo[pickup.ammo] += pickup.amount;
                showMessage('+ ' + pickup.amount + ' Ammo', 1000);
            }

            updateHUD();
        }
    });
}

// ====================================
// GAME LOOP
// ====================================

let lastTime = Date.now();

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    update(deltaTime);
    render();

    if (gameState === 'playing') {
        requestAnimationFrame(gameLoop);
    }
}

// Show start screen
startScreen.classList.remove('hidden');
