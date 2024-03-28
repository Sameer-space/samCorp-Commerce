const algoliasearch = require('algoliasearch');
const Product = require('../models/productModel');
var envAlgolia = JSON.parse(process.env.ALGOLIA);
const client = algoliasearch(envAlgolia.applicationId, envAlgolia.apiKey);
const index = client.initIndex(envAlgolia.index);


const algoliaSearch = {
    searchProducts: async function(q) {
        try {
            const { hits , nbHits , query} = await index.search(q);
            return {
                searchTerm: query,
                totalResults: nbHits,
                searchResults : hits
            };
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },

    syncData: async function() {
        try {
            // Fetch products from your database
            const products = await Product.find();

            // Map products to Algolia records
            const records = products.map(product => ({
                objectID: product._id, 
                name: product.name,
                description: product.description,
                images: product.images,
                categoryId: product.category || "", 
                variants: product.variants.map(variant => ({
                    name: variant.name,
                    price: variant.price,
                    stockQuantity: variant.stockQuantity,
                    attributes: variant.attributes,
                    images: variant.images,
                })),
                isActive: product.isActive,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }));            

            // Push records to Algolia index
            const synced = await index.saveObjects(records);
            return synced;
        } catch (error) {
            console.error('Error syncing data with Algolia:', error);
            throw error;
        }
    }
};

module.exports = algoliaSearch;