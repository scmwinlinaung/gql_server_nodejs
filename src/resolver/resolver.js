const Account = require("../models/account");
var Web3 = require("web3");
const testnet = "wss://parity-ws.immin.io:443";
// const web3 = new Web3(Web3.givenProvider || testnet);
var Web3WsProvider = require('web3-providers-ws');
var options = {
    timeout: 30000,
    headers: { authorization: 'Basic ZXRoOm4wMGJtb29u' }
}; 
var ws = new Web3WsProvider(testnet, options);
const web3 = new Web3(ws);

const { PubSub, gql } = require("apollo-server-express");
const pubsub = new PubSub();

const resolvers = {
    Query: {
      accounts: async () => {
        return await Account.find({});
      },
      account: async (_, args) => {
        let result = await Account.find(
          {
            accountAddress: args.accountAddress
          },
          { _id: 0, __v: 0 }
        );
        return result[0];
      }
    },
    Mutation: {
      insertAccountAddress: async (_, args) => {
        let balance = await web3.eth.getBalance(args.accountAddress);
  
        let etherBalance = await web3.utils.fromWei(balance, "ether");
  
        let account = new Account({
          accountAddress: args.accountAddress,
          balance: etherBalance
        });
  
        let result = await Account.create(account);
  
        let allUpdatedAccounts = await Account.find({}, { _id: 0, __v: 0 });
  
        pubsub.publish("getUpdatedBalance", {
          publishedData: allUpdatedAccounts
        });
  
        return result;
      },
      addUpdatedBalance: async () => {
        let allAccounts = await Account.find({}, { balance: 0, __v: 0 });
  
        allAccounts.map(key => {
          updateAcc(key._id, key.accountAddress);
        });
  
        let allUpdatedAccounts = await Account.find({}, { _id: 0, __v: 0 });
  
        pubsub.publish("getUpdatedBalance", {
          publishedData: allUpdatedAccounts
        });
  
        return allUpdatedAccounts;
      }
    },
    Subscription: {
      getUpdatedBalance: {
        resolve: payload => {
          const { publishedData } = payload;
          return publishedData;
        },
        subscribe: () => pubsub.asyncIterator("getUpdatedBalance")
      }
    }
  };

setInterval(resolvers.Mutation.addUpdatedBalance, 10000);

const updateAcc = (id, accAddress) => {
  var MongoClient = require("mongodb").MongoClient;
  var url =  'mongodb://localhost:27018/Account';

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Account");

    web3.eth.getBalance(accAddress, (err, result) => {
      if (err) {
        console.log("Error = ", err);
      } else {
        console.log(web3.utils.fromWei(result, "ether") + " ETH");
        let balance = web3.utils.fromWei(result, "ether");
        var myquery = { _id: id };
        var newvalues = { $set: { balance: balance } };
        dbo
          .collection("accounts")
          .updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            db.close();
          });
      }
    });
  });
};

  module.exports = resolvers;