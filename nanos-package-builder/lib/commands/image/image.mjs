import {
  Command,
} from 'commander/esm.mjs';
import {
  debuglog,
} from '../../helpers/debuglog.mjs';

let command = null;

export const image = () => {
  debuglog('image command');

  if (command === null) {
    command = new Command('image');
    command
      .description('manage images');
    // .addCommand(list(debuglog));
  }

  return command;
};
