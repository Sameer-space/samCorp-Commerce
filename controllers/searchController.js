const algolia = require('../services/algolia');

const searchController = {
  search: async (req, res) => {
    try {
      const { query } = req.query;
      const results = await algolia.searchProducts(query);
      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = searchController;
