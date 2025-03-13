# Git History Cleanup Guide

## Problem: Sensitive Data in Git History

GitHub is blocking your push because it detected sensitive data (API keys and tokens) in your repository's commit history. Even though we've fixed the current files, the history still contains the sensitive information.

## Solution: Rewrite Git History

You need to remove the sensitive data from the Git history. Here's how to do it:

### Option 1: Using BFG Repo-Cleaner (Recommended)

BFG is a faster, simpler alternative to git-filter-branch for cleansing bad data from your Git repository history.

1. Download the BFG Jar file from https://rtyley.github.io/bfg-repo-cleaner/

2. Create a file named `secrets.txt` with the sensitive data you want to remove (use your actual tokens):

```
YOUR_DOCKER_TOKEN_HERE
YOUR_OPENAI_API_KEY_HERE
```

3. Run BFG to replace the secrets with `***REMOVED***`:

```bash
java -jar bfg.jar --replace-text secrets.txt your-repo.git
```

4. Clean up and push:

```bash
cd your-repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### Option 2: Using git-filter-repo

This is a powerful Python-based tool for rewriting Git history:

1. Install git-filter-repo:
```bash
pip install git-filter-repo
```

2. Create a file named `expressions.txt` with patterns to match the sensitive data:
```
YOUR_DOCKER_TOKEN_HERE==>***DOCKER_TOKEN***
YOUR_OPENAI_API_KEY_HERE==>***OPENAI_KEY***
```

3. Run git-filter-repo:
```bash
git-filter-repo --replace-text expressions.txt
```

4. Force push the changes:
```bash
git push --force
```

### Option 3: Manual Fix in GitHub (Simplest but less secure)

If you're not concerned about the data in the history, you can simply allow the push by following the URLs provided in the error message. GitHub gives you a direct link to allow each detected secret.

However, this approach should only be used if:
- You've already revoked the tokens
- You've replaced them with new ones
- You're comfortable with the tokens potentially being visible in your history

## After Cleaning Up

After you've removed the sensitive data from the history:

1. Revoke the exposed API keys and tokens
2. Create new ones
3. Update the environment files with the new keys (but don't commit them)
4. Update any services using these keys

## Preventing Future Issues

1. Use our new environment setup:
   - `npm run setup-env` to create environment files
   - Never commit .env files (they're in .gitignore)
   - Use the sample file as a template

2. Consider using git pre-commit hooks:
   - Install husky and git-secrets to prevent accidentally committing secrets

3. Regularly audit your codebase:
   - Run periodic checks for secrets in your code
   - Use GitHub's secret scanning feature

Remember: Your security is only as strong as your most careless mistake. Always be vigilant with sensitive data.
