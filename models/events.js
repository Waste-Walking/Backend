const Model = require("objection").Model;
const validate = require("validate.js");
const { nanoid } = require("nanoid");

/**
 * Events model
 */
module.exports = class events extends Model {
	static get tableName() {
		return "events";
	}

	static get jsonSchema() {
		return {
			type: "object",

			properties: {
				id: { type: "integer" },
				uuid: { type: "string" },
				title: { type: "string", minLength: 1, maxLength: 255 },
				content: { type: "string" },
				date: { type: "string" },
				location: { type: "string" },
				lat: { type: "float" },
				lon: { type: "float" },
				email: { type: "string" },
				isVerified: { type: "boolean" },
				createdAt: { type: "string" },
				updatedAt: { type: "string" },
			},
		};
	}

	async $beforeInsert(context) {
		await super.$beforeInsert(context);

		this.createdAt = new Date().toISOString();
		this.updatedAt = new Date().toISOString();
	}

	async $beforeUpdate(opt, context) {
		await super.$beforeUpdate(opt, context);

		this.updatedAt = new Date().toISOString();
	}

	// ------------------------------------------------
	// Instance Methods
	// ------------------------------------------------

	// ------------------------------------------------
	// Model Methods
	// ------------------------------------------------

	/**
	 * Create new event
	 *
	 * @param {Object} param0 Event Fields
	 */
	static async createNewEvent({ title, content, date, location, lat, lon, email }) {
		// Input validation
		let validation = null;

		// TODO: Add E-Mail functionality
		email = "no@email.com"

		validation = validate(
			{
				title,
				content,
				date,
				location,
				lat,
				lon,
				email,
			},
			{
				title: {
					presence: {
						allowEmpty: false,
					},
					length: {
						minimum: 2,
						maximum: 255,
					},
				},
				content: {
					presence: {
						allowEmpty: false,
					},
				},
				date: {
					presence: {
						allowEmpty: false,
					},
					length: {
						minimum: 2,
						maximum: 255,
					},
				},
				location: {
					presence: {
						allowEmpty: false,
					},
					length: {
						minimum: 2,
						maximum: 255,
					},
				},
				lat: {
					presence: {
						allowEmpty: false,
					},
					numericality: true,
				},
				lon: {
					presence: {
						allowEmpty: false,
					},
					numericality: true,
				},
				email: {
					email: true,
					presence: {
						allowEmpty: false,
					},
					length: {
						maximum: 255,
					},
				},
			},
			{ format: "flat" }
		);

		if (validation && validation.length > 0) {
			throw new WW.Error.InputInvalid(validation[0]);
		}

		var uuid = nanoid();

		await WW.models.events.query().insert({ title, content, uuid, date, location, lat, lon, email, isVerified: true });
	}

	/**
	 * Update an existing event
	 *
	 * @param {Object} param0 Event ID and fields to update
	 */
	static async updateEvent({ id, title }) {
		const event = await WW.models.events.query().findById(id);
		if (event) {
			let eventData = {};
		}
		// TODO: Finish
	}

	/**
	 * Delete an Event
	 *
	 * @param {*} id Event ID
	 */
	static async deleteEvent(id) {
		const event = await WW.models.events.query().findById(id);
		if (event) {
			await WW.models.events.query().deleteById(id);
		} else {
			throw new WW.Error.EventNotFound();
		}
	}
};
