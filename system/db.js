const _ = require("lodash");
const autoload = require("auto-load");
const path = require("path");
const Promise = require("bluebird");
const Knex = require("knex");
const Objection = require("objection");

const migrationSource = require("../db/migrator-source");

module.exports = {
	Objection,
	// Start Database
	init() {
		let self = this;

		let dbConfig = {
			host: WW.configuration.db.host.toString(),
			user: WW.configuration.db.user.toString(),
			password: WW.configuration.db.pass.toString(),
			database: WW.configuration.db.db.toString(),
			port: WW.configuration.db.port,
		};

		// Handle SSL Options
		let dbUseSSL =
			WW.configuration.db.ssl === true ||
			WW.configuration.db.ssl === "true" ||
			WW.configuration.db.ssl === 1 ||
			WW.configuration.db.ssl === "1";
		let sslOptions = null;
		if (dbUseSSL && _.isPlainObject(dbConfig) && _.get(WW.configuration.db, "sslOptions.auto", null) === false) {
			sslOptions = WW.configuration.db.sslOptions;
			sslOptions.rejectUnauthorized = sslOptions.rejectUnauthorized === false ? false : true;
			if (sslOptions.ca && sslOptions.ca.indexOf("-----") !== 0) {
				sslOptions.ca = fs.readFileSync(path.resolve(WW.ROOTPATH, sslOptions.ca));
			}
			if (sslOptions.cert) {
				sslOptions.cert = fs.readFileSync(path.resolve(WW.ROOTPATH, sslOptions.cert));
			}
			if (sslOptions.key) {
				sslOptions.key = fs.readFileSync(path.resolve(WW.ROOTPATH, sslOptions.key));
			}
			if (sslOptions.pfx) {
				sslOptions.pfx = fs.readFileSync(path.resolve(WW.ROOTPATH, sslOptions.pfx));
			}
		} else {
			sslOptions = true;
		}

		// Handle inline SSL CA Certificate mode
		if (!_.isEmpty(process.env.DB_SSL_CA)) {
			const chunks = [];
			for (let i = 0, charsLength = process.env.DB_SSL_CA.length; i < charsLength; i += 64) {
				chunks.push(process.env.DB_SSL_CA.substring(i, i + 64));
			}

			dbUseSSL = true;
			sslOptions = {
				rejectUnauthorized: true,
				ca: "-----BEGIN CERTIFICATE-----\n" + chunks.join("\n") + "\n-----END CERTIFICATE-----\n",
			};
		}

		if (dbUseSSL && _.isPlainObject(dbConfig)) {
			dbConfig.ssl = sslOptions;
		}

		// MySQL Boolean Fix
		dbConfig.typeCast = (field, next) => {
			if (field.type === "TINY" && field.length === 1) {
				let value = field.string();
				return value ? value === "1" : null;
			}
			return next();
		};

		// Initialize Knex
		this.knex = Knex({
			client: "mysql2",
			useNullAsDefault: true,
			connection: dbConfig,
			pool: {
				...WW.configuration.pool,
			},
		});

		Objection.Model.knex(this.knex);

		// Load DB Models

		const models = autoload(path.join(WW.ROOTPATH, "models"));

		// Set init tasks
		let conAttempts = 0;
		let initTasks = {
			// -> Attempt initial connection
			async connect() {
				try {
					WW.logger.info("Connecting to database...");
					await self.knex.raw("SELECT 1 + 1;");
					WW.logger.info("Database Connection Successful [ OK ]");
				} catch (err) {
					if (conAttempts < 10) {
						if (err.code) {
							WW.logger.error(`Database Connection Error: ${err.code} ${err.address}:${err.port}`);
						} else {
							WW.logger.error(`Database Connection Error: ${err.message}`);
						}
						WW.logger.warn(`Will retry in 3 seconds... [Attempt ${++conAttempts} of 10]`);
						await new Promise((resolve) => setTimeout(resolve, 3000));
						await initTasks.connect();
					} else {
						throw err;
					}
				}
			},
			// -> Migrate DB Schemas
			async syncSchemas() {
				return self.knex.migrate.latest({
					tableName: "migrations",
					migrationSource,
				});
			},
		};

		let initTasksQueue = [initTasks.connect, initTasks.syncSchemas]

		// Perform init tasks
		this.onReady = Promise.each(initTasksQueue, (t) => t()).return(true);

		return {
			...this,
			...models,
		};
	},
};
