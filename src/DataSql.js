var mysqlx = require('@mysql/xdevapi');

module.exports = class sqlCrud {
  constructor(props) {
    this.user = props.user;
    this.password = props.password;
    this.host = props.host;
    this.port = props.port;
    this.dbName = props.dbName;
    this.collectionName = props.collectionName;
    this.mineBlocks = this.mineBlocks.bind(this);
    this.establishConnection = this.establishConnection.bind(this);
    this.validateChain = this.validateChain.bind(this);
    this.getBlocks = this.getBlocks.bind(this);
  }

  establishConnection() {
    // Connect to server
    return mysqlx
      .getSession({
        user: this.user,
        password: this.password,
        host: this.host,
        port: this.port,
      })
      .then((session) => {
        this.session = session;
        this.session.sql(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`).execute();
        this.schema = this.session.getSchema(this.dbName);
        this.schema.dropCollection(this.collectionName); // TODO: to be removed
        this.schema.createCollection(this.collectionName, {
          reuseExisting: true,
          validation: {
            level: "strict",
            schema:   {
              "id": "http://json-schema.org/geo",
              "$schema": "http://json-schema.org/draft-06/schema#",
              "description": "A geographical coordinate",
              "type": "object",
              "properties": {
                "nonce": {
                  "type": "number"
                },
                "index": {
                  "type": "number"
                },
                "timeStamp": {
                  "type": "number"
                },
                "data": {
                  "type": "object"
                },
                "prevHash": {
                  "type": "string"
                },
                "hash": {
                  "type": "string"
                }
              },
              "required": ["index", "hash", "prevHash", "data"]
            }
          }
        });
        this.collection = this.schema.getCollection(this.collectionName);
        this.collection.createIndex("index", {fields:[{"field": "$.index", "type":"INT", required:true}]});
        console.log('Connection successfull :D');
      })
      .catch((err) => {
        console.log('Connection error', err);
      });
  }

  mineBlocks(blockJson) {
    return this.collection.add(blockJson).execute();
  }

  validateChain() {
    return this.collection.find();
  }

  getBlocks(constriants = null, limit = 0) {
    const statement = constriants != null ?'data.block like :constriants' : ''
    return this.collection
      .find(statement)
      .bind('constriants', JSON.stringify(constriants))
      .limit(limit)
      .execute()
      .fetchAll();
  }
}
