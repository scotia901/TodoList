let resetPassword = [];
let join = [];
let updateEmail = [];

module.exports = {
    storeResetPasswordData: (data, callback) => {
        try {
            deleteExpiredToken(resetPassword);
            resetPassword = resetPassword.filter((item) => item.username !== data.username);
            resetPassword.push(data);

            callback(null);
        } catch (error) {
            throw error;
        }
    },

    storeJoinData: async (data, callback) => {
        try {
            deleteExpiredToken(join);
            join = join.filter((item) => item.username !== data.username);
            join.push(data);

            callback(null);
        } catch (error) {
            throw error;
        }
    },

    storeUpdateEmailData: async (data) => {
        deleteExpiredToken(updateEmail);
        updateEmail = updateEmail.filter((item) => item.username !== data.username);
        updateEmail.push(data);
    },

    getResetPswdUserByToken: async (token) => {
        deleteExpiredToken(resetPassword);
        const userData = resetPassword.filter((item) => item.token == token);

        if (userData.length == 1) {
            return userData[0].username;
        } else {
            throw 'Not found';
        }
    },

    getJoinUserByToken: async (token) => {
        deleteExpiredToken(join);
        const userData = join.filter((item) => item.token === token);

        if (userData.length == 1) {
            return userData[0];
        } else {
            throw 'Not found';
        }
    },

    checkHasToken: async (token) => {
        deleteExpiredToken(resetPassword);
        const hasToken = resetPassword.some((item) => item.token === token);

        if (hasToken) {
            return true;
        } else {
            return false;
        }
    },

    checkEmailAndCode: async (email, code) => {
        deleteExpiredToken(updateEmail);
        const hasData = updateEmail.some((item) => item.code == code && item.email == email);

        if (hasData) {
            return true;
        } else {
            return false;
        }
    },
}

function deleteExpiredToken (tokenList) {
    const now = new Date();

    while (tokenList.length) {
        if (now > tokenList[0].expire) {
            tokenList.shift();
        } else {
            break;
        }
    }
}