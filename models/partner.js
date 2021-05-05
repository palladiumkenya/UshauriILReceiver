const sequelize = require("../dbconnection");
const Sequelize = require("sequelize");

const Partner = sequelize.sequelize.define(
    "tbl_partner_facility", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mfl_code: Sequelize.INTEGER,
        status: Sequelize.ENUM(
            "Active",
            "Disabled"
        ),
        partner_id: Sequelize.INTEGER
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "tbl_partner_facility"
    }
);

exports.Partner = Partner;