
const express = require('express');
const { typeDefs, resolvers} = require('./src/schema/schema');
const app = express();
const mongoose = require('mongoose');
const createServer = require('http').createServer;
const { ApolloServer, gql } = require('apollo-server-express');

mongoose.connect('mongodb://localhost:27018/Account')

mongoose.connection.once('open', () => {
    console.log('conneted to database');
});

const server = new ApolloServer({ 
  typeDefs,
  resolvers
 });
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

server.applyMiddleware({ app });

httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);



