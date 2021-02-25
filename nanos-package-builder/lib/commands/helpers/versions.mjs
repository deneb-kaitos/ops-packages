import {
  Command,
} from 'commander/esm.mjs';
import chalk from 'chalk';
import {
  packages,
} from '../../helpers/getPackages.mjs';
import { getDownloadClient } from '../../helpers/getDownloadClient.mjs';
import { log } from '../../helpers/log.mjs';
import {
  debuglog,
} from '../../helpers/debuglog.mjs';

const VERSION_WIDTH = 10;
let command = null;
const client = getDownloadClient();

const versionDownloaders = {
  nodejs: async (info = null) => {
    const { body } = await client.get(info.versions.url, {
      responseType: 'json',
    });

    debuglog('versionDownloaders.nodejs:', body);

    return body.map((item) => item.version);
  },
};

const listPackageVersions = async (packageName) => {
  if (packageName in versionDownloaders) {
    const result = await (versionDownloaders[packageName])(packages[packageName]);
    const [cols] = process.stdout.getWindowSize();
    const step = Math.trunc(cols / VERSION_WIDTH);

    for (let i = 0; i < result.length; i += step) {
      const line = result.slice(i, i + step).map((version) => version.padStart(10, ' '));

      log(line.join(''));
    }
  } else {
    throw new ReferenceError(`no version downloader for the ${packageName}`);
  }
};

// ./cli.mjs pkg nodejs versions

// ./cli.mjs pkg nodejs build v15.10.0

export const versions = (packageName = null) => {
  if (command === null) {
    command = new Command('versions');
    command
      .description(chalk`list {green ${packageName}}\'s versions`)
      .action(async () => listPackageVersions(packageName));
  }

  return command;
};
