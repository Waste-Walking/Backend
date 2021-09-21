const cors = require("cors");
const compression = require("compression");
const express = require("express");

module.exports = async () => {
	// Load Express App
	const app = express();
	WW.app = app;
	app.use(compression());
	app.use(cors({ credentials: true, maxAge: 600, methods: "GET,POST" }));

	// Start GraphQL Server
	await WW.servers.startGraphQL();

	// Start HTTP/HTTPS Server
	await WW.servers.startHTTP();

	app.get("/", (req, res) => {
		res.send("Backend up and running!");
	});

	if (
		WW.configuration.ssl.enabled === true ||
		WW.configuration.ssl.enabled === "true" ||
		WW.configuration.ssl.enabled === 1 ||
		WW.configuration.ssl.enabled === "1"
	) {
		await WW.servers.startHTTPS();
	}

	return true;
};
