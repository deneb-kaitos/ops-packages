/* eslint-disable import/no-unresolved, node/no-missing-import */

import {
  Command,
} from 'commander/esm.mjs';
import which from 'which';
import chalk from 'chalk';
import {
  join,
  dirname,
  resolve,
} from 'path';
import {
  readFile,
} from 'fs/promises';
import {
  debuglog,
} from '../../../helpers/debuglog.mjs';
import {
  log,
} from '../../../helpers/log.mjs';

let command = null;

const resolveImageConstructorTypeByPackageName = async (packageName = null) => {
  const readFileOpts = {};
  const opsLocalPackagesDir = join(dirname(resolve(await which('ops'), '../')), './local_packages');
  const packageManifestPath = resolve(join(opsLocalPackagesDir, packageName, 'package.manifest'));

  const packageManifest = JSON.parse(Buffer.from(await readFile(packageManifestPath, readFileOpts)).toString());
  const executableName = packageManifest.Args[0];

  return executableName;
};

const createImage = async (packageName = null, imageName = null, projectDirectory = null, outputDirectory = null) => {
  log(
    chalk`{yellow createImage} {magenta ${packageName}} with name {cyan ${imageName}}
    from {yellow ${projectDirectory}}
    and export to {green ${outputDirectory}}`,
  );

  const imageConstructorType = await resolveImageConstructorTypeByPackageName(packageName);

  const {
    build,
  } = (await import(`../../../builders/image.builders/${imageConstructorType}/build.mjs`));

  // eslint-disable-next-line no-return-await
  return await build(packageName, imageName, projectDirectory, outputDirectory);
};

/**
 * ./cli.mjs image create --package-name=node_v15.10.0 --image-name=kaufmann-web --project-directory=./tests/node/front-end --output-directory=~/.ops/images
 */
export const create = () => {
  log('. -> create');

  if (command === null) {
    command = new Command('create');
    command
      .description('create an image')
      .option('-p, --package-name <package-name>', 'package to use (e.g.: node_v15.10.0)')
      .option('-n, --image-name <image-name>', 'name of the image (e.g.: kaufmann-web)')
      .option('-s, --project-directory <project-directory>', 'path to the project directory')
      .option('-o, --output-directory <output-directory>', 'where to place the resulting image file')
      // eslint-disable-next-line no-return-await
      .action(async () => await createImage(
        command.opts().packageName,
        command.opts().imageName,
        resolve(command.opts().projectDirectory),
        resolve(command.opts().outputDirectory),
      ));
  }

  return command;
};
