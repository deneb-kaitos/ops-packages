import {
  Command,
} from 'commander/esm.mjs';
import chalk from 'chalk';
import {
  versions,
} from './versions.mjs';
import {
  build,
} from './build.mjs';

const packageCommands = {};

export const buildPackageCommand = (packageName = null, debuglog = null) => {
  debuglog('buildPackageCommand:', packageName);

  if (Object.keys(packageCommands).includes(packageName) === false) {
    packageCommands[packageName] = new Command(packageName);
    (packageCommands[packageName])
      .description(chalk`manage {green ${packageName}} package`)
      .addCommand(versions(packageName, debuglog))
      .addCommand(build(packageName, debuglog));
  }

  return packageCommands[packageName];
};
