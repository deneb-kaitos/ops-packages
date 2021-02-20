import {
  Command,
} from 'commander/esm.mjs';
import chalk from 'chalk';
import {
  log,
} from '../../helpers/log.mjs';

let command = null;

const buildPackage = async (debuglog = null, {
  packageName = null,
  version = null,
  outputDirectory = null,
  install = false,
}) => {
  const message = install === true
    ? chalk`build {green ${packageName}} {yellow ${version}} and install it to {cyan ~/.ops/local_packages}`
    : chalk`build {green ${packageName}} {yellow ${version}} to {cyan ${outputDirectory}}`;

  debuglog(message);
  log(message);

  const { build } = (await import(`../../builders/${packageName}/build.mjs`));

  // eslint-disable-next-line no-return-await
  return await build(version, outputDirectory, install, debuglog);
};

export const build = (packageName = null, debuglog = null) => {
  debuglog('build', packageName);

  if (command === null) {
    command = new Command('build');
    command
      .description(chalk`build {green ${packageName}} <{blue version}>`)
      .arguments('<version>')
      .option('-o, --output-directory <output-directory>', 'output directory')
      .option('-i, --install', `install ${packageName} to ~/.ops/local_packages`)
      // eslint-disable-next-line no-return-await
      .action(async (version) => await buildPackage(debuglog, {
        packageName,
        version,
        outputDirectory: (command.opts()).outputDirectory ?? process.cwd(),
        install: (command.opts()).install ?? false,
      }));
  }

  return command;
};
