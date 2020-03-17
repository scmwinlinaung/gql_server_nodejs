const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Account {
    id: ID!
    accountAddress: String
    balance: Float
  }

  type Query {
    account(accountAddress: String!): Account
    accounts: [Account!]!
  }

  type Mutation {
    insertAccountAddress(accountAddress: String!): Account
    addUpdatedBalance: [Account]
  }

  type Subscription {
    getUpdatedBalance: [Account]
  }
`;

module.exports = typeDefs;