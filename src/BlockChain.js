const crypto = require('crypto');
const Block = require('./Block');
const DataSql = require('./DataSql');
const DataFs = require('./DataFs');
const DataMongo = require('./DataMongo');

const storageTypeArr = [
  {db: 'commitBlockTemp', validate: 'validateChainTemp', show: 'getBlocksTemp'},
  {db: 'commitBlockSql', validate: 'validateChainSql', show: 'getBlocksSql'},
  {db: 'commitBlockMongo', validate: 'validateChainMongo', show: 'getBlocksMongo'},
  {db: 'commitBlockFs', validate: 'validateChainFs', show: 'getBlocksFs'}
];

module.exports = class BlockChain {
  constructor() {
    this.chainArr = [];
    this._requirementsObj = {
      difficultyInt: 2,
      storageTypeInt: 0
    };
    this.genisisBlockData = { block: 'genesisBock' };
    this.addBlock = this.addBlock.bind(this);
    this.getLastestBlock = this.getLastestBlock.bind(this);
    this.genesisTimeStamp = Date.now();
    this.createGenesisBlock = this.createGenesisBlock.bind(this);
    this.showBlocks = this.showBlocks.bind(this);
    this._getGeneratedIds = [];
  }

  get GeneratedIds() {
    this._getGeneratedIds;
  }

  set GeneratedIds(value) {
    this._getGeneratedIds.push(value);
  }

  commitBlockSql(block) {
    this.connectionSql.then(() => {
      this.dataSql.mineBlocks(block)
        .then((mined) => {
          mined.getGeneratedIds().forEach((obj) => {
            this.GeneratedIds = obj;
          })
        });
    });
  }

  commitBlockFs(block) {
    this.connectionFs.then(() => {
      this.dataFs.mineBlocks(block);
    });
  }

  commitBlockTemp(block) {
    this.chainArr.push(block);
  }

  getBlocksSql(constriants, limit) {
    return this.dataSql.getBlocks(constriants, limit);
  }

  getBlocksTemp(constriants, limit) {
    return new Promise((resolve, reject) => {
        let result = [];
        if (limit > this.chainArr.length || limit == null)
          limit = this.chainArr.length;
        for(let i = 0; i < this.chainArr.length; i++) {
          if(Array.isArray(this.chainArr[i].data.block)) {
            result = this.chainArr[i].data.block.find((blockData) => blockData == JSON.stringify(constriants));
            break;
          } else if(typeof this.chainArr[i].data.block === 'object') {
            result = this.chainArr[i].data.block[JSON.stringify(constriants)];
            break;
          } else if(this.chainArr[i].data.block == JSON.stringify(constriants)) {
            result = this.chainArr[i].data.block;
            break;
          } else if(limit > i) {
            result.push(this.chainArr[i].data);
          }
        }
       resolve(result);
    });
  }

  getBlocksFs(constriants, limit) {
    return this.dataFs.getBlocks(constriants, limit);
  }

  showBlocks({constriants, limit} = {constriants: null, limit: null}) {
    const promiseBlock = this.validityPromise ? this.validityPromise.then(() => {
      return eval(`this.${storageTypeArr[this.requirementsObj.storageTypeInt].show}(constriants, limit)`);
    }) : eval(`this.${storageTypeArr[this.requirementsObj.storageTypeInt].show}(constriants, limit)`);
    return promiseBlock;
  }

  addBlock(data) {
    this.validityPromise = eval(`this.${storageTypeArr[this.requirementsObj.storageTypeInt].validate}()`)
      .then((isValidBool) => {
        if (isValidBool == true) {
          const newBlock = new Block({index: this.index, timeStamp: this.timeStamp, data: { block: JSON.stringify(data) }, prevHash: this.prevHash});
          newBlock.mineBlock(this.requirementsObj.difficultyInt);
          const block = {nonce: newBlock.nonce, index: newBlock.index, timeStamp: newBlock.timeStamp, data: newBlock.data, prevHash: newBlock.prevHash, hash: newBlock.hash};
          eval(`this.${storageTypeArr[this.requirementsObj.storageTypeInt].db}(block)`);
        }
      })
      .catch((err) => {
          console.log(err, 'Block Not Mined --> Tampered');
      });
  }

  _validateStorage(valueInt) {
    const _isValid = storageTypeArr[valueInt];
    if (!_isValid)
      console.error('Invalid storage type given :/ Temporary one selected');
    return _isValid;
  }

  _validateAndEstablishConnectionSQL(credentialObj) {
    this.dataSql = new DataSql(credentialObj);
    this.connectionSql = this.dataSql.establishConnection();
  }

  _validateAndEstablishConnectionMongo(credentialObj) {
    this.dataMongo = new DataMongo(credentialObj);
    this.connectionMongo = this.dataMongo.establishConnection();
  }

  _validateAndEstablishConnectionFs(credentialObj) {
    this.dataFs = new DataFs(credentialObj);
    this.connectionFs = this.dataFs.establishConnection();
  }

  get requirementsObj() {
    return this._requirementsObj;
  }

  set requirementsObj({ difficultyInt, storageTypeInt, storageCredentialObj } = null) {
    this._requirementsObj.difficultyInt = difficultyInt ? difficultyInt : 2;
    this._requirementsObj.storageTypeInt = this._validateStorage(storageTypeInt) ? storageTypeInt : 0;
    switch (this._requirementsObj.storageTypeInt) {
      case 1:
        if (storageCredentialObj !== null)
          this._validateAndEstablishConnectionSQL(storageCredentialObj);
        else {
          throw "storageCredentialObj needed for MySQL connection";
        }
        break;
      case 2:
        if (storageCredentialObj !== null)
          this._validateAndEstablishConnectionMongo(storageCredentialObj);
        else {
          throw "storageCredentialObj needed for MongoDB connection";
        }
        break;
      case 3:
        if (storageCredentialObj !== null)
          this._validateAndEstablishConnectionFs(storageCredentialObj);
        else {
          throw "storageCredentialObj needed for fileSystem connection";
        }
        break;
      default:
        break;
    }
  }

  get index(){
    return this.chainArr.length + 1;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
  }

  get timeStamp(){
    return Date.now();
  }

  get prevHash(){
    return this.getLastestBlock().hash;
  }

  getLastestBlock() {
    return this.chainArr[this.chainArr.length - 1];
  }

  createGenesisBlock() {
    eval(`this.${storageTypeArr[this.requirementsObj.storageTypeInt].db}(this.genesisBlock)`);
  }

  set genesisTimeStamp(timeStamp) {
    this._timeStamp = timeStamp;
  }

  get genesisTimeStamp() {
    return this._timeStamp;
  }

  get genesisBlock() {
    const hash = crypto.createHash('sha256').update(0 + this.genesisTimeStamp + this.genisisBlockData + '0').digest('base64');
    return { prevHash: '0', data: this.genisisBlockData, hash: hash, index: 0 }
  }

  validateChainSql() {
    // check for genesisBock
    return new Promise((resolve, reject) => {
      try {
        this.connectionSql
          .then(() => {
            const value = this.dataSql.validateChain()
              .execute((doc) => {
                this.chainArr = [doc];
                const checkForValidity = this.validateChainTemp()
                  .then((valid) => {
                    resolve(valid);
                  })
                  .catch((err) => {
                    reject(err);
                  });
              })
          })
      } catch (err) {
        reject(err);
      }
    })
  }

  validateChainFs() {
    return new Promise((resolve, reject) => {
      this.dataFs.validateChain()
        .then((data) => {
          this.chainArr = data;
          const checkForValidity = this.validateChainTemp()
            .then((valid) => {
              resolve(valid);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  validateChainTemp() {
    // check for genesisBock
    return new Promise((resolve, reject) => {
      if (this.chainArr[0].hasOwnProperty('_id'))
        delete this.chainArr[0]._id;
      Object.keys(this.chainArr[0]).forEach((obj) => {
        if (JSON.stringify(this.genesisBlock[obj]) !== JSON.stringify(this.chainArr[0][obj])) {
          reject(false);
          return;
        }
      });
      for (var i = 1; i < this.chainArr.length - 1; i++) {
        if (this.chainArr[i].prevHash !== this.chainArr[i - 1].hash)
          reject(false);

        if (this.chainArr[i].hash !== new Block(this.chainArr[i]).hash)
          reject(false);
      }
      resolve(true);
    });
  }
}
