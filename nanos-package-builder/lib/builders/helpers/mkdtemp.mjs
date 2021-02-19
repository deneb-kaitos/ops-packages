/* eslint-disable import/no-unresolved, node/no-missing-import */

import {
  sep,
  join,
} from 'path';
import {
  tmpdir,
} from 'os';
import {
  mkdtemp as makeTempDir,
} from 'fs/promises';

// eslint-disable-next-line no-return-await
export const mkdtemp = async () => await makeTempDir(join(tmpdir(), sep));
