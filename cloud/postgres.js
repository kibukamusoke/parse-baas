
let { Client } = require('pg');
let Promise = require('bluebird');


let postgresUri = process.env.POSTGRES_URL;
if (!postgresUri) {
    console.log('POSTGRES_URI not specified. postgres will not be available');
}

let client = false;


function connection() {

    return new Promise((resolve, reject) => {
       if (client) {
           resolve(client);
           return;
       }

        client = new Client({
            connectionString: postgresUri,
        });
        client.connect();
        resolve(client);

    });

}


module.exports = {

    test: function (){

        client.query('SELECT NOW()', (err, res) => {
            console.log(err, res);
            client.end()
        })
    },

    select: function(table, columns='*', where=false, orderby=false, limit=false) {


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

        return client.query(query); // returns a promise.
    }



};