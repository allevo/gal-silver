'use strict'

class AccountService {
  constructor (mongodb, user) {
    this.mongodb = mongodb
    this.user = user
  }

  async createAccount ({ name, initialBalance, currency }) {
    const doc = {
      name,
      user: {
        id: this.user.userId,
        username: this.user.subject
      },
      balance: {
        amount: initialBalance,
        currency
      },
      transactions: []
    }
    doc.transactions.push({
      type: 'IN',
      amount: initialBalance
    })

    const result = await this.mongodb.collection('accounts').insertOne(doc)

    return result.ops[0]
  }

  async getMyAccounts () {
    const accounts = await this.mongodb.collection('accounts').find({
      'user.id': this.user.userId
    }).toArray()
    return accounts
  }
}

module.exports = AccountService
