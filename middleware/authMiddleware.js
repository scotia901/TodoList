module.exports = {
    refreshSessionData: (req, res, next) => {
        try {
            if(req.session.user) {
                const elapsedTime = req.session.cookie.originalMaxAge - req.session.cookie.maxAge;
                const refreshTime = 1000;

                if(elapsedTime > refreshTime) {
                    const id = req.session.user.id;
                    const nickname = req.session.user.nickname;
                    req.session.regenerate((err) => {
                        if (err) throw err;
                        req.session.user.id = id;
                        req.session.nickname = nickname;
                        req.session.save((err) => {
                            if (err) throw err;
                        });
                        next();
                    });
                } else {
                    next();
                }
            } else {
                next();
            }
        } catch (err) {
            next(err);
        }
    },

    validateLogin: (req, res) => {
            if (!req.session.user) {
                res.redirect('/users/login');
            } else {
                next();
            }
    }
}