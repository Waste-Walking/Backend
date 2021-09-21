const fs = require("fs-extra");
const http = require("http");
const https = require("https");
const { ApolloServer } = require("apollo-server-express");
const _ = require("lodash");

module.exports = {
	servers: {
		graph: null,
		http: null,
	},
	connections: new Map(),
	// Start HTTP server
	async startHTTP() {
		WW.logger.info(`HTTP Server on port: [ ${WW.configuration.port} ]`);
		this.servers.http = http.createServer(WW.app);

		this.servers.http.listen(WW.configuration.port, WW.configuration.bindIP);
		this.servers.http.on("error", (error) => {
			if (error.syscall !== "listen") {
				throw error;
			}

			switch (error.code) {
				case "EACCES":
					WW.logger.error("Listening on port " + WW.configuration.port + " requires elevated privileges!");
					return process.exit(1);
				case "EADDRINUSE":
					WW.logger.error("Port " + WW.configuration.port + " is already in use!");
					return process.exit(1);
				default:
					throw error;
			}
		});

		this.servers.http.on("listening", () => {
			WW.logger.info("HTTP Server: [ RUNNING ]");
		});

		this.servers.http.on("connection", (conn) => {
			let connKey = `http:${conn.remoteAddress}:${conn.remotePort}`;
			this.connections.set(connKey, conn);
			conn.on("close", () => {
				this.connections.delete(connKey);
			});
		});
	},

	// Start HTTPS server
	async startHTTPS() {
		console.log("bin ich hier?")
		WW.logger.info(`HTTPS Server on port: [ ${WW.configuration.ssl.port} ]`);
		const tlsOpts = {};
		try {
			if (WW.configuration.ssl.format === "pem") {
				tlsOpts.key = WW.configuration.ssl.inline ? WW.configuration.ssl.key : fs.readFileSync(WW.configuration.ssl.key);
				tlsOpts.cert = WW.configuration.ssl.inline ? WW.configuration.ssl.cert : fs.readFileSync(WW.configuration.ssl.cert);
			} else {
				tlsOpts.pfx = WW.configuration.ssl.inline ? WW.configuration.ssl.pfx : fs.readFileSync(WW.configuration.ssl.pfx);
			}
			if (!_.isEmpty(WW.configuration.ssl.passphrase)) {
				tlsOpts.passphrase = WW.configuration.ssl.passphrase;
			}
			if (!_.isEmpty(WW.configuration.ssl.dhparam)) {
				tlsOpts.dhparam = WW.configuration.ssl.dhparam;
			}
		} catch (err) {
			WW.logger.error("Failed to setup HTTPS server parameters:");
			WW.logger.error(err);
			return process.exit(1);
		}
		this.servers.https = https.createServer(tlsOpts, WW.app);

		this.servers.https.listen(WW.configuration.ssl.port, WW.configuration.bindIP);
		this.servers.https.on("error", (error) => {
			if (error.syscall !== "listen") {
				throw error;
			}

			switch (error.code) {
				case "EACCES":
					WW.logger.error("Listening on port " + WW.configuration.ssl.port + " requires elevated privileges!");
					return process.exit(1);
				case "EADDRINUSE":
					WW.logger.error("Port " + WW.configuration.ssl.port + " is already in use!");
					return process.exit(1);
				default:
					throw error;
			}
		});

		this.servers.https.on("listening", () => {
			WW.logger.info("HTTPS Server: [ RUNNING ]");
		});

		this.servers.https.on("connection", (conn) => {
			let connKey = `https:${conn.remoteAddress}:${conn.remotePort}`;
			this.connections.set(connKey, conn);
			conn.on("close", () => {
				this.connections.delete(connKey);
			});
		});
	},

	// Start GraphQL server
	async startGraphQL() {
		const graphqlSchema = require("../graphql");
		this.servers.graph = new ApolloServer({
			...graphqlSchema,
			context: ({ req, res }) => ({ req, res }),
		});
		await this.servers.graph.start();
		this.servers.graph.applyMiddleware({ app: WW.app });
	},
};
