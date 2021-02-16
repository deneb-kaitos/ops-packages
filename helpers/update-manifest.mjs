/* eslint-disable node/no-missing-import */
/* eslint-disable import/no-unresolved */

import {
  readFile,
  writeFile,
} from 'fs/promises';
import {
  resolve,
} from 'path';
import {
  Command,
} from 'commander/esm.mjs';

const getFileAsJSON = async (file = null) => {
  const raw = await readFile(file);

  return JSON.parse(Buffer.from(raw).toString());
};

const program = new Command();

program
  .version('0.0.0')
  .option('-m, --manifest <manifestFile>', 'manifest file')
  .option('-d, --definition <contentsObject>', 'definition object')
  .parse(process.argv);

const opts = program.opts();

const manifestFile = opts.manifest ?? null;

if (manifestFile === null) {
  throw new ReferenceError('manifestFile is undefined');
}

const definitionsFile = opts.definition ?? null;

if (definitionsFile === null) {
  throw new ReferenceError('definitionsFile is undefined');
}

const manifestContents = await getFileAsJSON(manifestFile);
const definitionContents = await getFileAsJSON(definitionsFile);
const appName = Object.keys(definitionContents)[0];
const appNames = Object.keys(manifestContents);
const result = {
  ...manifestContents,
  ...definitionContents
};

await writeFile(manifestFile, JSON.stringify(result, null, 2), {
  encoding: 'utf-8',
  flag: 'w',
});
