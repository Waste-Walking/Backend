const path = require('path')
const fs = require('fs-extra')
const semver = require('semver')

const migrationPath = path.join(WW.ROOTPATH, 'db/migrations')

module.exports = {
  async getMigrations() {
    const migrationFiles = await fs.readdir(migrationPath)
    return migrationFiles.map(m => m.replace('.js', '')).sort(semver.compare).map(m => ({
      file: m,
      directory: migrationPath
    }))
  },

  getMigrationName(migration) {
    return migration.file.indexOf('.js') >= 0 ? migration.file : `${migration.file}.js`
  },

  getMigration(migration) {
    return require(path.join(migrationPath, migration.file))
  }
}
