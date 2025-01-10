const auth = (req, res, next) => {
    const token = "xyz";
    const isAuthorized = "xyz";
    if (isAuthorized === token) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

module.exports = { auth };