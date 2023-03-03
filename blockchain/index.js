const { STARTING_BALANCE } = require("../config");
const cryptoHash = require("../util/crypto-hash");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");
const Block = require("./block");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            prevBlock: this.chain[this.chain.length-1],
            data
        })

        this.chain.push(newBlock);
    }

    currentBlock() {
        return this.chain[this.chain.length-1];
    }

    replaceChain(chain, onSuccess) {

        if(!(chain instanceof Array) || chain.length <= this.chain.length) {
            console.error("new chain is not longer than current one");
            return;
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error("new chain is not valid");
            return;
        }

        if(!this.validTransactionData(chain)) {
            console.error("Chain contains invalid transactions");
            return;
        }

        if(onSuccess){
            onSuccess();
        }
        this.chain = chain;
    }

    static calculateBalance(address, chain) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for (let i=chain.length-1; i>0; i--) {
            const block = chain[i];

            for (let transaction of block.data) {

                const addressOutput = transaction.outputMap[address];

                if (transaction.inputMap.address === address) {
                    hasConductedTransaction = true;
                    break;
                }

                if (addressOutput) {
                    outputsTotal = outputsTotal + addressOutput;
                }
            }

            if (hasConductedTransaction) {
                break;
            }
        }

        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }

    validTransactionData({ chain }) {
        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();

            for (let transaction of block.data) {
                if (!Transaction.validTransaction(transaction)) {
                    console.error('Invalid transaction');
                    return false;
                }
        
                const trueBalance = Wallet.calculateBalance({
                    chain: this.chain,
                    address: transaction.input.address
                });
        
                if (transaction.input.amount !== trueBalance) {
                    console.error('Invalid input amount');
                    return false;
                }
        
                if (transactionSet.has(transaction)) {
                    console.error('An identical transaction appears more than once in the block');
                    return false;
                } else {
                    transactionSet.add(transaction);
                }
            }
        }
    
        return true;
    }

    static isValidChain(chain) {
        if(! (chain instanceof Array) || chain.length === 0 ) {
            return false;
        }

        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.error("first block is not genesis block");
            return false;
        }

        for( let i=1; i<chain.length; i++) {
            const {timestamp, data, prevHash, hash, nonce, difficulty} = chain[i];

            const actualPrevHash = chain[i-1].hash;

            if(prevHash !== actualPrevHash) {
                console.error("prevHash does not match the actual previous block hash");
                return false;
            }

            const validatedHash = cryptoHash(timestamp, data, prevHash, nonce, difficulty);

            if(hash !== validatedHash) {
                console.error("block hash is not valid")
                return false;
            }

            const lastDifficulty = chain[i-1].difficulty;

            if(Math.abs(difficulty - lastDifficulty) > 1) {
                console.error("block's difficulty is jumped more than one");
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;