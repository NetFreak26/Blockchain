const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const sha256 = crypto.createHash('sha256');

    sha256.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

    return sha256.digest('hex');
}

module.exports = cryptoHash;