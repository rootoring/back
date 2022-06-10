const router = require('express-promise-router')();

const { category } = require('../controllers');


router.route('/').get(category.getAllCategory);
router.route('/:id').get(category.getCategory);

module.exports = router;