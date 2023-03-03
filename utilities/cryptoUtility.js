const { reject } = require('lodash');
const crypto = require('node:crypto');

module.exports = {
    hashPassword: (pswd) => {
        try {
            const salt = crypto.randomBytes(128).toString("base64");
            const iterations = 10000;
            const keylen = 128;
            const digest = 'sha512';
            return new Promise((resolve, rejects) => {
                crypto.pbkdf2(pswd, salt, iterations, keylen, digest, (err, derivedKey) => {
                    if(err) rejects(err);
                    resolve({
                        salt: salt,
                        hash: derivedKey,
                        iterations: iterations
                    });
                });
            });
        } catch (error) {
            if(err) throw 'failure encrypt password';
        }
    },
    
    unhashPassword: async (pswd, salt) => {
        crypto.pbkdf2(pswd, salt, iterations, keylen, digest, (err, derivedKey) => {
            if(err) {
                return Promise(reject(err));
            } else {
                return new Promise(resolve(derivedKey));
            }
        });
    }
}