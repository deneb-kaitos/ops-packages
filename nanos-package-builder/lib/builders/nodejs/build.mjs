/* eslint-disable node/no-missing-import, import/no-unresolved */

import {
  inspect,
} from 'util';
import {
  resolve,
} from 'path';
import chalk from 'chalk';
import {
  rmdir,
} from 'fs/promises';
import {
  mkdtemp,
} from '../helpers/mkdtemp.mjs';
import {
  initialContext,
  builder,
} from './workflows/main.mjs';
import {
  log,
} from '../../helpers/log.mjs';
import {
  isDockerIsRunning,
} from '../helpers/isDockerIsRunning.mjs';
import {
  buildService,
} from './services/buildService.mjs';
import {
  tools,
} from '../helpers/tools.mjs';

// eslint-disable-next-line no-unused-vars
const context = async (version = null, debuglog = null) => ({
  ...initialContext,
  ...{
    version,
    tools: (await tools(debuglog)),
    paths: {
      tmp: (await mkdtemp()),
      out: process.cwd(),
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
  },
  services: {
    isDockerIsRunning,
    buildService,
  },
};

export const build = async (version = null, debuglog = null) => {
  const normalizedVersion = version.slice(1);
  const ctx = await context(normalizedVersion, debuglog);

  log(chalk`{grey building nodejs ${version}}`);

  const doBuild = () => new Promise((succeed) => {
    builder(ctx, config)
      .onDone(({ data = null }) => {
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
