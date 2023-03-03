const Block = require('../../blockchain/block');
const {GENESIS_DATA, MINE_RATE} = require('../../config');
const cryptoHash = require('../../util/crypto-hash');
const hexToBinary = require('hex-to-binary');

describe('Block', () => {

    const timestamp = 1000;
    const data = ["trans1", "trans2", "trans3"];
    const prevHash = '0x1234';
    const hash = "0xkosd";
    const nonce = 1;
    const difficulty = 3;

    const block = new Block({timestamp, data, prevHash, hash, nonce, difficulty});

    it("Checks block instance value", () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.prevHash).toEqual(prevHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('tests genesis()', () => {
        const genesisBlock = Block.genesis();

        it('genesisBlock is instance of Block', () => {
            expect(genesisBlock instanceof Block).toEqual(true);
        });

        it('genesisBlock is equal to genesisData', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    })

    describe('tests mineBlock()', () => {
        const prevBlock = Block.genesis();
        const data = ["trans4", "trans5", "trans6"];
        const minedBlock = Block.mineBlock({prevBlock, data});

        it("minedBlock is an instance of Block", () => {
            expect(minedBlock instanceof Block).toEqual(true);
        });

        it("minedBlock prevHash is equal to prevBlock hash", () => {
            expect(minedBlock.prevHash).toEqual(prevBlock.hash);
        });

        it('sets the correct data', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });
    
        it('creates a SHA-256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    prevBlock.hash,
                    data
                )
            );
        });

        it('hash matches the difficulty criteris', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
                .toEqual('0'.repeat(minedBlock.difficulty));
        })
    })

    describe('tests adjustDifficulty()', () => {
        it('increases difficulty when block is mined quickly', () => {
            expect(Block.adjustDifficulty({
                prevBlock: block,
                timestamp: block.timestamp + MINE_RATE + 200
            })).toEqual(block.difficulty - 1);

        })

        it('decreses difficulty when block is mined slowly', () => {
            expect(Block.adjustDifficulty({
                prevBlock: block,
                timestamp: block.timestamp + MINE_RATE - 200
            })).toEqual(block.difficulty + 1);
        })
    })
})