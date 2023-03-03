const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../util/crypto-hash");
const hexToBinary = require('hex-to-binary');

class Block {
    constructor({timestamp, data, prevHash, hash, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ prevBlock, data }) {
        const prevHash = prevBlock.hash;
        let difficulty = prevBlock.difficulty;
        let timestamp = Date.now();
        let nonce = 0;
        let hash = cryptoHash(timestamp, data, prevHash, nonce, difficulty);

        while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)) {
            timestamp = Date.now();
            nonce++;
            difficulty = Block.adjustDifficulty({prevBlock, timestamp});
            hash = cryptoHash(timestamp, data, prevHash, nonce, difficulty);
        }

        return new this({
            timestamp,
            prevHash,
            data,
            hash,
            nonce,
            difficulty
        })
    }

    static adjustDifficulty({ prevBlock, timestamp }) {
        const { difficulty } = prevBlock;

        const difference = timestamp - prevBlock.timestamp;

        if(difference > MINE_RATE) {
            if(difficulty === 0) {
                return difficulty;
            }
            return difficulty - 1;
        } else {
            return difficulty + 1;
        }
    }
}

module.exports = Block;