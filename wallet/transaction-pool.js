const Transaction = require("./transaction");

class TransactionPool {

    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    setTransactionMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    getValidTransactions() {
        return Object.values(this.transactionMap).filter(transaction => Transaction.validateTransaction(transaction));
    }

    clearAll() {
        this.transactionMap = {};
    }

    clearTransactions(transactions) {
        for(let transaction of transactions) {
            if(this.transactionMap[transaction.id]) {
                delete this.transactionMap[transaction.id];
            }
        }
    }

    clearBlockchainTransactions(chain) {
        for(let block of chain) {
            this.clearTransactions(block.data);
        }
    }
}

module.exports = TransactionPool;