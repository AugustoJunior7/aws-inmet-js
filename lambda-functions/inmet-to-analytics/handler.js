const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')


const server = awsServerlessExpress.createServer(app)

exports.getInmetData = (event, context) => {
  return awsServerlessExpress.proxy(server, event, context)
}

// Upando o servidor para a AWS
