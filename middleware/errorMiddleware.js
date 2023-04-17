module.exports = {
    logErrors: (error, req, res, next) => {
        if (error == 'Bad Request') {
            next(error);
        } else if (error == 'Unauthorized') {
            next(error);
        } else if (error == 'Forbidden') {
            next(error);
        } else if (error == 'Not found') {
            next(error);
        } else {
            console.error(error);
            next(error);
        }
    },

    clientErrorHandler: (error, req, res, next) => {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            if (error == 'Bad Request') {
                res.status(400).send();
            } else if (error == 'Unauthorized') {
                res.status(401).send();
            } else if (error == 'Forbidden') {
                res.status(403).send();
            } else if (error == 'Not found') {
                res.status(404).send();
            } else {
                res.status(500).send();
            }
        } else {
            next(error);
        }
    },

    errorHandler: (error, req, res, next) => {
        let status = ''

        switch (error) {
            case 'Bad Request':
                status = 400;
                break;
            case 'Unauthorized':
                status = 401;
                break;
            case 'Forbidden':
                status = 403;
                break;
            default:
                status = 500;
                break;
        }

        if (status != 500) {
            res.status(status).render('error', {
                "pageTitle": process.env.PAGE_TITLE,
                "status": status,
                "errMsg": error
            });
        } else {
            res.status(500).render('error', {
                "pageTitle": process.env.PAGE_TITLE,
                "status": 500,
                "errMsg": 'Internal Server Error'
            });
        }
    }
}