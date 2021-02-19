#!/usr/bin/env node

import {
  LibCLI,
} from './lib/libcli.mjs';

(async () => {
  const libCLI = new LibCLI();

  await libCLI.start();
  await libCLI.exec();
  // eslint-disable-next-line no-return-await
  return await libCLI.stop();
})();
