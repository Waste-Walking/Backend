const Model = require('objection').Model
const _ = require('lodash')

/**
 * Settings model
 */
module.exports = class settings extends Model {
  static get tableName() { return 'settings' }
  static get idColumn() { return 'key' }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['key'],

      properties: {
        key: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }

  static get jsonAttributes() {
    return ['value']
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }
  $beforeInsert() {
    this.updatedAt = new Date().toISOString()
  }

  // ------------------------------------------------
  // Instance Methods
  // ------------------------------------------------

  // ------------------------------------------------
  // Model Methods
  // ------------------------------------------------

  static async getConfig() {
    const settings = await WW.models.settings.query()
    if (settings.length > 0) {
      return _.reduce(settings, (res, val, key) => {
        _.set(res, val.key, (_.has(val.value, 'v')) ? val.value.v : val.value)
        return res
      }, {})
    } else {
      return false
    }
  }
}
