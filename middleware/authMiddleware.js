module.exports = {
    refreshSessionData: (req, res, next) => {
        try {
            if(req.session.isLogined == true) {
                const elapsedTime = req.session.cookie.originalMaxAge - req.session.cookie.maxAge;
                const refreshTime = 1000;

                if(elapsedTime > refreshTime) {
                    const user_id = req.session.user_id;
                    const username = req.session.username;
                    const isLogined = req.session.isLogined;
                    const authNewEmail = req.session.authNewEmail;
                    const userimg = req.session.userimg;
                    req.session.regenerate((err) => {
                        if (err) throw err;
                        req.session.authNewEmail = authNewEmail;
                        req.session.referrer = req.protocol + "://" + req.get("host") + req.originalUrl;
                        req.session.user_id = user_id;
                        req.session.userimg = userimg;
                        req.session.isLogined = isLogined;
                        req.session.username = username;
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
            if (req.session.isLogined == true) {
                res.redirect('/tasks');
            } else {
                res.redirect('/users/login');
            }
    }
}