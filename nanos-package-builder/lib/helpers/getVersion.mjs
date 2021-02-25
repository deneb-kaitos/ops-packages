/* eslint-disable import/no-unresolved, node/no-missing-import */

import {
  readFile,
  realpath,
} from 'fs/promises';
import {
  debuglog,
} from './debuglog.mjs';

const PACKAGE_JSON = new URL('../../package.json', import.meta.url).pathname;
let packageJsonPath = null;
let version = null;

export const getVersion = async () => {
  if (debuglog === null) {
    throw new ReferenceError('debuglog is undefined');
  }

  if (packageJsonPath === null) {
    packageJsonPath = await realpath(PACKAGE_JSON);
  }

  if (version === null) {
    version = JSON.parse(Buffer.from(await readFile(packageJsonPath)).toString()).version;
  }

  return version;
};
