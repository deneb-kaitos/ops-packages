import execa from 'execa';

export const isDockerIsRunning = async () => {
  const {
    stdout,
  } = await execa('docker', ['info', '--format', '{{json .}}']);

  if (Object.keys(JSON.parse(stdout)).includes('ID') === true) {
    return true;
  }

  throw new Error('docker is not running');
};
