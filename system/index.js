const _ = require("lodash");
var ip = require("ip");

module.exports = {
	async init() {
		WW.logger.info("=======================================");
		WW.logger.info(`= Waste-Walking ${_.padEnd(WW.version + " ", 23, "=")}`);
		WW.logger.info("=======================================");
		WW.logger.info("Initializing...");

		WW.models = require("./db").init();

		try {
			await WW.models.onReady;
			await WW.configurationSvc.loadFromDatabase();
		} catch (err) {
			WW.logger.error("Database Initialization Error: " + err.message);
			process.exit(1);
		}
		// Set host
		WW.configuration.host = await ip.address();
		this.bootBackend();
	},
	/**
	 * Boot Backend Process
	 */
	async bootBackend() {
		try {
			WW.servers = require("./servers");
			await require("./startup")();
		} catch (err) {
			WW.logger.error(err);
			process.exit(1);
		}
	},
};
