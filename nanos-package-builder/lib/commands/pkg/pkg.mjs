import {
  Command,
} from 'commander/esm.mjs';
import {
  list,
} from './list/list.mjs';
import {
  packages,
} from '../../helpers/getPackages.mjs';
import {
  buildPackageCommand,
} from '../helpers/buildPackageCommand.mjs';

let command = null;

export const pkg = (debuglog = null) => {
  const packageNames = Object.keys(packages);
  debuglog('pkg.packageNames:', packageNames);

  if (command === null) {
    command = new Command('pkg');
    command
      .description('manage packages')
      .addCommand(list(debuglog));

    for (const packageName of packageNames) {
      command
        .addCommand(buildPackageCommand(packageName, debuglog), { hidden: true });
    }
  }

  return command;
};
