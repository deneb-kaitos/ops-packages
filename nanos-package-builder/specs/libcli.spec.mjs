import util from 'util';
import mocha from 'mocha';
import chai from 'chai';
import which from 'which';
import {
  LibCLI,
} from '../lib/libcli.mjs';

const debuglog = util.debuglog('npbuild:specs');
const {
  describe,
  before,
  beforeEach,
  afterEach,
  after,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('npbuild', () => {
  let ARG_0 = null;
  let ARG_1 = null;
  let libCLI = null;

  before(async () => {
    ARG_0 = await which('node');
    [, ARG_1] = process.argv;
  });

  beforeEach(async () => {
    process.argv = [ARG_0, ARG_1];

    libCLI = new LibCLI();
    // eslint-disable-next-line no-return-await
    return await libCLI.start();
  });

  afterEach(() => {
    process.argv = [ARG_0, ARG_1];
  });

  // eslint-disable-next-line no-return-await
  after(async () => await libCLI.stop());

  it('build nodejs v15.9.0', async () => {
    process.argv.push(...['pkg', 'nodejs', 'build', 'v15.9.0']);

    await libCLI.exec();

    expect(true).to.be.true;
  });
});
