const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const algoliaSearch  = require('../services/algolia');

router.get('/', searchController.search);
router.post('/sync', algoliaSearch.syncData);

module.exports = router;
