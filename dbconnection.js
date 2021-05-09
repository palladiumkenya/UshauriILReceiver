const Sequelize = require("sequelize");

var connection = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    port: 3306,
    database: 'ushauri'
};
const database = connection.database;
const username = connection.user;
const password = connection.password;
const port = connection.port;
const db_server = connection.host;

// const sequelize = new Sequelize(
//   `mysql://${username}:${password}@${db_server}:${port}/${database}`
// );

const sequelize = new Sequelize(database, username, password, {
    host: db_server,
    port: port,
    dialect: "mysql"
});

const connect = async () => {
    await sequelize
        .authenticate()
        .then(() => {
            console.log("Connection has been established successfully.");
        })
        .catch(err => {
            console.log("Unable to connect to the database:", err.message);
        });
};
const db = {
    sequelize: sequelize,
    connect
};

module.exports = db;