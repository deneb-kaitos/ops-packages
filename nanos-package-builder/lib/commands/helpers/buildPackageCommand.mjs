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
import {
  debuglog,
} from '../../helpers/debuglog.mjs';

const packageCommands = {};

export const buildPackageCommand = (packageName = null) => {
  debuglog('buildPackageCommand:', packageName);

  if (Object.keys(packageCommands).includes(packageName) === false) {
    packageCommands[packageName] = new Command(packageName);
    (packageCommands[packageName])
      .description(chalk`manage {green ${packageName}} package`)
      .addCommand(versions(packageName))
      .addCommand(build(packageName));
  }

  return packageCommands[packageName];
};
