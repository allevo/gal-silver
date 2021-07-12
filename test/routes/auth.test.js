'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('auth', async (t) => {
  const app = build(t)

  t.test('login should return the token', async t => {
    const res = await app.inject({
      url: '/auth/login',
      method: 'POST',
      body: {
        username: 'allevo',
        password: 'qwerty',
      }
    })
    t.equal(res.statusCode, 200)

    const { token } = JSON.parse(res.payload)
    t.ok(token)

    t.test('and the token is inspectable', async t => {
      const res = await app.inject({
        url: '/auth/inspect',
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        }
      })
      t.equal(res.statusCode, 200)

      const { userId, subject, groups, iat, ...others } = JSON.parse(res.payload)
      
      t.equal(userId, 1)
      t.equal(subject, 'allevo')
      t.strictSame(groups, [])
      t.ok(iat)

      t.strictSame(others, {})
    })
  })

  const validationTests = [
    { name: 'username is required', requestBody: { password: 'qwerty' }, expectedStatusCode: 400 },
    { name: 'password is required', requestBody: { username: 'allevo' }, expectedStatusCode: 400 },
    { name: 'return 401 on user not found', requestBody: { username: 'unknonw', password: 'qwerty' }, expectedStatusCode: 401 },
    { name: 'return 401 on wrong pwd', requestBody: { username: 'allevo', password: 'wrong' }, expectedStatusCode: 401 },
  ]
  for (const test of validationTests) {
    t.test(test.name, async t => {
      const res = await app.inject({
        url: '/auth/login',
        method: 'POST',
        body: test.requestBody,
      })
      t.equal(res.statusCode, test.expectedStatusCode, `should return ${test.expectedStatusCode}`, { responseBody: res.payload })
    })
  }
  
  t.test('inpect endoint should return 401 on bad jwt', async t => {
    const res = await app.inject({
      url: '/auth/inspect',
      method: 'GET',
      headers: {
        Authorization: 'Bearer bad-token',
      }
    })
    t.equal(res.statusCode, 401, 'should return 401', { responseBody: res.payload })
  })
})
