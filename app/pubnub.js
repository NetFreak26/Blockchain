const PubNub = require('pubnub');

const credentials = {
    publishKey: "pub-c-93f0e3cf-2f92-472f-8cec-54062e83298d",
    subscribeKey: "sub-c-b170e290-d8cb-4aa6-bb4f-146c5918b074",
    secretKey: "---",
    userId: "test"
}

const CHANNELS = {
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub {
    constructor( { blockchain, transactionPool }) {

        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.pubnub = new PubNub(credentials);
        this.pubnub.subscribe({ channels: Object.values(CHANNELS)});
        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            message: messageObject => {
                const {channel, message} = messageObject;
                console.log(`Message received. Channel${channel}. Message: ${message}`);

                const parsedMessage = JSON.parse(message);

                switch(channel){
                    case CHANNELS.BLOCKCHAIN:
                        this.blockchain.replaceChain(parsedMessage, () => {
                            this.transactionPool.clearBlockchainTransactions(parsedMessage);
                        });
                        break;

                    case CHANNELS.TRANSACTION:
                        this.transactionPool.setTransaction(parsedMessage);
                        break;

                    default:
                        return;
                }

            }
        }
    }

    async publish({channel, message}) {
        this.pubnub.unsubscribe({ channels: Object.values(CHANNELS)})
        await this.pubnub.publish({channel, message});
        this.pubnub.subscribe({ channels: Object.values(CHANNELS)});
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

module.exports = PubSub;