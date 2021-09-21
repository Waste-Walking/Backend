const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const autoload = require('auto-load')
const { createRateLimitTypeDef } = require('graphql-rate-limit-directive')

WW.logger.info(`Loading GraphQL Schema...`)

// Schemas
let typeDefs = [createRateLimitTypeDef()]
let schemas = fs.readdirSync(path.join(WW.ROOTPATH, 'graphql/schemas'))
schemas.forEach(schema => {
  typeDefs.push(fs.readFileSync(path.join(WW.ROOTPATH, `graphql/schemas/${schema}`), 'utf8'))
})

// Resolvers
let resolvers = {}
const resolversObj = _.values(autoload(path.join(WW.ROOTPATH, 'graphql/resolvers')))
resolversObj.forEach(resolver => {
  _.merge(resolvers, resolver)
})

// Directives
let schemaDirectives = {
  ...autoload(path.join(WW.ROOTPATH, 'graphql/directives'))
}

WW.logger.info(`GraphQL Schema: [ OK ]`)

module.exports = {
  typeDefs,
  resolvers,
  schemaDirectives
}