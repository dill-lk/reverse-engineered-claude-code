#!/usr/bin/env node
/**
 * Claude Code Buddy - Legendary Shiny Finder
 * 
 * This script brute-forces userIDs to find ones that will hatch
 * a Shiny Legendary buddy (Nebulynx or Cosmoshale)
 * 
 * The buddy system uses:
 * - SHA-256 hash of (userID + salt)
 * - Mulberry32 PRNG seeded from the hash
 * - Two independent rolls: Rarity and Shiny
 * 
 * Rarity thresholds:
 * - Common:    < 1.0   (60%)
 * - Uncommon:  < 0.25  (25%)
 * - Rare:      < 0.10  (10%)
 * - Epic:      < 0.04  (4%)
 * - Legendary: < 0.01  (1%)
 * 
 * Shiny: Independent 1% roll (< 0.01)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Mulberry32 PRNG - used by Claude Code
function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// The salt used in Claude Code v2.1.91
const SALT = 'friend-2026-401';

// Rarity thresholds
const RARITY_THRESHOLDS = {
    LEGENDARY: 0.01,
    EPIC: 0.04,
    RARE: 0.10,
    UNCOMMON: 0.25,
    COMMON: 1.0
};

// Species by rarity
const SPECIES = {
    LEGENDARY: ['nebulynx', 'cosmoshale'],
    EPIC: ['stormwyrm', 'voidcat', 'mushroom', 'ghost'],
    RARE: ['crystaldrake', 'deepstag', 'cat', 'dragon'],
    UNCOMMON: ['cloudferret', 'gustowl', 'snail'],
    COMMON: ['duck', 'goose', 'pebblecrab', 'dustbunny', 'mossfrog', 'blob']
};

/**
 * Calculate buddy stats from RNG
 */
function calculateStats(rng) {
    return {
        DEBUGGING: Math.floor(rng() * 100),
        PATIENCE: Math.floor(rng() * 100),
        CHAOS: Math.floor(rng() * 100),
        WISDOM: Math.floor(rng() * 100),
        SNARK: Math.floor(rng() * 100)
    };
}

/**
 * Get rarity from roll value
 */
function getRarity(roll) {
    if (roll < 0.01) return 'LEGENDARY';
    if (roll < 0.04) return 'EPIC';
    if (roll < 0.10) return 'RARE';
    if (roll < 0.25) return 'UNCOMMON';
    return 'COMMON';
}

/**
 * Test a single userID and return buddy info
 */
function testUserId(userId, salt = SALT) {
    const hash = crypto.createHash('sha256').update(userId + salt).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);
    const rng = mulberry32(seed);
    
    const rarityRoll = rng();
    const shinyRoll = rng();
    const stats = calculateStats(rng);
    const rarity = getRarity(rarityRoll);
    const isShiny = shinyRoll < 0.01;
    const isLegendary = rarity === 'LEGENDARY';
    
    // Pick species from rarity pool
    const speciesPool = SPECIES[rarity];
    const speciesIndex = Math.floor(rng() * speciesPool.length);
    const species = speciesPool[speciesIndex];
    
    return {
        userId,
        hash: hash.substring(0, 16) + '...',
        seed,
        rarityRoll,
        shinyRoll,
        rarity,
        isShiny,
        isLegendary,
        isLegendaryShiny: isLegendary && isShiny,
        species,
        stats
    };
}

/**
 * Find Legendary Shiny userIDs
 */
function findLegendaryShiny(maxSearch = 10000000, progressInterval = 100000) {
    console.log('🌟 Claude Code Buddy - Legendary Shiny Finder');
    console.log('='.repeat(50));
    console.log(`Salt: ${SALT}`);
    console.log(`Max search: ${maxSearch.toLocaleString()} IDs`);
    console.log('='.repeat(50));
    console.log('');
    
    const results = {
        legendaryShiny: [],
        legendary: [],
        epic: []
    };
    
    const startTime = Date.now();
    
    for (let i = 0; i < maxSearch; i++) {
        const testId = `user_${i}`;
        const buddy = testUserId(testId);
        
        if (buddy.isLegendaryShiny) {
            results.legendaryShiny.push(buddy);
            console.log(`\n🎉 LEGENDARY SHINY FOUND: ${testId}`);
            console.log(`   Rarity: ${buddy.rarityRoll.toFixed(6)} | Shiny: ${buddy.shinyRoll.toFixed(6)}`);
            console.log(`   Species: ${buddy.species}`);
            
            if (results.legendaryShiny.length >= 10) {
                console.log('\n✅ Found 10 Legendary Shiny IDs, stopping search.');
                break;
            }
        } else if (buddy.isLegendary) {
            results.legendary.push(buddy);
        } else if (buddy.rarity === 'EPIC' && buddy.isShiny) {
            results.epic.push(buddy);
        }
        
        if ((i + 1) % progressInterval === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = Math.floor(progressInterval / ((Date.now() - startTime) / 1000));
            console.log(`📊 Scanned ${i.toLocaleString()} IDs... (${elapsed}s, ~${rate} IDs/sec)`);
        }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total time: ${totalTime}s`);
    console.log(`Legendary Shiny found: ${results.legendaryShiny.length}`);
    console.log(`Legendary found: ${results.legendary.length}`);
    console.log(`Shiny Epic found: ${results.epic.length}`);
    
    if (results.legendaryShiny.length > 0) {
        console.log('\n🌟 TOP LEGENDARY SHINY IDs:');
        results.legendaryShiny.forEach((b, i) => {
            console.log(`   ${i + 1}. ${b.userId} → ${b.species.toUpperCase()} (R: ${b.rarityRoll.toFixed(6)}, S: ${b.shinyRoll.toFixed(6)})`);
        });
    }
    
    return results;
}

/**
 * Find specific target buddy
 */
function findSpecificBuddy(targetSpecies, targetShiny = true, maxSearch = 10000000) {
    console.log(`🔍 Searching for ${targetShiny ? 'SHINY ' : ''}${targetSpecies.toUpperCase()}...`);
    
    for (let i = 0; i < maxSearch; i++) {
        const testId = `user_${i}`;
        const buddy = testUserId(testId);
        
        if (buddy.species === targetSpecies.toLowerCase() && (!targetShiny || buddy.isShiny)) {
            console.log(`\n✅ FOUND: ${testId}`);
            console.log(`   Species: ${buddy.species}`);
            console.log(`   Rarity: ${buddy.rarity}`);
            console.log(`   Shiny: ${buddy.isShiny}`);
            console.log(`   Rarity Roll: ${buddy.rarityRoll.toFixed(6)}`);
            console.log(`   Shiny Roll: ${buddy.shinyRoll.toFixed(6)}`);
            console.log(`   Stats: D:${buddy.stats.DEBUGGING} P:${buddy.stats.PATIENCE} C:${buddy.stats.CHAOS} W:${buddy.stats.WISDOM} S:${buddy.stats.SNARK}`);
            return buddy;
        }
    }
    
    console.log('❌ Not found within search limit');
    return null;
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'find';
    
    if (command === 'find') {
        const maxSearch = parseInt(args[1]) || 10000000;
        findLegendaryShiny(maxSearch);
    } else if (command === 'species') {
        const species = args[1] || 'nebulynx';
        const shiny = args[2] !== 'false';
        findSpecificBuddy(species, shiny);
    } else if (command === 'test') {
        const userId = args[1] || 'user_0';
        const result = testUserId(userId);
        console.log('\n📊 BUDDY ANALYSIS');
        console.log('='.repeat(40));
        console.log(`UserID: ${result.userId}`);
        console.log(`Rarity: ${result.rarity}`);
        console.log(`Shiny: ${result.isShiny}`);
        console.log(`Species: ${result.species}`);
        console.log(`Rarity Roll: ${result.rarityRoll.toFixed(6)}`);
        console.log(`Shiny Roll: ${result.shinyRoll.toFixed(6)}`);
        console.log(`Stats: D:${result.stats.DEBUGGING} P:${result.stats.PATIENCE} C:${result.stats.CHAOS} W:${result.stats.WISDOM} S:${result.stats.SNARK}`);
    } else {
        console.log(`
Usage:
  node find-legendary-shiny.js find [maxSearch]     - Find Legendary Shiny IDs
  node find-legendary-shiny.js species <name> [shiny] - Find specific species
  node find-legendary-shiny.js test <userID>        - Test a specific userID

Examples:
  node find-legendary-shiny.js find 5000000
  node find-legendary-shiny.js species nebulynx true
  node find-legendary-shiny.js test user_13457
`);
    }
}

module.exports = { testUserId, findLegendaryShiny, findSpecificBuddy, mulberry32, SALT };
