const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Function to set up Swagger documentation
async function setupSwagger(app) {
    try {
        // Load the OpenAPI YAML file
        const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));

        // Serve the Swagger UI at /docs endpoint
        app.use('/docs', swaggerUi.serve);

        // Set up Swagger UI with the loaded document
        app.get('/docs', swaggerUi.setup(swaggerDocument));
        
        const message = 'Swagger documentation is available at \u001b[36m/docs\u001b[0m';
        console.log(`\u001b[1m${message}\u001b[0m`);

    } catch (error) {
        console.error('Failed to set up Swagger documentation:', error.message);
    }
}

module.exports = {setupSwagger};
