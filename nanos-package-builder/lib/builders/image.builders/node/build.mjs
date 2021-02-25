/* eslint-disable node/no-missing-import, import/no-unresolved */

import {
  inspect,
} from 'util';
import {
  rmdir,
} from 'fs/promises';
import chalk from 'chalk';
import {
  log,
} from '../../../helpers/log.mjs';
import {
  debuglog,
} from '../../../helpers/debuglog.mjs';
import {
  initialContext,
  builder,
} from './workflows/main.mjs';
import {
  tools,
} from '../../helpers/tools.mjs';
import {
  mkdtemp,
} from '../../helpers/mkdtemp.mjs';
import {
  isDockerIsRunning,
} from '../../helpers/isDockerIsRunning.mjs';
import {
  buildService,
} from './services/buildService.mjs';
import {
  installService,
} from './services/installService.mjs';

const context = async (packageName = null, imageName = null, projectDirectory = null, outputDirectory = null) => ({
  ...initialContext,
  ...{
    packageName,
    imageName,
    tools: (await tools()),
    paths: {
      tmp: (await mkdtemp()),
      inp: projectDirectory,
      out: outputDirectory ?? process.cwd(),
    },
  },
});
const config = {
  actions: {
    logCtx: (ctx) => {
      log(chalk`{cyan ctx}:`, inspect(ctx, {
        depth: null,
        compact: false,
      }));
    },
  },
  activities: {},
  delays: {},
  guards: {
    isAllRequiredToolsPresent: (ctx) => {
      for (const toolPath of Object.values(ctx.tools)) {
        if (toolPath === null) {
          return false;
        }
      }

      return true;
    },
    isInstallationRequested: (ctx) => ctx.install,
  },
  services: {
    isDockerIsRunning,
    buildService,
    installService,
  },
};

export const build = async (packageName = null, imageName = null, projectDirectory = null, outputDirectory = null) => {
  log(`[node] build ${packageName}, ${imageName} ${projectDirectory} ${outputDirectory}`);
  log({ initialContext });

  const ctx = await context(packageName, imageName, projectDirectory, outputDirectory);

  const doBuild = () => new Promise((succeed) => {
    builder(ctx, config)
      .onDone(({
        data = null,
      }) => {
        debuglog(data);

        switch (data.type) {
          case 'success': {
            for (const [k, v] of Object.entries(data.payload)) {
              const key = k.replaceAll('_', ' ');

              log(chalk`{magenta ${key}}:\t{green ${v}}`);
            }

            break;
          }
          case 'error': {
            for (const errorItem of data.payload) {
              log(chalk`{red ${errorItem.message}}`);
            }

            break;
          }
          default: {
            log(chalk`{magenta unexpected result type}:\n{red ${data.type}}`, data);
          }
        }

        succeed();
      })
      .onStop(async () => {
        await rmdir(ctx.paths.tmp, {
          recursive: true,
        });
        // ctx.paths.tmp
        log(chalk`{grey done}`);
      })
      .start();
  });

  // eslint-disable-next-line no-return-await
  return await doBuild();
};
