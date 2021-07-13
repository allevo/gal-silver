'use strict'

const assert = require('assert')

const AccountService = require('./service')

module.exports = async function (fastify, opts) {
  assert(fastify.authService)

  fastify.register(require('fastify-mongodb'), {
    forceClose: true,
    url: opts.MONGODB_URL
  })
  await fastify.after()

  const authService = fastify.authService

  const mongodb = fastify.mongo.db
  fastify.decorateRequest('getAccountService', function () {
    // this = req
    const authorization = this.headers.authorization
    const user = authService.inspect(authorization)
    return new AccountService(mongodb, user)
  })

  fastify.post('/', { schema: accountAPIInputSchema }, createAccount)
  fastify.get('/', getAllMyAccounts)

  fastify.setErrorHandler(function (error, request, reply) {
    if (reply.isAuthError(error)) {
      reply.handleAuthError(error)
      return
    }
    switch (error.message) {
      case AccountService.errorCodes.NOT_ALLOWED_TO_CREATE_NEW_ACCOUNT:
        reply.code(403).send(error)
        return
      /* istanbul ignore next */
      default:
        reply.send(error)
    }
  })
}

const accountAPIInputSchema = {
  body: {
    type: 'object',
    required: ['name', 'initialBalance', 'currency'],
    properties: {
      name: { type: 'string' },
      initialBalance: { type: 'number' },
      currency: { enum: ['EUR', 'USD'] }
    }
  }
}
async function createAccount (req, res) {
  const { name, initialBalance, currency } = req.body

  const accountService = req.getAccountService()
  const newAccount = accountService.createAccount({ name, initialBalance, currency })

  return newAccount
}

async function getAllMyAccounts (req, res) {
  const accountService = req.getAccountService()

  const myAccounts = await accountService.getMyAccounts()

  return myAccounts
}
