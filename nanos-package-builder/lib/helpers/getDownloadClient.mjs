import got from 'got';

let client = null;

export const getDownloadClient = () => {
  if (client === null) {
    client = got.extend();
  }

  return client;
};
