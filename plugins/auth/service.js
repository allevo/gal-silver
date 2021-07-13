'use strict'

class AuthService {
  constructor (jwt) {
    this.jwt = jwt
  }

  login (log, { username, password }) {
    const userCredential = credentialDatabase.find(r => r.username === username)
    if (!userCredential) {
      throw new Error(AuthService.errorCodes.WRONG_CREDENTIALS)
    }
    if (userCredential.password !== password) {
      throw new Error(AuthService.errorCodes.WRONG_CREDENTIALS)
    }

    const { id, groups } = userCredential

    const token = this.jwt.sign({ subject: username, userId: id, groups })

    log.info({ username }, 'user is logged')

    return { token }
  }

  inspect (authorizationHeader) {
    if (!authorizationHeader) {
      throw new Error(AuthService.errorCodes.WRONG_JWT)
    }

    const match = authorizationHeader.match(/^Bearer\s+(.*)$/)
    if (!match) {
      throw new Error(AuthService.errorCodes.WRONG_JWT)
    }
    const token = match[1]

    try {
      return this.jwt.verify(token)
    } catch (e) {
      throw new Error(AuthService.errorCodes.WRONG_JWT)
    }
  }
}

AuthService.errorCodes = {
  WRONG_CREDENTIALS: 'WRONG_CREDENTIALS',
  WRONG_JWT: 'WRONG_JWT'
}

const credentialDatabase = [
  { id: 1, username: 'allevo', password: 'qwerty', groups: [] },
  { id: 2, username: 'admin', password: 'admin', groups: ['admin'] },
  { id: 3, username: 'viewer', password: 'viewer', groups: ['viewer'] }
]

module.exports = AuthService
