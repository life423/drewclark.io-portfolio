/**
 * Husky & Git Hooks Setup Script
 * This script sets up Git hooks to help prevent committing sensitive data.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up pre-commit hooks for security...');

try {
  // Install husky and lint-staged
  console.log('Installing husky and detect-secrets-hook...');
  execSync('npm install --save-dev husky lint-staged detect-secrets-hook', { stdio: 'inherit' });

  // Update package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);

  // Add husky and lint-staged configuration if not already present
  packageJson.husky = packageJson.husky || {
    "hooks": {
      "pre-commit": "lint-staged && detect-secrets-hook"
    }
  };

  packageJson["lint-staged"] = packageJson["lint-staged"] || {
    "*.{js,jsx,ts,tsx,json,md}": [
      "detect-secrets-hook"
    ]
  };

  // Add detect-secrets configuration
  const detectSecretsConfig = {
    "version": "1.0.0",
    "plugins_used": [
      {
        "name": "AWSKeyDetector"
      },
      {
        "name": "AzureStorageKeyDetector"
      },
      {
        "name": "BasicAuthDetector"
      },
      {
        "name": "CloudantDetector"
      },
      {
        "name": "GitHubTokenDetector"
      },
      {
        "name": "HexHighEntropyString",
        "limit": 3.0
      },
      {
        "name": "IbmCloudIamDetector"
      },
      {
        "name": "IbmCosHmacDetector"
      },
      {
        "name": "JwtTokenDetector"
      },
      {
        "name": "KeywordDetector",
        "keyword_exclude": ""
      },
      {
        "name": "MailchimpDetector"
      },
      {
        "name": "NpmDetector"
      },
      {
        "name": "PrivateKeyDetector"
      },
      {
        "name": "SlackDetector"
      },
      {
        "name": "SoftlayerDetector"
      },
      {
        "name": "SquareOAuthDetector"
      },
      {
        "name": "StripeDetector"
      },
      {
        "name": "TwilioKeyDetector"
      }
    ],
    "filters_used": [
      {
        "path": "detect_secrets.filters.allowlist.is_line_allowlisted"
      },
      {
        "path": "detect_secrets.filters.common.is_ignored_due_to_verification_policies",
        "min_level": 2
      },
      {
        "path": "detect_secrets.filters.heuristic.is_indirect_reference"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_likely_id_string"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_lock_file"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_not_alphanumeric_string"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_potential_uuid"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_prefixed_with_dollar_sign"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_sequential_string"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_swagger_file"
      },
      {
        "path": "detect_secrets.filters.heuristic.is_templated_secret"
      }
    ]
  };

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with husky and lint-staged configuration');

  // Write detect-secrets configuration
  fs.writeFileSync(
    path.join(__dirname, '.detect-secrets.yaml'),
    JSON.stringify(detectSecretsConfig, null, 2)
  );
  console.log('Created .detect-secrets.yaml configuration file');

  // Initialize husky
  console.log('Initializing husky...');
  execSync('npx husky install', { stdio: 'inherit' });
  execSync('npx husky add .husky/pre-commit "npx lint-staged && npx detect-secrets-hook"', { stdio: 'inherit' });

  console.log('\n✅ Pre-commit hooks setup successfully!');
  console.log('\nThese hooks will help prevent accidentally committing sensitive data.');
  console.log('If you need to bypass these checks in special cases, use git commit with the --no-verify flag.');

} catch (error) {
  console.error('❌ Error setting up pre-commit hooks:', error);
  console.log('\nYou can manually set up similar protections by:');
  console.log('1. Installing husky: npm install --save-dev husky');
  console.log('2. Setting up a pre-commit hook to scan for secrets');
}
