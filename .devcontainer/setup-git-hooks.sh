#!/bin/bash
# Setup git hooks for the project

set -e

HOOK_DIR=".git/hooks"
PRE_COMMIT_HOOK="$HOOK_DIR/pre-commit"

echo "Setting up git hooks..."

# Ensure hooks directory exists
mkdir -p "$HOOK_DIR"

# Create pre-commit hook if it doesn't exist
if [ ! -f "$PRE_COMMIT_HOOK" ]; then
    cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/sh
# Pre-commit hook to check for typos using typos-cli

# Check if typos is installed
if ! command -v typos >/dev/null 2>&1; then
    echo "Warning: typos is not installed. Skipping typo check."
    echo "Install it with: cargo install typos-cli"
    echo "or use the DevContainer which includes it."
    exit 0
fi

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

# Run typos on staged files
echo "Running typos check on staged files..."
echo "$STAGED_FILES" | xargs typos --format brief

TYPOS_EXIT=$?

if [ $TYPOS_EXIT -ne 0 ]; then
    echo ""
    echo "Typos found in your changes!"
    echo "Please fix the typos above or add them to .typos.toml if they are false positives."
    echo "To skip this check, use: git commit --no-verify"
    exit 1
fi

echo "✓ No typos found"
exit 0
EOF

    chmod +x "$PRE_COMMIT_HOOK"
    echo "✓ Created pre-commit hook"
else
    echo "✓ pre-commit hook already exists"
fi

echo "Git hooks setup complete"
