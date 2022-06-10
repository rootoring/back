const router = require('express-promise-router')();

const { posts } = require('../controllers');
const { checkJwtSign } = require('../middleware/jwtCheck.js');

router.route('/').get(posts.getAllPosts);
router.route('/:id').get(posts.getPost);
router.route('/:category/category').get(posts.getCategoryPosts);
router.route('/favorite/:id').get(checkJwtSign, posts.getFavoritePosts);
router.route('/favorite').post(checkJwtSign, posts.addFavoritePost);
router.route('/favorite/delete').post(checkJwtSign, posts.deleteFavoritePost);
router.route('/popular/get').get(posts.getPopularPosts);
router.route('/comment').post(posts.createPostComments);
router.route('/target/:category').get(posts.getTargetPosts);

module.exports = router;