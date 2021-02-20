import {
  Command,
} from 'commander/esm.mjs';
import {
  init_debuglog,
  debuglog,
} from './helpers/debuglog.mjs';
import './constants/globals.mjs';
import {
  getVersion,
} from './helpers/getVersion.mjs';
import {
  getPackages,
} from './helpers/getPackages.mjs';
import {
  pkg,
} from './commands/pkg/pkg.mjs';
import {
  image,
} from './commands/image/image.mjs';

export class LibCLI {
  #debuglog = null;
  #program = null;

  constructor() {
    init_debuglog(this.constructor.name);

    this.#debuglog = debuglog;
    this.#program = new Command();
  }

  async start() {
    await getPackages();

    this.#program
      .version(await getVersion())
      .addCommand(pkg())
      .addCommand(image());
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
