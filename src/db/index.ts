import knexSetup from "knex";

const environment = process.env.NODE_ENV || "development";
// eslint-disable-next-line
export default knexSetup(require("../../knexfile")[environment]);
