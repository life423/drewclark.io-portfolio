#!/bin/bash

# Script to deploy to Azure Container App with retry logic
# This handles "ContainerAppOperationInProgress" error by implementing
# exponential backoff retry mechanism

MAX_ATTEMPTS=5
WAIT_TIME=30  # Initial wait time in seconds
CONTAINER_APP_NAME=$1
RESOURCE_GROUP=$2
IMAGE_NAME=$3

echo "Starting deployment with retry for $CONTAINER_APP_NAME"
echo "Image: $IMAGE_NAME"

for ((attempt=1; attempt<=MAX_ATTEMPTS; attempt++))
do
    echo "Attempt $attempt of $MAX_ATTEMPTS..."
    
    # Check if there's an operation in progress
    OPERATION_STATUS=$(az containerapp show -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP --query "properties.provisioningState" -o tsv 2>/dev/null)
    
    if [[ "$OPERATION_STATUS" == "Succeeded" ]]; then
        echo "No active operations detected, proceeding with update..."
        
        # Try to update the Container App
        if az containerapp update -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP -i $IMAGE_NAME; then
            echo "Container App successfully updated!"
            exit 0
        else
            ERROR_MSG=$(az containerapp show -n $CONTAINER_APP_NAME -g $RESOURCE_GROUP 2>&1)
            if [[ "$ERROR_MSG" == *"ContainerAppOperationInProgress"* ]]; then
                echo "Container App operation in progress. Retrying after backoff..."
            else
                echo "Failed to update Container App with error: $ERROR_MSG"
            fi
        fi
    else
        echo "Container App is in '$OPERATION_STATUS' state. Waiting for completion..."
    fi
    
    # Calculate wait time with exponential backoff
    WAIT_TIME=$((WAIT_TIME * 2))
    echo "Waiting for $WAIT_TIME seconds before next attempt..."
    sleep $WAIT_TIME
done

echo "Failed to update Container App after $MAX_ATTEMPTS attempts."
exit 1
