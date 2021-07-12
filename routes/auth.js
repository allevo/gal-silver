'use strict'

const credentialDatabase = [
    { id: 1, username: 'allevo', password: 'qwerty', groups: [] },
    { id: 2, username: 'admin', password: 'admin', groups: ['admin'] },
    { id: 3, username: 'viewer', password: 'viewer', groups: ['viewer'] },
]

module.exports = async function (fastify, opts) {
    fastify.register(require('fastify-jwt'), {
        secret: 'supersecret'
    })

    fastify.get('/auth/inspect', async function (req, res) {
        try {
            await req.jwtVerify()
        } catch (err) {
            res.send(err)
            return
        }

        return req.user
    })

    fastify.post('/auth/login', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                }
            }
        }
    }, async function (req, res) {
        const { username, password } = req.body

        const userCredential = credentialDatabase.find(r => r.username === username)
        if (!userCredential) {
            throw fastify.httpErrors.unauthorized('invalid credentials')
        }
        if (userCredential.password !== password) {
            throw fastify.httpErrors.unauthorized('invalid credentials')
        }

        const { id, groups } = userCredential

        const token = fastify.jwt.sign({ subject: username, userId: id, groups })

        return { token }
    })
}
