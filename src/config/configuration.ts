import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import * as AWS from 'aws-sdk';
const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID, //config.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY, //config.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION, //config.AWS_REGION,
  });
  return {} as Record<string, any>;
};
