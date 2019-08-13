const express = require('express');
const router = express.Router();

const checkAuth = require.main.require('./api/middleware/checkauth');
const FeedsController = require.main.require('./api/controllers/feeds');

router.get('/', checkAuth, FeedsController.feeds_get_all);
router.post('/', checkAuth, FeedsController.feeds_create_feed);
router.patch('/:feedId', checkAuth, FeedsController.feeds_update_feed);
router.delete('/:feedId', checkAuth, FeedsController.feeds_delete_feed);

module.exports = router;