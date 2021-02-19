import {
  resolve,
} from 'path';
import {
  Machine,
  interpret,
  assign,
} from 'xstate';

export const initialContext = {
  result: {
    success: {
      output_path: resolve('releases/nodejs/node_v15.8.0.tar.gz'),
    },
    error: {
      items: [
        new Error('not implemented yet'),
      ],
    },
  },
};

const machine = Machine({
  id: 'nodejs-builder',
  initial: 'initial',
  context: initialContext,
  states: {
    initial: {
      entry: ['logCtx'],
      always: [
        {
          target: 'checkDockerIsRunning',
        },
      ],
    },
    checkDockerIsRunning: {
      invoke: {
        id: 'isDockerIsRunning',
        src: 'isDockerIsRunning',
        onDone: {
          target: 'buildSucceeded',
        },
        onError: {
          target: 'buildFailed',
          actions: assign((context, event) => ({
            result: {
              error: {
                items: [event.data],
              },
            },
          })),
        },
      },
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

export const builder = (context = null, config = null) => interpret(machine.withConfig(config).withContext(context));
