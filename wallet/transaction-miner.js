class TransactionMiner {

    constructor({ blockchain, transactionPool, pubsub}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        const validTransactions = this.transactionPool.getValidTransactions();

        this.blockchain.addBlock({data: validTransactions});

        this.pubsub.broadcastChain();

        this.transactionPool.clearTransactions(this.validTransactions);
    }
}

module.exports = TransactionMiner;