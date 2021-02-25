import util from 'util';

let debuglogDomain = null;
let debuglog = () => {
  throw new Error('debuglog is not initialized w/ domain');
};

const init_debuglog = (domain = null) => {
  if (debuglogDomain !== null) {
    return;
  }

  if (domain === null) {
    throw new ReferenceError('domain is undefined');
  }

  debuglogDomain = domain;
  debuglog = util.debuglog(debuglogDomain);
};

export {
  init_debuglog,
  debuglog,
};
