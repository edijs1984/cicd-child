#!/bin/bash

# Define the base image name for the matching service
IMAGE_NAME="justintimeapps/scilove-cicd-child"

# Generate a timestamp to tag the image


# Complete Docker image tag
TAG="${IMAGE_NAME}:latest"

# Build and push the Docker image for Linux platform
docker buildx build --platform linux/amd64 -t $TAG --push .

echo "Docker image $TAG has been built and pushed successfully."
git add .

# Commit the changes with the tag as the commit message
git commit -m "Docker image built and pushed with tag: $TAG"

# Push the changes to the remote repository
git push

echo "Changes pushed to Git repository successfully."