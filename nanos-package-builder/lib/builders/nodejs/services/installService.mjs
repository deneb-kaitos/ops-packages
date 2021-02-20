/* eslint-disable import/no-unresolved, node/no-missing-import */

import chalk from 'chalk';
import which from 'which';
import {
  resolve,
  dirname,
  join,
} from 'path';
import {
  createGunzip,
} from 'zlib';
import {
  createReadStream,
  createWriteStream,
} from 'fs';
import {
  mkdir,
  rm,
} from 'fs/promises';
import tar from 'tar-stream';
import {
  log,
} from '../../../helpers/log.mjs';

/*

gsutil cp gs://packagehub/manifest.json ./packages

SHASUM=`IFS=" " read sum filename <<< $(shasum -a 256 $EXPORT_PATH/node_v$NODE_VERSION.tar.gz); echo $sum`

cp ./packages/nodejs/files/manifest.contents.template ./packages/nodejs/files/node_v$NODE_VERSION.manifest.definition
sed -i "s/%NODE_VERSION/$NODE_VERSION/g" ./packages/nodejs/files/node_v$NODE_VERSION.manifest.definition
sed -i "s/%SHA256/$SHASUM/g" ./packages/nodejs/files/node_v$NODE_VERSION.manifest.definition

cp $HOME/.ops/packages/manifest.json $HOME/.ops/local_packages/manifest.json

rm -rf $HOME/.ops/local_packages/node_v$NODE_VERSION

$NODE ./helpers/update-manifest.mjs \
  --manifest=$HOME/.ops/local_packages/manifest.json \
  --definition=./packages/nodejs/files/node_v$NODE_VERSION.manifest.definition

rm -f ./packages/nodejs/files/node_v$NODE_VERSION.manifest.definition

# gsutil cp ./packages/nodejs/archive/node_v$NODE_VERSION.tar.gz gs://packagehub/node_v$NODE_VERSION.tar.gz
# gsutil -D setacl public-read gs://packagehub/node_v$NODE_VERSION.tar.gz
# gsutil -D setacl public-read gs://packagehub/manifest.json

tar -xzf $EXPORT_PATH/node_v$NODE_VERSION.tar.gz -C $HOME/.ops/local_packages

*/

const ugzip = (archivePath = null, outputDirectory) => new Promise((ok) => {
  const readStreamOpts = {};
  const writeStreamOpts = {};
  const zlibOpts = {};
  const outputFileName = join(outputDirectory, 'output.tar');
  const readStream = createReadStream(archivePath, readStreamOpts);
  const writeStream = createWriteStream(outputFileName, writeStreamOpts);
  const decompress = createGunzip(zlibOpts);

  readStream.on('end', () => {
    ok(outputFileName);
  });

  decompress.pipe(writeStream);
  readStream.pipe(decompress);
});

const utar = (tarFilePath = null) => new Promise((ok) => {
  const readStreamOpts = {};
  const readStream = createReadStream(tarFilePath, readStreamOpts);
  const extract = tar.extract();
  const outputDir = dirname(tarFilePath);
  const writeStreamOpts = {};

  extract.on('entry', async (header, stream, next) => {
    const fileName = join(outputDir, header.name);

    switch (header.type) {
      case 'directory': {
        await mkdir(fileName, { recursive: true });

        break;
      }
      case 'file': {
        log(chalk`{cyan extracted} {green ${fileName}}`);

        const outStream = createWriteStream(fileName, writeStreamOpts);

        stream.pipe(outStream);

        break;
      }
      default: {
        log(chalk`{red unhandled type}`, header);

        break;
      }
    }

    stream.on('end', () => {
      next();
    });

    stream.resume();
  });

  extract.on('finish', () => {
    ok(outputDir);
  });

  readStream.pipe(extract);
});

export const installService = async (context = null) => {
  const opsLocalPackagesDir = join(dirname(resolve(await which('ops'), '../')), './local_packages');
  const archivePath = context.result.success.package;

  log(`${archivePath} => ${opsLocalPackagesDir}`);

  const tarFileName = await ugzip(archivePath, opsLocalPackagesDir);

  const installationDir = await utar(tarFileName);

  await rm(tarFileName, {
    force: true,
  });

  return installationDir;
};
