import {
  Machine,
  interpret,
  assign,
} from 'xstate';

export const initialContext = {
  result: {
    success: {
      package: null,
    },
    error: {
      items: [],
    },
  },
};

const machine = Machine({
  id: 'nodejs-builder',
  initial: 'initial',
  context: initialContext,
  states: {
    initial: {
      always: [
        {
          target: 'checkDockerIsRunning',
          cond: 'isAllRequiredToolsPresent',
        },
        {
          target: 'enumerateMissingTools',
        },
      ],
    },
    enumerateMissingTools: {
      entry: assign((context) => {
        const errors = [];

        for (const [toolName, toolPath] of Object.entries(context.tools)) {
          if (toolPath === null) {
            errors.push(new ReferenceError(`required tool is missing: ${toolName}`));
          }
        }

        return {
          result: {
            error: {
              items: errors.slice(),
            },
          },
        };
      }),
      always: [
        {
          target: 'buildFailed',
        },
      ],
    },
    checkDockerIsRunning: {
      invoke: {
        id: 'isDockerIsRunning',
        src: 'isDockerIsRunning',
        onDone: {
          target: 'build',
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
    build: {
      invoke: {
        id: 'buildService',
        src: 'buildService',
        onDone: {
          target: 'checkInstallationRequested',
          actions: [
            assign((context, event) => ({
              result: {
                success: {
                  package: event.data,
                },
              },
            })),
          ],
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
    checkInstallationRequested: {
      always: [
        {
          target: 'install',
          cond: 'isInstallationRequested',
        },
        {
          target: 'buildSucceeded',
        },
      ],
    },
    install: {
      invoke: {
        id: 'install',
        src: 'installService',
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
