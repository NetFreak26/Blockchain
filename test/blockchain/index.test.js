const Block = require("../../blockchain/block");
const Blockchain = require("../../blockchain");
const { GENESIS_DATA } = require("../../config");
const cryptoHash = require("../../util/crypto-hash");

describe('Blockchain', () => {

    let blockchain;
    let newBlockchain;
    let errorMock;
    let logMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newBlockchain = new Blockchain();

        errorMock = jest.fn();
        logMock = jest.fn();

        global.console.error = errorMock;
        global.console.log = logMock;
    })

    it('contains a chain array instance', () => {
        expect(blockchain.chain instanceof Array).toEqual(true);
    })

    it('should start with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(GENESIS_DATA);
    })

    it('should add a Block a to the chain', () => {
        const newData = ["trans1", "trans2", "trans3"];
        blockchain.addBlock({data: newData});

        expect(blockchain.currentBlock() instanceof Block).toEqual(true);
        expect(blockchain.currentBlock().data).toEqual(newData);
    })

    describe('checks isValidChain()', () => {
        describe('when chain does not start with genesis block', () => {
            it('should return false', () => {
                blockchain.chain[0] = {
                    timestamp: 1,
                    data: ["trans1"],
                    prevHash: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    hash: '0xhkjsadhiasdhbksajdbhasjkdbasdjkasdbjkadjbadbjkabjdasjkdkd'
                }

                expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })

        describe('when chain has multiple blocks', () => {

            beforeEach(() => {

                blockchain.addBlock({data: ["trans2", "trans3", "trans4", "trans5"]});
                blockchain.addBlock({data: ["trans6", "trans7", "trans8", "trans9"]});
                blockchain.addBlock({data: ["trans10", "trans11", "trans12", "trans13"]});

            })

            describe('when chain lastBlock hash does not match', () => {
                it('should return false', () => {
                    blockchain.chain[3].prevHash = "0xjlosdjolkd";

                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false);
                    expect(errorMock).toHaveBeenCalled();

                })
            })

            describe('when chain block hash is invalid', () => {
                it('should return false', () => {
                    blockchain.chain[2].data = ["tempered-data"];

                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            })

            describe("when block's difficulty has been jumped more than one", () => {
                it('should return false', () => {
                    blockchain.chain[2].difficulty = 100;
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(false);
                })
            })

            describe('when all things are correct', () => {
                it('should return true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toEqual(true);
                })
            })
        })
    })

    describe('checks replaceChain()', () => {
        describe('when new chain is not longer than current one', () => {
            it('does not replace the chain', () => {

                blockchain.addBlock({data: ["trans1"]});

                newBlockchain.addBlock({data: ["trans2"]});

                const originalChain = blockchain.chain;

                blockchain.replaceChain(newBlockchain.chain);

                expect(blockchain.chain).toEqual(originalChain);
                expect(errorMock).toHaveBeenCalled();
            })
        })

        describe('when new chain is longer than current chain', () => {

            describe('when new chain is not valid', () => {

                it('does not replace the chain', () => {
                    blockchain.addBlock({data: ["trans1"]});

                    newBlockchain.addBlock({data: ["trans2"]});
                    newBlockchain.addBlock({data: ["trans3"]});
                    newBlockchain.chain[2].hash = "tempered-hash"

                    const originalChain = blockchain.chain;
    
                    blockchain.replaceChain(newBlockchain.chain);
    
                    expect(blockchain.chain).toEqual(originalChain);
                    expect(errorMock).toHaveBeenCalled();
                })
            })

            describe('when new chain is valid', () => {

                it('replaces the chain', () => {
                    blockchain.addBlock({data: ["trans1"]});

                    newBlockchain.addBlock({data: ["trans2"]});
                    newBlockchain.addBlock({data: ["trans3"]});

                    const originalChain = blockchain.chain;
    
                    blockchain.replaceChain(newBlockchain.chain);
    
                    expect(blockchain.chain).not.toEqual(originalChain);
                    expect(blockchain.chain).toEqual(newBlockchain.chain);
                })
            })
        })
    })
})