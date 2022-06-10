const router = require('express-promise-router')();

const { auth } = require('../controllers');
const { checkJwtSign } = require('../middleware/jwtCheck.js');

router.route('/signin').post(auth.signIn);
router.route('/signup').post(auth.signUp);
router.route('/logout').post(auth.logout);
router.route('/user').get(checkJwtSign, auth.user);

module.exports = router;