/* eslint-disable import/no-unresolved, node/no-missing-import */

import {
  readFile,
} from 'fs/promises';

const PACKAGES_JSON = './data/packages.json';
let packages = null;

export const getPackages = async (debuglog = null) => {
  if (packages === null) {
    packages = Object.freeze(JSON.parse(Buffer.from(await readFile(PACKAGES_JSON)).toString()));

    debuglog('getPackages:', packages);
  }

  return packages;
};

export {
  packages,
};
