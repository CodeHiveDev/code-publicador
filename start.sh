#!/bin/bash

ENV_FILE_NAME="ide-publicador/.env.${ENVIRONMENT}"
ENV_FILE_DIRNAME="envs"

if [[ -z ${ENVIRONMENT} ]]; then
  echo "ENVIRONMENT variable is not defined. Aborting..."
  exit 1
fi

if [[ -z ${ENVIRONMENT_BUCKET} ]]; then
  echo "ENVIRONMENT_BUCKET variable is not defined. Aborting..."
  exit 1
fi

echo "Checking if env file exists on this filesystem."

if [[ -f ${ENV_FILE_DIRNAME}/${ENV_FILE_NAME} ]]; then
    echo "${ENV_FILE_DIRNAME}/${ENV_FILE_NAME} exists on this filesystem."
    echo "Copying and using env file on this filesystem."
    cp envs/"${ENV_FILE_NAME}" .env
else
    echo "${ENV_FILE_NAME} doesn't exist on this filesystem."
    echo "Copying env file from AWS S3 Bucket '${ENVIRONMENT_BUCKET}/${ENV_FILE_NAME}'"
    aws s3 cp s3://"${ENVIRONMENT_BUCKET}"/"${ENV_FILE_NAME}" .env
fi

echo "Starting server"
npm run start:prod
