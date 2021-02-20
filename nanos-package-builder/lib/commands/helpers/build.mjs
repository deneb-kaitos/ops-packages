import {
  Command,
} from 'commander/esm.mjs';
import chalk from 'chalk';
import {
  log,
} from '../../helpers/log.mjs';

let command = null;

const buildPackage = async (debuglog = null, { packageName = null, version = null, outputDirectory = null }) => {
  debuglog('buildPackage', packageName, version, outputDirectory);
  log(chalk`buildPackage: {green ${packageName}} {cyan ${version}} {yellow ${outputDirectory}}`);

  const { build } = (await import(`../../builders/${packageName}/build.mjs`));

  // eslint-disable-next-line no-return-await
  return await build(version, outputDirectory, debuglog);
};

export const build = (packageName = null, debuglog = null) => {
  debuglog('build', packageName);

  if (command === null) {
    command = new Command('build');
    command
      .description(chalk`build {green ${packageName}} <{blue version}>`)
      .arguments('<version>')
      .option('-o, --output-directory <output-directory>', 'output directory')
      // eslint-disable-next-line no-return-await
      .action(async (version) => await buildPackage(debuglog, {
        packageName,
        version,
        outputDirectory: (command.opts()).outputDirectory ?? process.cwd(),
      }));
  }

  return command;
};
