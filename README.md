BlockChain Library
=========

A library that creates, mines, iterates blockchain using the provided database by the developer.

## Installation

  `npm install @vidhiigandhi/blockchainLib`

## Usage

    var Blockchain = require('@vidhiigandhi/blockchainLib');

    const blockChain = new Blockchain();

    blockChain.requirementsObj = {
      storageTypeInt: 0,
      storageCredentialObj: {
        user: 'root',
        password: 'xyz',
        host: 'localhost',
        port: '33060',
        dbName: 'blockchain',
        collectionName: 'blocks'
      }
    };
    blockChain.createGenesisBlock(); // TODO: If to be given to call or added in constructor for static mine
    blockChain.addBlock('this is my new block');
    blockChain.showBlocks({constriants: ['here', 16], limit: 2})
      .then((block) => {
        console.log(block, 'hi');
      });


## Tests

  `npm test`
