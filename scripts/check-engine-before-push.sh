#!/bin/bash

# Script to check if engine.py has Supabase pooler fix before pushing to main
# Run this before pushing/merging to main branch

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING engine.py BEFORE PUSH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ENGINE_FILE="apps/backend/core/database/engine.py"

# Check if file exists
if [ ! -f "$ENGINE_FILE" ]; then
    echo "❌ File not found: $ENGINE_FILE"
    exit 1
fi

# Check if file contains Supabase pooler fix
if grep -q "statement_cache_size.*0" "$ENGINE_FILE" || grep -q "pooler.supabase.com" "$ENGINE_FILE"; then
    echo "⚠️  WARNING: engine.py contains Supabase pooler fix!"
    echo ""
    echo "This fix is for LOCAL DEVELOPMENT only."
    echo "Before pushing to main branch:"
    echo ""
    echo "1. Revert engine.py to original (without Supabase pooler fix)"
    echo "2. Or ensure production server doesn't use Supabase pooler"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Current branch: $(git branch --show-current)"
    echo ""
    
    # Check if pushing to main
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
        echo "🚨 YOU ARE ON MAIN/MASTER BRANCH!"
        echo "Please revert engine.py before pushing!"
        exit 1
    fi
    
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Please revert engine.py first."
        exit 1
    fi
else
    echo "✅ engine.py looks clean (no Supabase pooler fix detected)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

