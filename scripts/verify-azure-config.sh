#!/bin/bash
# Script to verify Azure Container App configuration for OpenAI API key

# Check if required tools are installed
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI (az) is not installed or not in PATH"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "You are not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Configuration
CONTAINER_APP_NAME="landingpage"
RESOURCE_GROUP="portfolio-apps"

echo "========================================================"
echo "Azure Container App OpenAI Configuration Verification"
echo "========================================================"

# Check container app existence
if ! az containerapp show -n "$CONTAINER_APP_NAME" -g "$RESOURCE_GROUP" &> /dev/null; then
    echo "Error: Container App '$CONTAINER_APP_NAME' not found in resource group '$RESOURCE_GROUP'"
    exit 1
fi

echo "Container App '$CONTAINER_APP_NAME' found in resource group '$RESOURCE_GROUP'"

# Get environment variables
echo -e "\n>>> Environment Variables:"
ENV_VARS=$(az containerapp show -n "$CONTAINER_APP_NAME" -g "$RESOURCE_GROUP" --query "properties.template.containers[0].env" -o json)
echo "$ENV_VARS" | jq '.'

# Check specifically for OPENAI_API_KEY
echo -e "\n>>> Checking OPENAI_API_KEY environment variable:"
OPENAI_ENV_VAR=$(echo "$ENV_VARS" | jq '.[] | select(.name=="OPENAI_API_KEY")')

if [ -z "$OPENAI_ENV_VAR" ]; then
    echo "❌ OPENAI_API_KEY environment variable not found!"
else
    echo "✅ OPENAI_API_KEY environment variable found"
    
    # Check if it's a secretRef
    SECRET_REF=$(echo "$OPENAI_ENV_VAR" | jq -r '.secretRef // empty')
    if [ -n "$SECRET_REF" ]; then
        echo "   ℹ️ References secret: $SECRET_REF"
        
        # Check if the secret exists
        SECRETS=$(az containerapp secret list -n "$CONTAINER_APP_NAME" -g "$RESOURCE_GROUP" -o json)
        SECRET_EXISTS=$(echo "$SECRETS" | jq --arg name "$SECRET_REF" '.[] | select(.name==$name)')
        
        if [ -z "$SECRET_EXISTS" ]; then
            echo "   ❌ Referenced secret '$SECRET_REF' not found in Container App secrets!"
        else
            echo "   ✅ Referenced secret '$SECRET_REF' exists in Container App secrets"
        fi
    else
        VALUE=$(echo "$OPENAI_ENV_VAR" | jq -r '.value // empty')
        if [ -n "$VALUE" ]; then
            if [[ "$VALUE" == sk-* ]]; then
                echo "   ℹ️ Contains a direct API key value (starts with sk-)"
            else
                echo "   ⚠️ Contains a value but doesn't appear to be a valid OpenAI API key (doesn't start with sk-)"
            fi
        else
            echo "   ❌ No value or secretRef found for OPENAI_API_KEY!"
        fi
    fi
fi

echo -e "\n>>> Container App Secrets:"
az containerapp secret list -n "$CONTAINER_APP_NAME" -g "$RESOURCE_GROUP" -o table

echo -e "\n>>> Verification Complete"
echo "If issues are found, you can update your configuration with:"
echo "az containerapp secret set -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --secrets openai-api-key=your-api-key-here"
echo "az containerapp update -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --set-env-vars \"OPENAI_API_KEY=secretref:openai-api-key\""
