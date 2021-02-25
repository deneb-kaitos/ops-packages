import {
  createServer,
} from 'http';

const PORT = 3000;

const requestListener = (req, res) => {
  res.writeHead(200);
  res.end('hi');
};

const server = createServer(requestListener);

// eslint-disable-next-line no-console
console.log(`listening on port ${PORT}`);

server.listen(PORT);
