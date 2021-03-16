import dotenv = require('dotenv');
import fs = require('fs');
import os = require('os');
import path = require('path');
import logger from '../../lib/logger';

const filename: string = 'ibm-credentials.env';

/**
 * Return a config object based on a credentials file. Credentials files can
 * be specified filepath via the environment variable: `IBM_CREDENTIALS_FILE`.
 */
export function readCredentialsFile() {
  if (!fs.existsSync) {
    return {};
  }

  // first look for an env variable called IBM_CREDENTIALS_FILE
  // it should be the path to the file

  // then look at the current working directory
  // then at the os-dependent home directory

  const givenFilepath: string = process.env['IBM_CREDENTIALS_FILE'] || '';
  const workingDir: string = constructFilepath(process.cwd());
  const homeDir: string = constructFilepath(os.homedir());

  let filepathToUse: string;

  if (givenFilepath) {
    if (fileExistsAtPath(givenFilepath)) {
      // see if user gave a path to a file named something other than `ibm-credentials.env`
      filepathToUse = givenFilepath;
    } else if (fileExistsAtPath(constructFilepath(givenFilepath))) {
      // see if user gave a path to the directory where file is located
      filepathToUse = constructFilepath(givenFilepath);
    }
  } else if (fileExistsAtPath(workingDir)) {
    filepathToUse = workingDir;
  } else if (fileExistsAtPath(homeDir)) {
    filepathToUse = homeDir;
  } else {
    // file does not exist anywhere, will not be used
    logger.info('Credential file does not exist. Will not be used');
    return {};
  }

  const credsFile = fs.readFileSync(filepathToUse);

  return dotenv.parse(credsFile);
}

export function fileExistsAtPath(filepath): boolean {
  if (fs.existsSync(filepath)) {
    const stats = fs.lstatSync(filepath);
    return stats.isFile() || stats.isSymbolicLink();
  }

  return false;
}

export function constructFilepath(filepath): string {
  // ensure filepath includes the filename
  if (!filepath.endsWith(filename)) {
    filepath = path.join(filepath, filename);
  }

  return filepath;
}
