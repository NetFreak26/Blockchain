const { verifySignature } = require("../../util/elliptic-utils");
const Wallet = require("../../wallet");
const Transaction = require("../../wallet/transaction");

describe('tests Transaction', () => {
    let transaction, senderWallet, recipient1, recipient2, amount1, amount2;
    let errorMock;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient1 = (new Wallet()).publicKey;
        recipient2 = (new Wallet()).publicKey;

        amount1 = 50;
        amount2 = 100;

        recipientList = [recipient1, recipient2];
        amountList = [amount1, amount2];

        transaction = new Transaction({senderWallet, recipientList, amountList });

        errorMock = jest.fn();

        global.console.error = errorMock;
    })

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an outputMap', () => {
            expect(transaction).toHaveProperty('outputMap');
        });
    
        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient1]).toEqual(amount1);
            expect(transaction.outputMap[recipient2]).toEqual(amount2);
        });
    
        it('outputs the remaining balance for the senderWallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(senderWallet.balance - amount1 - amount2);
        });
    });

    describe('input', () => {
        it('has an input', () => {
            expect(transaction).toHaveProperty('inputMap');
        });
    
        it('has a timestamp in the input', () => {
            expect(transaction.inputMap).toHaveProperty('timestamp');
        });
    
        it('sets the amount to the senderWallet balance', () => {
            expect(transaction.inputMap.amount).toEqual(senderWallet.balance);
        });
    
        it('sets the address to the `senderWallet` publicKey', () => {
            expect(transaction.inputMap.address).toEqual(senderWallet.publicKey);
        });
    
        it('signs the input', () => {
            expect(
                verifySignature({
                    data: transaction.outputMap,
                    publicKey: senderWallet.publicKey,
                    signature: transaction.inputMap.signature
                })).toBe(true);
            });
        });

        describe('validateTransaction()', () => {
            
            describe('when transaction is valid', () => {
                it('returns true', () => {
                    expect(Transaction.validateTransaction(transaction)).toBe(true);
                })
            })
            
            describe('when transaction is invalid', () => {
                describe('when outputMap is not valid', () => {
                    it('return false', () => {
                        transaction.outputMap[senderWallet.publicKey] = 999999;

                        expect(Transaction.validateTransaction(transaction)).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    })
                })

                describe('when signature is not valid', () => {
                    it('return false', () => {
                        transaction.inputMap.signature = new Wallet().sign(transaction.outputMap);

                        expect(Transaction.validateTransaction(transaction)).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    })
                })
            })

        })
})