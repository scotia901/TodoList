module.exports = {
    preventBruteforce: (req, res) => {
        if (req.session.tryLogin > 5) {
            res.status(200).send('You try more then 5');
        } else if(req.session.isLogined == true){
            next();
        } else {
            req.session.tryLogin += 1;
        }
    }
}
