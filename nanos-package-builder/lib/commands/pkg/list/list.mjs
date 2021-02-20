/* eslint-disable import/no-unresolved, node/no-missing-import */

import {
  Command,
} from 'commander/esm.mjs';
import chalk from 'chalk';
import {
  packages,
} from '../../../helpers/getPackages.mjs';
import {
  log,
} from '../../../helpers/log.mjs';
import {
  debuglog,
} from '../../../helpers/debuglog.mjs';

let command = null;

const listPackages = async () => {
  const packageNames = Object.keys(packages).join(', ');
  const output = `${chalk.green('packages:')} ${packageNames}`;

  debuglog(output);
  log(output);
};

export const list = () => {
  if (command === null) {
    command = new Command('list');
    command
      .description('list all packages')
      .action(() => listPackages(debuglog));
  }

  return command;
};
