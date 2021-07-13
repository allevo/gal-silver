'use strict'

const assert = require('assert')

module.exports = async function (fastify, opts) {
  assert(fastify.authService)

  fastify.get('/auth/inspect', { schema: inspectTokenAPIInputSchema }, inspectTokenAPI)
  fastify.post('/auth/login', { schema: loginAPIInputSchema }, loginAPI)

  fastify.setErrorHandler(function (error, request, reply) {
    if (reply.isAuthError(error)) {
      reply.handleAuthError(error)
      return
    }
    reply.send(error)
  })
}

const inspectTokenAPIInputSchema = {
  headers: {
    authorization: { type: 'string' }
  }
}
async function inspectTokenAPI (req, res) {
  const authorization = req.headers.authorization

  return this.authService.inspect(authorization)
}

const loginAPIInputSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  }
}
async function loginAPI (req, res) {
  const { username, password } = req.body

  const token = this.authService.login(req.log, { username, password })

  return token
}
