
"use strict";

const fs = require("fs");
const path = require("path");

const procedureName = "sp_actualiza_ganadores";

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const sqlPath = path.join(
      __dirname,
      "../database/procedures/sp_actualiza_ganadores.sql"
    );

    const sql = fs.readFileSync(sqlPath, "utf8").trim();

    // Eliminar una versión anterior del procedimiento
    await sequelize.query(
      `DROP PROCEDURE IF EXISTS ${procedureName}`
    );

    // Crear el procedimiento con el SQL del archivo
    await sequelize.query(sql);

    console.log(`Procedimiento ${procedureName} instalado`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DROP PROCEDURE IF EXISTS ${procedureName}`
    );

    console.log(`Procedimiento ${procedureName} eliminado`);
  }
};
