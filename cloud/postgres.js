let {Client} = require('pg');
let Promise = require('bluebird');

let client = false;

let postgresUri = process.env.POSTGRES_URL;
if (!postgresUri) {
    console.log('POSTGRES_URI not specified. postgres will not be available');
}


function getConnection() {

    return new Promise((resolve, reject) => {
        if (client) {
            resolve(client);

        }

        client = new Client({
            connectionString: postgresUri,
        });
        client.connect();
        resolve(client);

    });

}


module.exports = {


    test: function () {

        return new Promise((resolve, reject) => {
            getConnection()
                .then((client) => {
                    client.query('SELECT NOW()', (err, res) => {
                        console.log(err, res);
                        client.end();
                        resolve(res);
                    });
                })
                .catch((e) => {
                    reject(e);
                });
        });


    },

    select: function (table, columns = '*', where = false, orderby = false, limit = false) {

        return new Promise((resolve, reject) => {
            let query = 'SELECT ' + columns + ' FROM ' + table;
            if (where) {
                query += ' WHERE ' + where;
            }

            if (orderby) {
                query += ' ORDER BY ' + orderby;
            }

            if (limit) {
                query += limit;
            }

            getConnection()
                .then((client) => {

                    client.query(query)
                        .then((r) => {
                            client.end();
                            resolve(r);
                        });
                    //client.query.on('end', () => { client.end(); });
                })
                .catch((err) => {
                    reject(err);
                })
        });


    },

    insert: function (table, dataObj) { // pass in dataObj as a json kvp
        return new Promise((resolve, reject) => {
            let data = [];
            columns = '';
            holders = '';
            Object.keys(dataObj).forEach(function (key, index) {
                let value = dataObj[key];
                data.push(value);
                if (index > 0) {
                    columns += ',';
                    holders += ',';
                }
                columns += key;
                holders += '$' + (index + 1);
            });

            let query = 'INSERT INTO ' + table + ' (' + columns + ') VALUES (' + holders + ') RETURNING *';

            getConnection()
                .then((client) => {

                    client.query(query, data)
                        .then((r) => {
                            client.end();
                            resolve(r);
                        });
                    //client.query.on('end', () => { client.end(); });
                })
                .catch((err) => {
                    reject(err);
                })
        });


    },

    update: function (table, dataObj, where) {
        return new Promise((resolve, reject) => {

            data = [];
            columnsData = '';
            Object.keys(dataObj).forEach(function (key, index) {
                let value = dataObj[key];
                data.push(value);
                if (index > 0) {
                    columnsData += ',';
                }
                columnsData += key + ' = $' + (index + 1) + ' ';

            });

            let query = 'UPDATE ' + table + ' SET ' + columnsData + ' WHERE ' + where;
            getConnection()
                .then((client) => {

                    client.query(query, data)
                        .then((r) => {
                            client.end();
                            resolve(r);
                        });
                    //client.query.on('end', () => { client.end(); });
                })
                .catch((err) => {
                    reject(err);
                })

        })
    },

    delete: function (table, where = false) {
        return new Promise((resolve, reject) => {

            let query = 'DELETE FROM ' + table;

            if (where) {
                query += ' WHERE ' + where;
            }

            getConnection()
                .then((client) => {

                    client.query(query)
                        .then((r) => {
                            client.end();
                            resolve(r);
                        });
                    //client.query.on('end', () => { client.end(); });
                })
                .catch((err) => {
                    reject(err);
                })

        })
    },

    runFunction: function (functionName, parameters = []) {
        return new Promise((resolve, reject) => {

            holders = '';

            for (let i = 0; i < parameters.length; i++) {
                if (i > 0) {
                    holders += ',';
                }
                holders += '$' + (i + 1);
            }


            getConnection()
                .then((client) => {

                    client.query('SELECT * FROM ' + functionName + '(' + holders + ') ', parameters)
                        .then((r) => {
                            client.end();
                            resolve(r);
                        });
                })
                .catch((err) => {
                    reject(err);
                })

        })
    }


};