import bcrypt from 'bcrypt';
import {Promise} from 'rsvp';

export class CryptoManager {

    static createHash(toHash) {
        return new Promise((resolve, reject) =>
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    return reject(err);
                }
                bcrypt.hash(toHash, salt, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(hash);
                });
            })
        );
    }

    static compare(plain, hash) {
        return new Promise((resolve, reject) =>
            bcrypt.compare(plain, hash, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        );
    }

}