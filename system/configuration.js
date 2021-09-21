const _ = require("lodash");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

module.exports = {
	init() {
		const configPath = path.join(WW.ROOTPATH, "config.yml");

		process.stdout.write(chalk.cyanBright(`Loading configuration file from ${configPath}... `));

		var configuration = {};

		try {
			configuration = yaml.load(fs.readFileSync(configPath, "utf8"));
			console.info(chalk.green.bold("SUCCESS"));
		} catch (err) {
			console.error(chalk.red.bold("FAILED"));
			console.error(err.message);
			console.error(chalk.red.bold("No configuration file found! Did you create the config.yml file?"));
			process.exit(1);
		}

		const packageInfo = require(path.join(WW.ROOTPATH, 'package.json'))

		WW.configuration = configuration;
		WW.version = packageInfo.version
	},

	/**
	 * Load configuration from Database
	 */
	async loadFromDatabase() {
		var configuration = await WW.models.settings.getConfig();
		WW.configuration = _.defaultsDeep(configuration, WW.configuration);
	},

	/**
	 * Save configuration to Database
	 */
	async saveToDatabase(keys) {
		try {
			for (var key of keys) {
				var value = _.get(WW.configuration, key, null);
				if (!_.isPlainObject(value)) {
					value = { v: value };
				}
				var affectedRows = await WW.models.settings.query().patch({ value }).where("key", key);
				if (affectedRows === 0 && value) {
					await WW.models.settings.query().insert({ key, value });
				}
			}
		} catch (err) {
			WW.logger.error(`Failed to save configuration to DB: ${err.message}`);
			return false;
		}

		return true;
	},
};
