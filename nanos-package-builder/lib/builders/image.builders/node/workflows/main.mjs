import {
  Machine,
  interpret,
  // assign,
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

const machine = Machine({});

export const builder = (context = null, config = null) => interpret(machine.withConfig(config).withContext(context));
