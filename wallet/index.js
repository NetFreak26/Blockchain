const { STARTING_BALANCE } = require('../config');
const cryptoHash = require('../util/crypto-hash');
const { ec } = require('../util/elliptic-utils');
const Transaction = require('./transaction');

class Wallet {

    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipientList, amountList }) {

        return new Transaction({senderWallet: this, recipientList, amountList });
    }

    transactionsList(chain) {
        let transactions = {
            sent: [],
            received: []
        };

        for (let i=chain.length-1; i>0; i--) {
            const block = chain[i];

            for (let transaction of block.data) {

                if(transaction.inputMap.address === this.publicKey) {
                    transactions.sent.push(transaction);
                } else if(transaction.outputMap[this.publicKey]) {
                    transactions.received.push(transaction);
                }
            }
        }
        return transactions;
    }
}

module.exports = Wallet;