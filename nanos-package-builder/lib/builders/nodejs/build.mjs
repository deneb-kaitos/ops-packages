import chalk from 'chalk';
import {
  builder,
} from './workflows/main.mjs';
import {
  log,
} from '../../helpers/log.mjs';

const config = {
  actions: {},
  activities: {},
  delays: {},
  guards: {},
  services: {},
};

export const build = async (version = null, debuglog = null) => {
  log(chalk`{grey building nodejs ${version}}`);

  const doBuild = () => new Promise((succeed) => {
    builder(config)
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
              debuglog(errorItem.message);
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
      .onStop(() => {
        log(chalk`{grey done}`);
      })
      .start();
  });

  // eslint-disable-next-line no-return-await
  return await doBuild();
};
