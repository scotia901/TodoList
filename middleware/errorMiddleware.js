module.exports = {
    logErrors: (err, req, res, next) => {
        console.error(err);
        next(err);
    },
    
    clientErrorHandler: (err, req, res, next) => {
        if(req.xhr) {
            res.status(500).send( {error: 'Something failed!' });
        } else {
            next(err);
        }
    },
    
    errorHandler: (err, req, res, next) => {
        if (err.status) {
            res.status(err.status).render('error', { "pageTitle": process.env.PAGE_TITLE, "status": err.status, "errMsg": err.message });
        } else {
            const err = new Error("Internal Server Error");
            err.status = 500;
            res.status(500).render('error', { "pageTitle": process.env.PAGE_TITLE, "status": err.status, "errMsg": err.message });
        }
    }
}