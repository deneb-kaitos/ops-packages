/* eslint-disable import/no-unresolved, node/no-missing-import */

import execa from 'execa';
import {
  resolve,
} from 'path';
import {
  writeFile,
  rm,
} from 'fs/promises';

const files = Object.freeze({
  packageManifest: resolve(process.cwd(), './package.manifest'),
  // dockerFile: (new URL('./configs/nodejs/docker/build.Dockerfile', import.meta.url)).pathname,
  dockerFile: (new URL('../../../../../configs/nodejs/docker/build-package.Dockerfile', import.meta.url)).pathname,
});

const generatePackageManifestFile = async (version = null) => {
  const contents = {
    Program: `node_v${version}/node`,
    Args: ['node'],
    Version: `${version}`,
  };
  const data = new Uint8Array(Buffer.from(JSON.stringify(contents, null, 2)));

  // eslint-disable-next-line no-return-await
  return await writeFile(files.packageManifest, data);
};

const resolveContainerId = async (docker = null, version = null) => {
  const {
    stdout,
  } = await execa(docker, ['run', '--detach', `nodejs:${version}`]);

  return stdout;
};

const extractResultFromDockerContainer = async (
  docker = null,
  containerId = null,
  version = null,
  exportPath = null,
// eslint-disable-next-line no-return-await
) => await execa(docker, ['cp', `${containerId}:/home/builder/node_v${version}.tar.gz`, exportPath]);

const removeBuildContainer = async (docker = null, containerId = null) => {
  // docker stop $CONTAINER_ID
  // docker rm $CONTAINER_ID

  await execa(docker, ['stop', containerId]);
  await execa(docker, ['rm', containerId]);
};

export const buildService = async (context) => {
  await generatePackageManifestFile(context.version);

  const subprocess = execa(context.tools.docker, [
    'build',
    '--build-arg',
    `node_version=${context.version}`,
    '--tag',
    `nodejs:${context.version}`,
    '--file',
    files.dockerFile,
    process.cwd(),
  ], {
    all: true,
  });

  subprocess.all.pipe(process.stdout);

  try {
    await subprocess;
  } catch (subprocessError) {
    return subprocessError;
  }

  await rm(files.packageManifest, {
    force: true,
    recursive: false,
  });

  const containerId = await resolveContainerId(context.tools.docker, context.version);

  await extractResultFromDockerContainer(context.tools.docker, containerId, context.version, context.paths.out);
  await removeBuildContainer(context.tools.docker, containerId);

  return `${context.paths.out}/node_v${context.version}.tar.gz`;
};
