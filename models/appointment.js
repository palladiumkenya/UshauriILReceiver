const sequelize = require("../dbconnection");
const Sequelize = require("sequelize");
const {
    Client
} = require("./client");
const {
    AppointmentType
} = require("./appointment_type");
const Appointment = sequelize.sequelize.define(
    "tbl_appointment", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_id: Sequelize.INTEGER,
        appntmnt_date: Sequelize.DATEONLY,
        app_type_1: Sequelize.INTEGER,
        expln_app: Sequelize.TEXT,
        app_status: Sequelize.ENUM(
            "Booked",
            "Notified",
            "Missed",
            "Defaulted",
            "LTFU"
        ),
        sent_flag: Sequelize.ENUM('0', '1'),
        app_msg: Sequelize.TEXT,
        status: Sequelize.STRING,
        sent_status: Sequelize.STRING,
        entry_point: Sequelize.STRING,
        active_app: Sequelize.INTEGER,
        reason: Sequelize.STRING,
        appointment_kept: Sequelize.STRING,
        no_calls: Sequelize.INTEGER,
        no_msgs: Sequelize.INTEGER,
        home_visits: Sequelize.INTEGER,
        fnl_trcing_outocme: Sequelize.INTEGER,
        fnl_outcome_dte: Sequelize.DATE,
        other_trcing_outcome: Sequelize.STRING,
        visit_type: Sequelize.STRING,
        unscheduled_date: Sequelize.DATEONLY,
        tracer_name: Sequelize.STRING,
        entity_number: Sequelize.STRING,
        appointment_reason: Sequelize.STRING,
        appointment_location: Sequelize.STRING,
        db_source: Sequelize.STRING,
        date_attended: Sequelize.DATEONLY,
        created_by: Sequelize.INTEGER,
        updated_by: Sequelize.INTEGER,
        consented: Sequelize.STRING
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "tbl_appointment"
    }
);
Appointment.belongsTo(AppointmentType, {
    as: "app_type",
    foreignKey: "app_type_1",
});
// Appointment.belongsTo(Client, {
//     as: "client_id",
//     foreignKey: "client_id",
// });

exports.Appointment = Appointment;