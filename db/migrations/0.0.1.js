exports.up = (knex) => {
	return (
		knex.schema
			// EVENTS
			.createTable("events", (table) => {
				table.increments("id").primary();
				table.string("uuid").notNullable();
				table.string("title").notNullable();
				table.string("content").notNullable();
				table.string("date").notNullable();
				table.string("location").notNullable();
				table.specificType('lat', 'double precision').notNullable()
				table.specificType('lon', 'double precision').notNullable()
				table.string("email").notNullable();
				table.boolean("isVerified").notNullable().defaultTo(false);
				table.string("createdAt").notNullable();
				table.string("updatedAt").notNullable();
			})
			// SETTINGS ----------------------------
			.createTable("settings", (table) => {
				table.string("key").notNullable().primary();
				table.json("value");
				table.string("updatedAt").notNullable();
			})
	);
};

exports.down = (knex) => {};
