'use strict'

const fp = require('fastify-plugin')

const AuthService = require('./service')

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('fastify-jwt'), {
    secret: opts.JWT_SECRET
  })
  await fastify.after()

  const authService = new AuthService(fastify.jwt)
  fastify.decorate('authService', authService)
  fastify.decorate('AUTH_ERROR_CODES', AuthService.errorCodes)

  fastify.decorateReply('isAuthError', function (error) {
    return !!AuthService.errorCodes[error.message]
  })
  fastify.decorateReply('handleAuthError', function (error) {
    // this = reply
    this.code(401).send(error)
  })
})
