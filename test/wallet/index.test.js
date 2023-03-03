const { verifySignature } = require('../../util/elliptic-utils');
const Wallet = require('../../wallet');
const Transaction = require('../../wallet/transaction');

describe('test Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    })

    it('has a balance property', () => {
        expect(wallet).toHaveProperty('balance');
        expect(wallet.balance).toEqual(1000);
    })

    it('has a publicKey property', () => {
        expect(wallet).toHaveProperty('publicKey');
    })

    describe('signing data', () => {
        const data = ["trans1", "trans2"];

        it('verifySignature returns true if signature is valid', () => {
            expect(verifySignature({
                data,
                publicKey: wallet.publicKey, 
                signature: wallet.sign(data)
            })).toBe(true);
        })

        it('verifySignature returns false if signature is invalid', () => {
            expect(verifySignature({
                data,
                publicKey: wallet.publicKey, 
                signature: (new Wallet).sign(data)
            })).toBe(false);
        })
    })

    describe('createTransaction()', () => {

        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({ amountList: [999999], recipientList: [(new Wallet).publicKey] }))
                    .toThrow("Amount exceeds the sender wallet balance");
            });
        });
      
        describe('and the amount is valid and multiple recipients', () => {
            let transaction, amount, recipient;
        
            beforeEach(() => {
                amount = 50;
                recipient = (new Wallet).publicKey;
                transaction = wallet.createTransaction({ recipientList: [recipient], amountList: [amount] });
            });
        
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });
        
            it('matches the transaction input with the wallet', () => {
                expect(transaction.inputMap.address).toEqual(wallet.publicKey);
            });
        
            it('outputs the amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });

            it('verify transaction signature', () => {
                expect(Transaction.validateTransaction(transaction)).toBe(true);
            })
        });
    })
})