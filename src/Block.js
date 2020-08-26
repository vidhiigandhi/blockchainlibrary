const crypto = require('crypto');

module.exports = class Block {
  constructor(props) {
    this.index = props.index;
    this.timeStamp = props.timeStamp;
    this.data = props.data;
    this.prevHash = props.prevHash;
    this.hash = this.generateHash();
    this.nonce = 0;
  }

  generateHash() {
    const hash = crypto.createHash('sha256').update(this.nonce + this.index + this.timeStamp + this.data + this.prevHash).digest('base64');
    return hash;
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.generateHash();
    }
  }
}
