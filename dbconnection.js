const Sequelize = require("sequelize");

var connection = {
    host: '127.0.0.1',
    user: 'mlab',
    password: 'Mlab123!@#',
    port: 3307,
    database: 'il_test'
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
