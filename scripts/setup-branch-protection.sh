#!/bin/bash

# Script to set up branch protection rules for the main branch
# Run this script to configure GitHub branch protection

echo "Setting up branch protection rules for main branch..."

# Enable branch protection for main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "Branch protection rules configured successfully!"
echo ""
echo "Main branch now requires:"
echo "- At least 1 approving review"
echo "- All CI checks to pass"
echo "- Up-to-date branches"
echo "- No direct pushes to main"
