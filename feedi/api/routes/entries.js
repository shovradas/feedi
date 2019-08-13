const express = require('express');
const router = express.Router();

const checkAuth = require.main.require('./api/middleware/checkauth');
const EntriesController = require.main.require('./api/controllers/entries');

router.get('/', checkAuth, EntriesController.entries_get_all);
router.get('/:feedId', checkAuth , EntriesController.entries_get_entries_by_feed);
router.patch('/:entryId', checkAuth, EntriesController.entries_update_entry);

module.exports = router;