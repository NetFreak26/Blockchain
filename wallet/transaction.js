const uuid = require('uuid');
const { verifySignature } = require('../util/elliptic-utils');

class Transaction {

    constructor({ senderWallet, recipientList, amountList }) {
        try {
            this.id = uuid.v1();
            this.outputMap = this.createOutputMap({ senderWallet, recipientList, amountList });
            this.inputMap = this.createInputMap({ senderWallet, outputMap: this.outputMap });
        } catch(err) {
            throw err;
        }
    }

    createOutputMap({ senderWallet, recipientList, amountList }) {
        if(recipientList instanceof Array && amountList instanceof Array && recipientList.length === amountList.length) {
            const outputMap = {};

            const totalAmount = amountList.reduce((total, amount) => total + amount);
            if(totalAmount > senderWallet.balance) {
                throw "Amount exceeds the sender wallet balance";
            }

            outputMap[senderWallet.publicKey] = senderWallet.balance;

            for(let i=0; i<recipientList.length; i++){
                if(outputMap[recipientList[i]]) {
                    outputMap[recipientList[i]] += amountList[i];
                } else {
                    outputMap[recipientList[i]] = amountList[i];
                }
                
                outputMap[senderWallet.publicKey] -= amountList[i];
            }

            return outputMap;
        } else {
            throw "Invalid Transaction";
        }
    }

    createInputMap({ senderWallet, outputMap }) {
        const inputMap =  {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }

        senderWallet.balance = outputMap[senderWallet.publicKey];

        return inputMap;
    }

    static validateTransaction(transaction) {

        if(!(transaction instanceof Transaction)) {
            return false;
        }
        const { inputMap, outputMap } = transaction;
        const {address, amount, signature } = inputMap;

        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }
}

module.exports = Transaction;