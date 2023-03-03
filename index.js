const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubnub');
const request = require('request');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./wallet/transaction-miner');

const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const pubsub = new PubSub({blockchain,transactionPool});
const transactionMiner = new TransactionMiner({blockchain, transactionPool, pubsub});

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => {
    res.json(blockchain.chain.length);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
  
    blockchain.addBlock({ data });

    pubsub.broadcastChain();
  
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { recipientList, amountList } = req.body;

    let transaction;
    try {
        transaction = wallet.createTransaction({ recipientList, amountList });
    } catch (error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);

    res.json({ transaction })
})

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
})

app.get('/api/wallet-info', (req, res) => {
    res.json({
        address: wallet.publicKey,
        balance: Blockchain.calculateBalance(wallet.publicKey, blockchain.chain),
        transactions: wallet.transactionsList(blockchain.chain)
    })
})

const DEFAULT_PORT = 3000;
let PEER_PORT;

const ROOT_URL = `http://localhost:${DEFAULT_PORT}`;

const syncWithRootStates = () => {
    request({ url: `${ROOT_URL}/api/blocks`}, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            blockchain.replaceChain(rootChain);
        }
    })

    request({ url: `${ROOT_URL}/api/transaction-pool-map`}, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootTransactionMap = JSON.parse(body);

            transactionPool.setTransactionMap(rootTransactionMap);
        }
    })
}

if(process.env.GENERATE_PEER_PORT) {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
    console.log(`listening to port ${PORT}.`);

    if(PORT !== DEFAULT_PORT){
        syncWithRootStates();
    }
})