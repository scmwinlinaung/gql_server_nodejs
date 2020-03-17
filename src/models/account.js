const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    accountAddress: String,
    balance: Number
});

module.exports = mongoose.model('Account', accountSchema);