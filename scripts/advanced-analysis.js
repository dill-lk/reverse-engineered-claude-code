#!/usr/bin/env node
/**
 * Advanced Claude Code Buddy Reverse Engineering Tool
 * 
 * This script performs deep analysis of the buddy generation system
 * to find patterns and optimal userID ranges for Legendary buddies.
 * 
 * Findings from testing:
 * - user_39645 → Epic (best found)
 * - user_13457 → Uncommon
 * - user_101556 → Common
 * 
 * Pattern observed: Higher userIDs in 40000-50000 range may yield better results
 */

const crypto = require('crypto');

// Mulberry32 PRNG
function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const SALT = 'friend-2026-401';

const RARITY_THRESHOLDS = {
    LEGENDARY: 0.01,
    EPIC: 0.04,
    RARE: 0.10,
    UNCOMMON: 0.25,
    COMMON: 1.0
};

const SPECIES = {
    LEGENDARY: ['nebulynx', 'cosmoshale'],
    EPIC: ['stormwyrm', 'voidcat', 'mushroom', 'ghost'],
    RARE: ['crystaldrake', 'deepstag', 'cat', 'dragon'],
    UNCOMMON: ['cloudferret', 'gustowl', 'snail'],
    COMMON: ['duck', 'goose', 'pebblecrab', 'dustbunny', 'mossfrog', 'blob', 'axolotl', 'capybara', 'octopus', 'owl', 'penguin', 'turtle']
};

const EYE_STYLES = ['◉', '✦', '×', '·', 'o', '@'];
const HAT_STYLES = ['crown', 'wizard', 'party', 'top', 'cap', 'bow', 'none'];

function getRarity(roll) {
    if (roll < 0.01) return 'LEGENDARY';
    if (roll < 0.04) return 'EPIC';
    if (roll < 0.10) return 'RARE';
    if (roll < 0.25) return 'UNCOMMON';
    return 'COMMON';
}

function analyzeUserId(userId) {
    const hash = crypto.createHash('sha256').update(userId + SALT).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);
    const rng = mulberry32(seed);
    
    const rarityRoll = rng();
    const shinyRoll = rng();
    const debug = Math.floor(rng() * 100);
    const patience = Math.floor(rng() * 100);
    const chaos = Math.floor(rng() * 100);
    const wisdom = Math.floor(rng() * 100);
    const snark = Math.floor(rng() * 100);
    
    const rarity = getRarity(rarityRoll);
    const isShiny = shinyRoll < 0.01;
    const speciesPool = SPECIES[rarity];
    const speciesIndex = Math.floor(rng() * speciesPool.length);
    const species = speciesPool[speciesIndex];
    const eye = EYE_STYLES[Math.floor(rng() * EYE_STYLES.length)];
    const hat = HAT_STYLES[Math.floor(rng() * HAT_STYLES.length)];
    
    return {
        userId,
        hash: hash.substring(0, 16),
        seed,
        rarityRoll,
        shinyRoll,
        rarity,
        isShiny,
        species,
        eye,
        hat,
        stats: { DEBUGGING: debug, PATIENCE: patience, CHAOS: chaos, WISDOM: wisdom, SNARK: snark }
    };
}

function findInRanges() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Claude Code Buddy - Range Analysis Tool                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const ranges = [
        [1, 10000],
        [10000, 20000],
        [20000, 30000],
        [30000, 40000],
        [40000, 50000],
        [50000, 60000],
        [60000, 70000],
        [70000, 80000],
        [80000, 90000],
        [90000, 100000],
        [100000, 150000],
        [150000, 200000]
    ];
    
    const results = {};
    
    ranges.forEach(([start, end]) => {
        let legendary = 0, epic = 0, rare = 0, uncommon = 0, common = 0;
        let legendaryShiny = [];
        
        for (let i = start; i < end; i++) {
            const buddy = analyzeUserId(`user_${i}`);
            
            if (buddy.rarity === 'LEGENDARY') {
                legendary++;
                if (buddy.isShiny) {
                    legendaryShiny.push(buddy);
                }
            } else if (buddy.rarity === 'EPIC') epic++;
            else if (buddy.rarity === 'RARE') rare++;
            else if (buddy.rarity === 'UNCOMMON') uncommon++;
            else common++;
        }
        
        const rangeKey = `${start}-${end}`;
        results[rangeKey] = { legendary, epic, rare, uncommon, common, legendaryShiny };
        
        console.log(`📊 Range ${rangeKey.padStart(15)}: Legendary: ${legendary.toString().padStart(3)} | Epic: ${epic.toString().padStart(4)} | Rare: ${rare.toString().padStart(4)} | UC: ${uncommon.toString().padStart(5)} | Common: ${common}`);
        
        if (legendaryShiny.length > 0) {
            legendaryShiny.forEach(b => {
                console.log(`   🌟 LEGENDARY SHINY: ${b.userId} → ${b.species.toUpperCase()}`);
            });
        }
    });
    
    return results;
}

function findOptimalLegendary() {
    console.log('\n🔍 Deep scan for optimal Legendary Shiny IDs...\n');
    
    const best = [];
    
    for (let i = 0; i < 500000; i++) {
        const buddy = analyzeUserId(`user_${i}`);
        
        if (buddy.rarity === 'LEGENDARY' && buddy.isShiny) {
            best.push(buddy);
            console.log(`🌟 FOUND: ${buddy.userId}`);
            console.log(`   Species: ${buddy.species}`);
            console.log(`   Rarity Roll: ${buddy.rarityRoll.toFixed(6)}`);
            console.log(`   Shiny Roll: ${buddy.shinyRoll.toFixed(6)}`);
            console.log(`   Stats: D:${buddy.stats.DEBUGGING} P:${buddy.stats.PATIENCE} C:${buddy.stats.CHAOS} W:${buddy.stats.WISDOM} S:${buddy.stats.SNARK}`);
            console.log('');
        }
        
        if ((i + 1) % 100000 === 0) {
            console.log(`   Scanned ${i.toLocaleString()} IDs...`);
        }
    }
    
    return best;
}

function analyzeDistribution() {
    console.log('\n📈 Analyzing roll distribution for pattern detection...\n');
    
    const samples = [];
    for (let i = 0; i < 10000; i++) {
        const buddy = analyzeUserId(`user_${i}`);
        samples.push(buddy);
    }
    
    const rarityRolls = samples.map(s => s.rarityRoll);
    const shinyRolls = samples.map(s => s.shinyRoll);
    
    const avgRarity = rarityRolls.reduce((a, b) => a + b, 0) / rarityRolls.length;
    const avgShiny = shinyRolls.reduce((a, b) => a + b, 0) / shinyRolls.length;
    
    console.log(`Average Rarity Roll: ${avgRarity.toFixed(4)}`);
    console.log(`Average Shiny Roll: ${avgShiny.toFixed(4)}`);
    console.log(`Expected: ~0.5 for uniform distribution`);
    
    // Check if distribution is uniform
    const buckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    rarityRolls.forEach(r => buckets[Math.floor(r * 10)]++);
    console.log('\nRarity Roll Distribution (buckets 0.0-1.0):');
    buckets.forEach((count, i) => {
        const bar = '█'.repeat(count / 50);
        console.log(`  ${(i/10).toFixed(1)}-${((i+1)/10).toFixed(1)}: ${bar} (${count})`);
    });
}

function testKnownIds() {
    console.log('\n🧪 Testing known IDs from actual Claude Code runs...\n');
    
    const knownIds = [
        { id: 'user_39645', expected: 'EPIC GHOST' },
        { id: 'user_13457', expected: 'UNCOMMON CHONK' },
        { id: '7hu6BP9cozc8PPsxQbRCBp8bMnC7NPMPogojj3TEpump', expected: 'UNCOMMON GOOSE' },
        { id: 'user_101556', expected: 'COMMON DRAGON' },
        { id: '0000000000000000000000000000000000000000000000000000000000000001', expected: 'COMMON DUCK' }
    ];
    
    knownIds.forEach(({ id, expected }) => {
        const buddy = analyzeUserId(id);
        const match = expected.toLowerCase().includes(buddy.rarity.toLowerCase()) || 
                      expected.toLowerCase().includes(buddy.species.toLowerCase());
        
        console.log(`${match ? '✅' : '❌'} ${id}`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Calculated: ${buddy.rarity} ${buddy.species.toUpperCase()}`);
        console.log(`   Rarity Roll: ${buddy.rarityRoll.toFixed(6)} | Shiny: ${buddy.shinyRoll.toFixed(6)}`);
        console.log('');
    });
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    
    switch (command) {
        case 'ranges':
            findInRanges();
            break;
        case 'legendary':
            findOptimalLegendary();
            break;
        case 'distribution':
            analyzeDistribution();
            break;
        case 'test':
            testKnownIds();
            break;
        case 'all':
        default:
            testKnownIds();
            findInRanges();
            break;
    }
}

module.exports = { analyzeUserId, findInRanges, findOptimalLegendary, analyzeDistribution };
