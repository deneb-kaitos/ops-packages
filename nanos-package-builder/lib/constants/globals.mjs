const ID = Symbol.for('NANOS_PACKAGE_BUILDER');
const globalStore = globalThis[ID];

export const globals = Object.freeze({
  ID,
  globalStore,
});
