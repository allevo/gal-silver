'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('accounts', async (t) => {
  const app = build(t)

  t.test('if logged as admin', async t => {
    const username = 'admin'
    const token = await fetchToken(app, t, username, 'admin')

    t.test('is able to create a new account', async t => {
      const res = await app.inject({
        url: '/accounts/',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        body: {
          name: 'the-account-name',
          initialBalance: 1,
          currency: 'EUR'
        }
      })
      t.equal(res.statusCode, 200, 'should return 200', res.payload)

      const body = JSON.parse(res.payload)

      t.ok(body._id)

      const accountId = body._id

      delete body._id
      t.strictSame(body, {
        name: 'the-account-name',
        user: { id: 2, username },
        balance: {
          amount: 1,
          currency: 'EUR'
        },
        transactions: [
          { type: 'IN', amount: 1 }
        ]
      })

      t.test('and fetch it back', async t => {
        const res = await app.inject({
          url: '/accounts/',
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        t.equal(res.statusCode, 200, 'should return 200', res.payload)

        const body = JSON.parse(res.payload)

        t.strictSame(body, [
          {
            _id: accountId,
            name: 'the-account-name',
            user: { id: 2, username },
            balance: {
              amount: 1,
              currency: 'EUR'
            },
            transactions: [
              { type: 'IN', amount: 1 }
            ]
          }
        ])
      })
    })
  })

  t.test('if logged as NON admin', async t => {
    const token = await fetchToken(app, t, 'allevo', 'qwerty')

    t.test('is not able to create a new account', async t => {
      const res = await app.inject({
        url: '/accounts/',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        body: {
          name: 'the-account-name',
          initialBalance: 1,
          currency: 'EUR'
        }
      })
      t.equal(res.statusCode, 403, 'should return 403', res.payload)
    })

    t.test('is able to fetch own accounts', async t => {
      const res = await app.inject({
        url: '/accounts/',
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      t.equal(res.statusCode, 200, 'should return 200', res.payload)
    })
  })

  t.test('if NOT logged', async t => {
    t.test('is not able to create a new account', async t => {
      const res = await app.inject({
        url: '/accounts/',
        method: 'POST',
        body: {
          name: 'the-account-name',
          initialBalance: 1,
          currency: 'EUR'
        }
      })
      t.equal(res.statusCode, 401, 'should return 401', { responseBody: res.payload })
    })
  })

  t.test('is not able to fetch accounts', async t => {
    const res = await app.inject({
      url: '/accounts/',
      method: 'GET'
    })
    t.equal(res.statusCode, 401, 'should return 401', { responseBody: res.payload })
  })
})

async function fetchToken (app, t, username, password) {
  const res = await app.inject({
    url: '/auth/login',
    method: 'POST',
    body: {
      username,
      password
    }
  })
  t.equal(res.statusCode, 200)

  const { token } = JSON.parse(res.payload)
  t.ok(token)

  return token
}
