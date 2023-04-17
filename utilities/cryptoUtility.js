const crypto = require('node:crypto');
const iterations = 10000;
const keylen = 128;
const digest = 'sha512';

module.exports = {
    generateHashAndSalt: async (pswd) => {
        const salt = crypto.randomBytes(128).toString('base64');

        return new Promise((resolve, rejects) => {
            crypto.pbkdf2(pswd, salt, iterations, keylen, digest, (error, derivedKey) => {
                if(error) rejects(error);
                resolve({ salt: salt, hash: derivedKey });
            });
        });
    },
    
    createHashByPasswordAndSalt: async (password, salt) => {
        return new Promise((resolve, rejects) => {
            crypto.pbkdf2(password, salt, iterations, keylen, digest, (error, derivedKey) => {
                if(error) rejects(error);
                resolve(derivedKey);
            });
        });
    },

    createRandomHash: async (length, stringType) => {
        return new Promise((resolve, rejects) => {
            crypto.randomBytes(length, (error, buffer) => {
                if(error) rejects(error);
                resolve(buffer.toString(stringType));
            })
        })
    },

    createRandomDigit: async (length) => {
        const maxNumber = 1 * Math.pow(10, length) - 1;

        return new Promise((resolve, rejects) => {
            crypto.randomInt(0, maxNumber, (error, number) => {
                if(error) rejects(error);
                resolve(number.toString().padStart(length, '0'));
            });
        });
    }
}