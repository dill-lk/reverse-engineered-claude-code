# Claude Code Buddy System - Technical Findings

## Overview

The Claude Code buddy system is a hidden "Tamagotchi-style" companion feature in Anthropic's Claude Code CLI (v2.1.91+). This document details our reverse-engineering findings.

---

## Architecture

### "Bones vs Soul" Design

The system uses a clever two-layer architecture:

| Component | What It Contains | Where It's Stored | Editable? |
|-----------|------------------|-------------------|-----------|
| **Bones** | Species, Rarity, Stats | Calculated on-the-fly | ❌ No |
| **Soul** | Name, Personality | `~/.claude.json` | ✅ Yes |

**Key Insight**: Only the "soul" (name and AI-generated personality) is persisted. The "bones" (species, rarity, stats) are recalculated every launch from the deterministic hash.

---

## The Hash Function

```javascript
// The secret salt
const SALT = "friend-2026-401";

// Hash generation
const hash = crypto.createHash('sha256')
    .update(userID + SALT)
    .digest('hex');

// Seed extraction (first 8 hex chars)
const seed = parseInt(hash.substring(0, 8), 16);
```

### Salt Analysis

The salt `friend-2026-401` contains:
- `friend` - Friendly reference to the buddy system
- `2026` - Year (April Fools 2026 release?)
- `401` - Possibly HTTP 401 (Unauthorized) or April 1st reference

---

## The PRNG: Mulberry32

Claude Code uses Mulberry32, a fast 32-bit PRNG:

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

### Why Mulberry32?

- **Fast**: Minimal CPU overhead
- **Deterministic**: Same seed = same sequence
- **32-bit**: Works with JavaScript's number type
- **Quality**: Good enough distribution for game mechanics

---

## The Roll Sequence

```javascript
const rng = mulberry32(seed);

const rarityRoll = rng();  // Roll 1: Determines tier
const shinyRoll = rng();   // Roll 2: Determines shiny
const debugStat = rng();   // Roll 3: DEBUGGING
const patStat = rng();     // Roll 4: PATIENCE
const chaosStat = rng();   // Roll 5: CHAOS
const wisStat = rng();     // Roll 6: WISDOM
const snarkStat = rng();   // Roll 7: SNARK
```

### Rarity Determination

```javascript
function getRarity(roll) {
    if (roll < 0.01) return 'LEGENDARY';  // 1%
    if (roll < 0.04) return 'EPIC';       // 3%
    if (roll < 0.10) return 'RARE';       // 6%
    if (roll < 0.25) return 'UNCOMMON';   // 15%
    return 'COMMON';                       // 75%
}
```

### Shiny Determination

```javascript
const isShiny = shinyRoll < 0.01;  // Independent 1% roll
```

---

## Species Selection

Species are obfuscated in the source using `String.fromCharCode()` arrays, but deobfuscated reveals:

### All 18 Species

```
LEGENDARY: nebulynx, cosmoshale
EPIC: stormwyrm, voidcat, mushroom, ghost
RARE: crystaldrake, deepstag, cat, dragon
UNCOMMON: cloudferret, gustowl, snail
COMMON: duck, goose, pebblecrab, dustbunny, mossfrog, blob
```

### Selection Logic

```javascript
const speciesPool = SPECIES[rarity];
const speciesIndex = Math.floor(rng() * speciesPool.length);
const species = speciesPool[speciesIndex];
```

---

## ASCII Sprites

Each species has a 5-line ASCII art sprite:

### Nebulynx (Legendary)
```
   /\_/\  
  ( o.o ) 
   > ^ <  
  /  ~  \ 
 (__) (__)
```

### Cosmoshale (Legendary)
```
     .---.
    / o o \
   |  ---  |
   \  _^_  /
    '-----'
```

### Ghost (Epic)
```
   .----.
  / × × \
  |     |
  ~`~``~`~
```

### Dragon (Rare)
```
   /^\ /^\
  < · · >
  (  ~~  )
   `-vvvv-´
```

---

## Configuration File

### Location

| Platform | Path |
|----------|------|
| Windows | `%USERPROFILE%\.claude.json` |
| macOS/Linux | `~/.claude.json` |

### Structure

```json
{
  "userID": "user_13457",
  "numStartups": 1,
  "installMethod": "native",
  "hasCompletedOnboarding": true,
  "companion": {
    "name": "Spark",
    "personality": "A celestial feline who debugs by starlight.",
    "hatchedAt": 1775191812144
  }
}
```

### What Gets Saved

Only the "soul" data is persisted:
- `name` - AI-generated name
- `personality` - AI-generated personality description
- `hatchedAt` - Unix timestamp of first hatch

### What Gets Recalculated

Every launch, Claude recalculates:
- `species` - From hash
- `rarity` - From hash
- `shiny` - From hash
- `stats` - From hash
- `eye` - Style selector
- `hat` - Accessory selector

---

## The "Read-Only" Trick

Since Claude recalculates and writes to the config on every launch, you can prevent this by making the file read-only:

```bash
# Mac/Linux
chmod 444 ~/.claude.json

# Windows
# Right-click → Properties → Read-only
```

**However**, this only prevents Claude from updating the "soul" data. The "bones" are still calculated in memory from the userID hash.

---

## How to "Cheat" the System

### Method 1: userID Spoofing

1. Find a userID that rolls Legendary Shiny
2. Replace `userID` in config
3. Delete `companion` block
4. Lock file as read-only
5. Launch Claude and run `/buddy`

### Method 2: Source Patching

For advanced users, patch the installed source code:

1. Find Claude Code installation:
   ```bash
   npm root -g
   # Usually: /usr/lib/node_modules/@anthropic-ai/claude-code
   ```

2. Locate `buddy/companion.ts` or compiled equivalent

3. Patch the roll function:
   ```javascript
   // Replace
   const rarityRoll = rng();
   // With
   const rarityRoll = 0.001; // Force Legendary
   ```

---

## Stats

Each buddy has 5 stats (cosmetic only):

| Stat | Description |
|------|-------------|
| DEBUGGING | Code debugging ability |
| PATIENCE | Tolerance for bad code |
| CHAOS | Propensity for chaos |
| WISDOM | Coding wisdom |
| SNARK | Sarcasm level |

Stats are rolled 0-100 via PRNG and do not affect actual AI behavior.

---

## Eye Styles

6 eye styles have been identified:
- `◉` - Standard round
- `✦` - Star (for shinies)
- `×` - X eyes
- `·` - Dot eyes
- `o` - Small round
- `@` - Swirl

---

## Hats/Accessories

8 accessories:
- `crown` - Royal crown (Legendary only)
- `wizard` - Wizard hat
- `party` - Party hat
- `top` - Top hat
- `cap` - Baseball cap
- `bow` - Hair bow
- `none` - No accessory
- `???` - Secret accessories

---

## Time-Based Features

Some features may be time-locked:
- April 1st special events
- Anniversary shinies
- Holiday accessories

---

## API Endpoints

The buddy system is entirely local - no API calls for generation. The "soul" (name, personality) is generated by Claude's LLM during the first hatch.

---

## Future Updates

Anthropic may change:
- The salt value
- Rarity thresholds
- Species pool
- PRNG algorithm

This could invalidate pre-calculated lucky IDs. Always verify with the current version.

---

## Conclusion

The Claude Code buddy system is a well-designed Easter egg that:
- Encourages exploration
- Creates emotional attachment
- Uses proper cryptographic hashing
- Maintains determinism

The only way to "cheat" is to change your userID to one that mathematically rolls the desired outcome.

---

*Document compiled from community research and source code analysis.*
