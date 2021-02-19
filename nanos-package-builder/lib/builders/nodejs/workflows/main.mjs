import {
  resolve,
} from 'path';
import {
  Machine,
  interpret,
} from 'xstate';

const machine = Machine({
  id: 'nodejs-builder',
  initial: 'initial',
  context: {
    result: {
      success: {
        output_path: resolve('releases/nodejs/node_v15.8.0.tar.gz'),
      },
      error: {
        items: [
          new Error('build failed'),
        ],
      },
    },
  },
  states: {
    initial: {
      always: [
        {
          target: 'buildFailed',
        },
      ],
    },
    buildSucceeded: {
      type: 'final',
      data: (context) => ({
        type: 'success',
        payload: context.result.success,
      }),
    },
    buildFailed: {
      type: 'final',
      data: (context) => ({
        type: 'error',
        payload: context.result.error.items,
      }),
    },
  },
});

export const builder = (config = null) => interpret(machine.withConfig(config));
