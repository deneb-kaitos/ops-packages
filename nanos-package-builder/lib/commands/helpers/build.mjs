import {
  Command,
} from 'commander/esm.mjs';
import chalk from 'chalk';
// import {
//   build as buildNodeJS,
// } from '../../builders/nodejs/build.mjs';

let command = null;

const buildPackage = async (packageName = null, version = null, debuglog = null) => {
  debuglog('buildPackage', packageName, version);

  const { build } = (await import(`../../builders/${packageName}/build.mjs`));

  // eslint-disable-next-line no-return-await
  return await build(version, debuglog);
};

export const build = (packageName = null, debuglog = null) => {
  debuglog('build', packageName);

  if (command === null) {
    command = new Command('build');
    command
      .description(chalk`build {green ${packageName}} <{blue version}>`)
      .arguments('<version>')
      // eslint-disable-next-line no-return-await
      .action(async (version) => await buildPackage(packageName, version, debuglog));
  }

  return command;
};
