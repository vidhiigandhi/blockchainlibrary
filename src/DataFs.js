const fs = require('fs');
const readline = require('readline');

module.exports = class fsCrud {
  constructor(props) {
    this.chainArr = [];
    this.dbName = props.dbName;
    this.collectionName = props.collectionName;
    this.mineBlocks = this.mineBlocks.bind(this);
    this.establishConnection = this.establishConnection.bind(this);
    this.validateChain = this.validateChain.bind(this);
    this.getBlocks = this.getBlocks.bind(this);
  }

  establishConnection(callback) {
    return new Promise((resolve, reject) => {
      try {
        // Connect to server
        fs.appendFileSync(this.dbName, '');
        fs.chmodSync(this.dbName, 0o744);
        resolve();
      } catch(err) {
        reject(err);
      }
    });
  }

  mineBlocks(blockJson) {
    try {
      fs.appendFileSync(this.dbName, `${JSON.stringify(blockJson)}\n`);
    } catch(err) {
      console.log(err);
    }
  }

  validateChain() {
    return new Promise((resolve, reject) => {
      try {
        const result = [];
        const fileOpenStream = readline.createInterface({
          input: fs.createReadStream(this.dbName)
        });
        // Line by line saving the chainArr as array of objects.
        fileOpenStream.on('line', (line) => {
          result.push(JSON.parse(line));
        }).on('close', () => {
          // Resolving the promise when reaches EOF.
          this.chainArr = result;
          resolve(result);
        });
      } catch(err) {
        reject(err);
      }
    });
  }

  getBlocks(constriants, limit) {
    return new Promise((resolve, reject) => {
      try {
        if (this.chainArr.length <= 0) {
          this.validateChain()
            .then((blockData) => {
              this.chainArr = blockData;
              this.result = this._loopChain(
                constriants == null ? constriants : JSON.stringify(constriants), limit);
              resolve(this.result);
            });
        } else {
          this._loopChain(JSON.stringify(constriants), limit);
          resolve(this.result);
        }
      } catch(err) {
        reject(err);
      }
    });
  }

  _loopChain(constriants, limit) {
    let result = [];
    if (limit > this.chainArr.length || limit == null)
      limit = this.chainArr.length;
    for (let i = 0; i < this.chainArr.length; i += 1) {
      if (constriants != null && Array.isArray(constriants)) {
        for(let j = 0; j < constriants.length; j += 1) {
          result = this._findData(this.chainArr[i].data, constriants[j]);
        }
      } else if (constriants != null) {
        result = this._findData(this.chainArr[i].data, constriants);
      } else if (limit > i) {
        result.push(this.chainArr[i].data);
      } else {
        break;
      }
    }
    return result;
  }

  _findData(element, obj) {
    if(Array.isArray(element.block))
      return (element.block.find((blockData) => blockData == obj));
    else if(typeof element.block === 'object')
      return (element.block[obj]);
    else if(element.block == obj)
      return (element.block);
  }
}
