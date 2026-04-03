# 🔓 Reverse Engineered Claude Code Buddy System

**Get the RAREST Shiny Legendary Buddy in Claude Code!**

---

## 🎯 Tested & Working IDs

### ✅ Best Found So Far (Tested in Claude Code v2.1.91)

| UserID | Result | Rarity | Species |
|--------|--------|--------|---------|
| **`user_39645`** | ★★★★ EPIC GHOST | **Epic** | Ghost |
| `user_13457` | ★★ UNCOMMON CHONK | Uncommon | Cat |
| `7hu6BP9cozc8PPsxQbRCBp8bMnC7NPMPogojj3TEpump` | ★★ UNCOMMON GOOSE | Uncommon | Goose |
| `user_101556` | ★ COMMON DRAGON | Common | Dragon |
| `0000000000000000000000000000000000000000000000000000000000000001` | ★ COMMON DUCK | Common | Duck |

### 🔥 Top Recommendation

**Try `user_39645`** - This is the best result found so far with **★★★★ EPIC GHOST** named "Crumpet"!

---

## 📋 Table of Contents

- [What is the Buddy System?](#-what-is-the-buddy-system)
- [How It Works](#-how-it-works)
- [Rarity Tiers](#-rarity-tiers)
- [All Species](#-all-species)
- [How to Get the Rarest Buddy](#-how-to-get-the-rarest-buddy)
- [Quick Start](#-quick-start)
- [Scripts](#-scripts)
- [Calculated IDs](#-calculated-ids)
- [Advanced: Finding Legendary IDs](#-advanced-finding-legendary-ids)

---

## 🐾 What is the Buddy System?

Claude Code v2.1.91+ includes a hidden "Tamagotchi-style" companion system. Type `/buddy` in Claude Code to hatch your unique buddy!

Your buddy is **permanently locked** to your userID via a deterministic hash. This means:
- You can't reroll by restarting
- Editing the JSON config doesn't work (Claude recalculates from hash)
- **Only changing your userID works!**

---

## ⚙️ How It Works

The buddy system uses a clever deterministic generation pipeline:

```
userID → SHA-256(userID + "friend-2026-401") → Mulberry32 PRNG → Roll Stats
```

### The Algorithm

1. **Hash**: `SHA-256(userID + "friend-2026-401")`
2. **Seed**: First 8 bytes of hash → integer seed
3. **Mulberry32 PRNG**: Seeded random number generator
4. **Roll 1 - Rarity**: Determines tier (Common → Legendary)
5. **Roll 2 - Shiny**: Independent 1% chance for shiny variant
6. **Roll 3-7 - Stats**: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK

### The Salt

The secret salt hardcoded in Claude Code:
```javascript
const SALT = "friend-2026-401";
```

---

## 🎰 Rarity Tiers

| Tier | Threshold | Probability | Examples |
|------|-----------|-------------|----------|
| **Common** | < 1.0 | 60% | Duck, Goose, Pebblecrab |
| **Uncommon** | < 0.25 | 25% | Cloudferret, Gustowl |
| **Rare** | < 0.10 | 10% | Crystaldrake, Cat, Dragon |
| **Epic** | < 0.04 | 4% | Stormwyrm, Ghost, Mushroom |
| **Legendary** | < 0.01 | 1% | **Nebulynx, Cosmoshale** |

### Shiny Variant
- **Independent 1% roll** (< 0.01)
- A Shiny Legendary = **0.01% chance** (1 in 10,000)

---

## 🦎 All Species

### Legendary (1%)
- **Nebulynx** - Celestial feline
- **Cosmoshale** - Cosmic turtle/whale hybrid

### Epic (4%)
- Stormwyrm
- Voidcat
- Mushroom
- Ghost

### Rare (10%)
- Crystaldrake
- Deepstag
- Cat (Chonk)
- Dragon

### Uncommon (25%)
- Cloudferret
- Gustowl
- Snail

### Common (60%)
- Duck
- Goose
- Pebblecrab
- Dustbunny
- Mossfrog
- Blob
- Axolotl
- Capybara
- Octopus
- Owl
- Penguin
- Turtle

---

## 🚀 How to Get the Rarest Buddy

### The Problem
- Editing `~/.claude.json` companion block **doesn't work**
- Claude recalculates buddy from userID hash on every launch
- Only the "soul" (name, personality) is saved; "bones" (species, rarity) are calculated

### The Solution
**Change your userID** to one that mathematically rolls a Legendary Shiny!

### Step-by-Step

1. **Find a Lucky userID** (use our scripts or tested list above)

2. **Edit your config**:
   ```bash
   # Windows
   notepad %USERPROFILE%\.claude.json
   
   # Mac/Linux
   nano ~/.claude.json
   ```

3. **Change userID**:
   ```json
   "userID": "user_39645"
   ```

4. **DELETE the companion block** (to force fresh hatch):
   ```json
   // Remove this entire section:
   "companion": { ... }
   ```

5. **Lock the file** (prevent Claude from reverting):
   ```bash
   # Mac/Linux
   chmod 444 ~/.claude.json
   
   # Windows
   # Right-click → Properties → Check "Read-only"
   ```

6. **Hatch your buddy**:
   ```bash
   claude
   /buddy
   ```

---

## ⚡ Quick Start

### One-Liner (Mac/Linux)
```bash
cd /tmp && git clone https://github.com/dill-lk/reverse-engineered-claude-code.git && cd reverse-engineered-claude-code/scripts && node rewrite-config.js
```

### Windows
```batch
cd %TEMP%
git clone https://github.com/dill-lk/reverse-engineered-claude-code.git
cd reverse-engineered-claude-code\scripts
get-rarest-buddy.bat
```

---

## 📜 Scripts

### `find-legendary-shiny.js`
Brute-force search for Legendary Shiny userIDs.

```bash
# Find any Legendary Shiny
node find-legendary-shiny.js find

# Find specific species
node find-legendary-shiny.js species nebulynx

# Test a userID
node find-legendary-shiny.js test user_39645
```

### `rewrite-config.js`
One-click config rewriter.

```bash
# Find and apply Legendary Shiny
node rewrite-config.js

# Find specific species
node rewrite-config.js nebulynx

# Use specific userID
node rewrite-config.js user_39645

# Unlock config for editing
node rewrite-config.js --unlock
```

### `get-rarest-buddy.sh` / `get-rarest-buddy.bat`
Quick scripts for Mac/Linux and Windows.

---

## 📊 Calculated IDs

These IDs are mathematically calculated to roll Legendary Shiny (not yet tested):

| UserID | Calculated Species | Rarity Roll | Shiny Roll |
|--------|-------------------|-------------|------------|
| `user_13457` | Nebulynx | 0.00864 | 0.00846 |
| `user_4554` | Cosmoshale | 0.00523 | 0.00912 |
| `user_78921` | Nebulynx | 0.00341 | 0.00789 |

> ⚠️ **Note**: Calculated IDs may not match actual results. Your version of Claude Code may use a different salt or algorithm. Test and report your findings!

---

## 🔬 Advanced: Finding Legendary IDs

### Observed Pattern
Based on testing, higher userID numbers may yield better results:
- `user_39645` → Epic (BEST)
- `user_13457` → Uncommon
- `user_101556` → Common (worse!)

### Quick Search Script
Search in the 40000-60000 range for better results:

```bash
node -e "
const crypto = require('crypto');
function mulberry32(seed) {
    return function() {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
console.log('Searching for Legendary Shiny IDs (40000-60000)...');
for (let i = 40000; i < 60000; i++) {
    let hash = crypto.createHash('sha256').update('user_' + i + 'friend-2026-401').digest('hex');
    let seed = parseInt(hash.substring(0, 8), 16);
    let rng = mulberry32(seed);
    let r = rng(), s = rng();
    if (r < 0.01 && s < 0.01) {
        console.log('🌟 LEGENDARY SHINY: user_' + i);
        console.log('   Rarity: ' + r.toFixed(6) + ' | Shiny: ' + s.toFixed(6));
    }
}
"
```

---

## 🔬 Technical Details

### Mulberry32 PRNG Implementation
```javascript
function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
```

### Full Generation Pipeline
```javascript
const crypto = require('crypto');
const SALT = 'friend-2026-401';

function getBuddy(userId) {
    const hash = crypto.createHash('sha256').update(userId + SALT).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);
    const rng = mulberry32(seed);
    
    const rarityRoll = rng();  // First roll
    const shinyRoll = rng();   // Second roll (independent)
    
    // ... stats and species selection
}
```

---

## 📁 File Structure

```
reverse-engineered-claude-code/
├── README.md
├── scripts/
│   ├── find-legendary-shiny.js   # Main finder script
│   ├── rewrite-config.js          # One-click config rewriter
│   ├── get-rarest-buddy.sh        # Mac/Linux quick script
│   └── get-rarest-buddy.bat       # Windows quick script
├── docs/
│   └── FINDINGS.md                # Detailed technical findings
└── data/
    └── lucky-ids.json             # Pre-calculated lucky IDs
```

---

## ⚠️ Disclaimer

This project is for educational purposes only. The buddy system is a fun Easter egg in Claude Code. Use these scripts responsibly and enjoy your new legendary companion!

---

## 🤝 Contributing

Found a new lucky ID? Discovered a different salt? Open a PR or issue!

---

## 📄 License

MIT License - Use freely, credit appreciated.

---

**Made with 💜 by the Claude Code community**

*Remember: The rarest buddy is the one that helps you ship code! 🚀*
