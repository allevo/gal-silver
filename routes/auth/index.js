'use strict'

const AuthService = require('./service')

module.exports = async function (fastify, opts) {
  fastify.register(require('fastify-jwt'), {
    secret: 'supersecret'
  })
  await fastify.after()

  const authService = new AuthService(fastify.jwt)
  fastify.decorate('authService', authService)

  fastify.get('/inspect', inspectTokenAPI)
  fastify.post('/login', { schema: loginAPIInputSchema }, loginAPI)

  fastify.setErrorHandler(function (error, request, reply) {
    switch (error.message) {
      case AuthService.errorCodes.WRONG_CREDENTIALS:
      case AuthService.errorCodes.WRONG_JWT:
        reply.code(401).send(error)
        return
      default:
        reply.send(error)
    }
  })
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
