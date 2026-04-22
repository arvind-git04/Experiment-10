const serverless = require('serverless-http');
const app = require('../../backend/server');
const { connectDB } = require('../../backend/server');

// Ensure MongoDB is connected
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Make sure we connect to the database
  await connectDB();
  
  // Proxy the request to the Express app
  return await handler(event, context);
};
