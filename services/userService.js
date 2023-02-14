const db = require('../db');

module.exports = {

    getAllUsers: (callback) => {
        db.query('SELECT * FROM users', function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    getUserById: (userId, callback) => {
        db.query(`SELECT * FROM users WHERE user_id = "${userId}"`, function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    getUserByEmail: function (userEmail, callback)  {
        db.execute(`SELECT user_id FROM users WHERE email = "${userEmail}"`, function (err, row, result) {
            if (err) {
                callback(err, null);
            } else {
                let userId = new Array;
                row.forEach(element => {
                    element.user_id
                    userId.push(element.user_id);
                });
                callback(null, userId);
            };
        })

    },

    createUser: (userData, callback) => {
        db.query(`INSERT INTO auth_join (
            user_id,
            name,
            email,
            social_type,
            password_hash,
            password_salt,
            password_iter
        )
        VALUES(?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE auth_code = ?`,
        [userData.userId, userData.name, userData.email, userData.socialType, userData.hash, userData.salt], function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    updateUserById: (userId, userData, callback) => {
        db.query('UPDATE user SET name=username, email=, password=, img, FROM users WHERE user_id = userId', function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    deleteUserById: (userId, callback) => {
        db.query(`DELETE FROM users WHERE id=${userId}`, function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }
}