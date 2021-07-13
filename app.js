'use strict'

const path = require('path')
const AutoLoad = require('fastify-autoload')
const envSchema = require('env-schema')

const schema = {
  type: 'object',
  required: ['JWT_SECRET', 'MONGODB_URL'],
  properties: {
    JWT_SECRET: { type: 'string' },
    MONGODB_URL: { type: 'string' }
  }
}

module.exports = async function (fastify, opts) {
  const config = envSchema({
    schema: schema,
    data: opts
  })

  fastify.register(require('fastify-swagger'), {
    routePrefix: '/documentation',
    exposeRoute: true
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, config)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, config)
  })
}
