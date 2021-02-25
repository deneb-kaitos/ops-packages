import {
  Command,
} from 'commander/esm.mjs';
import {
  debuglog,
} from '../../helpers/debuglog.mjs';
import {
  create,
} from './create/create.mjs';

let command = null;

export const image = () => {
  debuglog('image command');

  if (command === null) {
    command = new Command('image');
    command
      .description('manage images')
      .addCommand(create());
  }

  return command;
};