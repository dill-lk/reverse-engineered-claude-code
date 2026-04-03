#!/usr/bin/env node
/**
 * Claude Code Config Rewriter
 * 
 * One-click script to:
 * 1. Find a Legendary Shiny userID
 * 2. Backup existing config
 * 3. Rewrite the config with new userID
 * 4. Make config read-only (optional)
 * 
 * Usage:
 *   node rewrite-config.js              - Find and apply Legendary Shiny
 *   node rewrite-config.js nebulynx     - Find specific species
 *   node rewrite-config.js user_12345   - Use specific userID
 *   node rewrite-config.js --unlock     - Unlock config for editing
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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

const SPECIES = {
    LEGENDARY: ['nebulynx', 'cosmoshale'],
    EPIC: ['stormwyrm', 'voidcat', 'mushroom', 'ghost'],
    RARE: ['crystaldrake', 'deepstag', 'cat', 'dragon'],
    UNCOMMON: ['cloudferret', 'gustowl', 'snail'],
    COMMON: ['duck', 'goose', 'pebblecrab', 'dustbunny', 'mossfrog', 'blob']
};

function getRarity(roll) {
    if (roll < 0.01) return 'LEGENDARY';
    if (roll < 0.04) return 'EPIC';
    if (roll < 0.10) return 'RARE';
    if (roll < 0.25) return 'UNCOMMON';
    return 'COMMON';
}

function testUserId(userId) {
    const hash = crypto.createHash('sha256').update(userId + SALT).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);
    const rng = mulberry32(seed);
    
    const rarityRoll = rng();
    const shinyRoll = rng();
    const rarity = getRarity(rarityRoll);
    const isShiny = shinyRoll < 0.01;
    
    const speciesPool = SPECIES[rarity];
    const speciesIndex = Math.floor(rng() * speciesPool.length);
    const species = speciesPool[speciesIndex];
    
    return { userId, rarityRoll, shinyRoll, rarity, isShiny, species };
}

function getConfigPath() {
    const platform = os.platform();
    const home = os.homedir();
    
    if (platform === 'win32') {
        return path.join(home, '.claude.json');
    } else {
        return path.join(home, '.claude.json');
    }
}

function backupConfig(configPath) {
    const backupPath = configPath + '.backup.' + Date.now();
    if (fs.existsSync(configPath)) {
        fs.copyFileSync(configPath, backupPath);
        console.log(`📦 Backup created: ${backupPath}`);
        return backupPath;
    }
    return null;
}

function readConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        console.log('⚠️  Config file not found, creating new one...');
        return {};
    }
    
    try {
        const content = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.log('⚠️  Config file is corrupted, starting fresh...');
        return {};
    }
}

function writeConfig(configPath, config, lock = true) {
    // Remove companion to force fresh hatch
    delete config.companion;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Config written to: ${configPath}`);
    
    if (lock && os.platform() !== 'win32') {
        try {
            fs.chmodSync(configPath, 0o444);
            console.log('🔒 Config locked (read-only)');
        } catch (e) {
            console.log('⚠️  Could not lock config (may need sudo)');
        }
    }
    
    return true;
}

function unlockConfig(configPath) {
    if (os.platform() !== 'win32') {
        try {
            fs.chmodSync(configPath, 0o644);
            console.log('🔓 Config unlocked (writable)');
        } catch (e) {
            console.log('⚠️  Could not unlock config');
        }
    } else {
        console.log('ℹ️  On Windows, right-click the file → Properties → Uncheck "Read-only"');
    }
}

function findLegendaryShinyId(maxSearch = 5000000) {
    console.log('🔍 Searching for Legendary Shiny userID...');
    
    for (let i = 0; i < maxSearch; i++) {
        const testId = `user_${i}`;
        const buddy = testUserId(testId);
        
        if (buddy.rarity === 'LEGENDARY' && buddy.isShiny) {
            console.log(`\n🎉 FOUND: ${testId}`);
            console.log(`   Species: ${buddy.species}`);
            console.log(`   Rarity Roll: ${buddy.rarityRoll.toFixed(6)} (< 0.01)`);
            console.log(`   Shiny Roll: ${buddy.shinyRoll.toFixed(6)} (< 0.01)`);
            return buddy;
        }
        
        if ((i + 1) % 500000 === 0) {
            console.log(`   Scanned ${i.toLocaleString()} IDs...`);
        }
    }
    
    return null;
}

function findSpeciesId(species, shiny = true, maxSearch = 5000000) {
    console.log(`🔍 Searching for ${shiny ? 'SHINY ' : ''}${species.toUpperCase()}...`);
    
    for (let i = 0; i < maxSearch; i++) {
        const testId = `user_${i}`;
        const buddy = testUserId(testId);
        
        if (buddy.species === species.toLowerCase() && (!shiny || buddy.isShiny)) {
            console.log(`\n🎉 FOUND: ${testId}`);
            console.log(`   Species: ${buddy.species}`);
            console.log(`   Rarity: ${buddy.rarity}`);
            console.log(`   Shiny: ${buddy.isShiny}`);
            console.log(`   Rarity Roll: ${buddy.rarityRoll.toFixed(6)}`);
            console.log(`   Shiny Roll: ${buddy.shinyRoll.toFixed(6)}`);
            return buddy;
        }
        
        if ((i + 1) % 500000 === 0) {
            console.log(`   Scanned ${i.toLocaleString()} IDs...`);
        }
    }
    
    return null;
}

// Main CLI
if (require.main === module) {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   Claude Code Buddy Config Rewriter v1.0        ║');
    console.log('║   Get the RAREST Shiny Legendary Buddy!         ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    
    const args = process.argv.slice(2);
    const configPath = getConfigPath();
    
    console.log(`📁 Config path: ${configPath}\n`);
    
    // Handle unlock command
    if (args[0] === '--unlock') {
        unlockConfig(configPath);
        process.exit(0);
    }
    
    // Backup existing config
    backupConfig(configPath);
    
    // Read existing config
    const config = readConfig(configPath);
    
    let buddy = null;
    
    // Determine userID to use
    if (args[0] && args[0].startsWith('user_')) {
        // Specific userID provided
        buddy = testUserId(args[0]);
        console.log(`📋 Testing provided userID: ${args[0]}`);
    } else if (args[0]) {
        // Species name provided
        buddy = findSpeciesId(args[0], true);
    } else {
        // Find Legendary Shiny
        buddy = findLegendaryShinyId();
    }
    
    if (!buddy) {
        console.log('\n❌ Could not find matching userID within search limit');
        process.exit(1);
    }
    
    // Update config
    config.userID = buddy.userId;
    
    // Write and lock
    writeConfig(configPath, config, true);
    
    console.log('\n' + '═'.repeat(50));
    console.log('📋 NEXT STEPS:');
    console.log('═'.repeat(50));
    console.log('1. Close ALL Claude Code terminal windows');
    console.log('2. Open a NEW terminal');
    console.log('3. Run: claude');
    console.log('4. Type: /buddy');
    console.log('5. Enjoy your ' + (buddy.isShiny ? '✦ SHINY ✦ ' : '') + buddy.species.toUpperCase() + '!');
    console.log('');
    console.log('⚠️  Windows users: If it reverts, right-click .claude.json');
    console.log('   → Properties → Check "Read-only" → OK');
    console.log('═'.repeat(50));
}

module.exports = { getConfigPath, readConfig, writeConfig, testUserId, findLegendaryShinyId };
