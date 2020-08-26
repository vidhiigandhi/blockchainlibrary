BlockChain Library
=========

A library that creates, mines, iterates blockchain using the provided database by the developer.

## Installation

  `npm install @vidhiigandhi/blockchainlibrary`

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
    blockChain.createGenesisBlock();
    blockChain.addBlock('this is my new block');
    blockChain.showBlocks({constriants: ['here', 16], limit: 2})
      .then((block) => {});
