'use strict';
var express = require('express'),
http = require('http'),
blockChain = require('./src/BlockChain');

const hostname = 'localhost';
const port = 8080;
const app = express();

app.use((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is a test server</h1></body></html>');
});
const sample_server = http.createServer(app);

sample_server.listen(port, hostname, () => {
  const bc = new blockChain();
  bc.requirementsObj = {
    storageTypeInt: 0,
    storageCredentialObj: {
      user: 'root',
      password: 'Bluewhite@08',
      host: 'localhost',
      port: '33060',
      dbName: 'blockchain',
      collectionName: 'blocks'
    }
  };
  bc.createGenesisBlock(); // TODO: If to be given to call or added in constructor for static mine
  bc.addBlock('this is my new block');
  bc.addBlock('this is my second block');
  bc.addBlock(['here', 16]);
  bc.addBlock('this is my fourth block');
  bc.showBlocks({constriants: ['here', 16], limit: 2})
    .then((block) => {
      console.log(block, 'hi');
    });
});
