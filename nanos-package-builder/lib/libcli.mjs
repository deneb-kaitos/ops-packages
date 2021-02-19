import util from 'util';
import './constants/globals.mjs';
import {
  Command,
} from 'commander/esm.mjs';
import {
  getVersion,
} from './helpers/getVersion.mjs';
import {
  getPackages,
} from './helpers/getPackages.mjs';
import {
  pkg,
} from './commands/pkg/pkg.mjs';

export class LibCLI {
  #debuglog = null;
  #program = null;

  constructor() {
    this.#debuglog = util.debuglog(this.constructor.name);
    this.#program = new Command();
  }

  async start() {
    await getPackages(this.#debuglog);

    this.#program
      .version(await getVersion(this.#debuglog))
      .addCommand(pkg(this.#debuglog));
  }

  async stop() {
    this.#program = null;
    this.debuglog = null;
  }

  async exec() {
    // eslint-disable-next-line no-return-await
    return await this.#program.parseAsync();
  }
}
