const graphHelper = require("../../helpers/graphql");
const _ = require("lodash");

module.exports = {
	Query: {
		async event() {
			return {};
		},
	},
	Mutation: {
		async event() {
			return {};
		},
	},
	EventQuery: {
		async list(obj, args, context, info) {
			return await WW.models.events
				.query()
				.select(
					"events.id",
					"events.title",
					"events.content",
					"events.date",
					"events.location",
					"events.lat",
					"events.lon"
				);
		},
		async single(obj, args, context, info) {
			let event = await WW.models.events.query().findById(args.id);
			return event;
		},
	},
	EventMutation: {
		async create(obj, args) {
			try {
				await WW.models.events.createNewEvent(args);

				return {
					responseResult: graphHelper.generateSuccess("Event created successfully"),
				};
			} catch (err) {
				return graphHelper.generateError(err);
			}
		},
		/*
		async delete(obj, args) {
			try {
				await WW.models.events.deleteEvent(args.id);
				return {
					responseResult: graphHelper.generateSuccess("Event deleted successfully"),
				};
			} catch (err) {
				return graphHelper.generateError(err);
			}
		},
		async update(obj, args) {
			try {
				await WW.models.events.updateEvent(args);

				return {
					responseResult: graphHelper.generateSuccess("Event updated successfully"),
				};
			} catch (err) {
				return graphHelper.generateError(err);
			}
		},
		*/
	},
};
