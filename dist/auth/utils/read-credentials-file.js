"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var fs = require("fs");
var os = require("os");
var path = require("path");
var logger_1 = require("../../lib/logger");
var filename = 'ibm-credentials.env';
/**
 * Return a config object based on a credentials file. Credentials files can
 * be specified filepath via the environment variable: `IBM_CREDENTIALS_FILE`.
 */
function readCredentialsFile() {
    if (!fs.existsSync) {
        return {};
    }
    // first look for an env variable called IBM_CREDENTIALS_FILE
    // it should be the path to the file
    // then look at the current working directory
    // then at the os-dependent home directory
    var givenFilepath = process.env.IBM_CREDENTIALS_FILE || '';
    var workingDir = constructFilepath(process.cwd());
    var homeDir = constructFilepath(os.homedir());
    var filepathToUse;
    if (givenFilepath) {
        if (fileExistsAtPath(givenFilepath)) {
            // see if user gave a path to a file named something other than `ibm-credentials.env`
            filepathToUse = givenFilepath;
        }
        else if (fileExistsAtPath(constructFilepath(givenFilepath))) {
            // see if user gave a path to the directory where file is located
            filepathToUse = constructFilepath(givenFilepath);
        }
    }
    else if (fileExistsAtPath(workingDir)) {
        filepathToUse = workingDir;
    }
    else if (fileExistsAtPath(homeDir)) {
        filepathToUse = homeDir;
    }
    else {
        // file does not exist anywhere, will not be used
        logger_1.default.info('Credential file does not exist. Will not be used');
        return {};
    }
    var credsFile = fs.readFileSync(filepathToUse);
    return dotenv.parse(credsFile);
}
exports.readCredentialsFile = readCredentialsFile;
function fileExistsAtPath(filepath) {
    if (fs.existsSync(filepath)) {
        var stats = fs.lstatSync(filepath);
        return stats.isFile() || stats.isSymbolicLink();
    }
    return false;
}
exports.fileExistsAtPath = fileExistsAtPath;
function constructFilepath(filepath) {
    // ensure filepath includes the filename
    if (!filepath.endsWith(filename)) {
        filepath = path.join(filepath, filename);
    }
    return filepath;
}
exports.constructFilepath = constructFilepath;
