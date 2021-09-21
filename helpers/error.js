const CustomError = require("custom-error-instance");

module.exports = {
	EventNotFound: CustomError("EventNotFound", {
		message: "Dieses Event existiert nicht.",
		code: 1001,
	}),
	InputInvalid: CustomError("InputInvalid", {
		message: "Eingabedaten sind ungültig.",
		code: 1002,
	}),
};
