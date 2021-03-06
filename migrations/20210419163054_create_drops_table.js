exports.up = function (knex) {
  return knex.schema.createTable("drops", function (table) {
    table.increments();
    table.string("channelId").notNullable();
    table.string("imageURI").notNullable();
    table.string("channelName").notNullable();
    table.string("channelThumb").notNullable();
    table.timestamp("endDate").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("drops");
};
