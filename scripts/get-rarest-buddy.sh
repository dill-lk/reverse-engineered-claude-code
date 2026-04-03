#!/bin/bash
echo "============================================================"
echo "  Claude Code Buddy - Get RAREST Shiny Legendary!"
echo "============================================================"
echo ""

cd "$(dirname "$0")"

echo "🔍 Finding Legendary Shiny userID..."
RESULT=$(node find-legendary-shiny.js find 5000000 2>&1 | grep -E "user_[0-9]+")

if [ -z "$RESULT" ]; then
    echo "❌ No Legendary Shiny found, trying smaller search..."
    RESULT=$(node find-legendary-shiny.js find 1000000 2>&1 | grep -E "user_[0-9]+")
fi

echo ""
echo "============================================================"
echo "📋 FOUND! Now update your config:"
echo "============================================================"
echo "1. Open: ~/.claude.json"
echo "2. Change \"userID\" to: $RESULT"
echo "3. DELETE the entire \"companion\" block"
echo "4. Save and lock: chmod 444 ~/.claude.json"
echo "5. Run Claude Code and type /buddy"
echo "============================================================"

# Auto-apply option
read -p "Apply automatically? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CONFIG=~/.claude.json
    USERID=$(echo "$RESULT" | grep -oE "user_[0-9]+")
    
    # Backup
    cp "$CONFIG" "$CONFIG.backup.$(date +%s)"
    
    # Update userID and remove companion
    node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('$CONFIG', 'utf8'));
        config.userID = '$USERID';
        delete config.companion;
        fs.writeFileSync('$CONFIG', JSON.stringify(config, null, 2));
    "
    
    # Lock
    chmod 444 "$CONFIG"
    
    echo "✅ Done! Run 'claude' then '/buddy' to see your Legendary Shiny!"
fi
