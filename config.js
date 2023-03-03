const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const STARTING_BALANCE = 1000;

const GENESIS_DATA = {
    timestamp: 1,
    data: [],
    prevHash: '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 1,
    hash: '0xhkjsadhiasdhbksajdbhasjkdbasdjkasdbjkadjbadbjkabjdasjkdkd'
}

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };