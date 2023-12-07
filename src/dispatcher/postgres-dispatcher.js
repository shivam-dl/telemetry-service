const winston = require('winston');
const { Pool } = require('pg');
const _ = require('lodash')

const tableColumns = [
    {
      "name": "mid",
      "dataType": "TEXT",
      "primaryKey": true,
      "unique": true
    },
    {
        "name": "level",
        "dataType": "VARCHAR",
    },
    {
      "name": "message",
      "dataType": "JSONB"
    },
    {
      "name": "created_on",
      "dataType": "TIMESTAMP"
    }
];


class PostgresDispatcher extends winston.Transport {

    constructor(options) {
        super();
        this.options = options;
        this.pool = new Pool({
            user: options.username,
            host: options.host,
            database: options.db,
            password: options.password,
            port: 5432,
            max: options?.minPool || 10
        });

        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${options.tableName} (
            ${tableColumns.map(column => `${column.name} ${column.dataType}`).join(', ')},
            PRIMARY KEY (${tableColumns.filter(column => column.primaryKey).map(column => column.name).join(', ')}),
            UNIQUE (${tableColumns.filter(column => column.unique).map(column => column.name).join(', ')})
        );`;

        this.pool.connect()
            .then(client => {client
                .query(createTableQuery)
                .then(() => {
                    client.release()
                    console.log(`Table ${options.tableName} created successfully or already exists`);
                }).catch((error) => {
                    client.release();
                    console.error(`Error creating table ${options.tableName}:`, error);
                    throw e.stack;
                })
            }).catch(error => {
                console.error('Error connecting to the database:', error);
            });
    }

    log(level, msg, meta, callback) {
        const fields = tableColumns.map((column) => column.name)
        if(this.options.dataExtract === 'true' && msg.includes('events')){
            const dataToInsert = JSON.parse(msg).events;
            
            return this.pool.connect((err, client, release) => {
                if (err) {
                    return console.error('Error acquiring client:', err);
                }
                // Generate an array of parameterized values for the insert
                dataToInsert.map(row => console.log("row  ", JSON.stringify(row)))
                const values = dataToInsert.map(row => `('${row.mid}', '${level}', '${JSON.stringify(row)}', NOW())`).join(', ');
                console.log("values ", values)
                // Construct and execute the insert query
                const query = `INSERT INTO ${this.options.tableName} (${fields.join(', ')}) VALUES ${values}`;
                client.query(query, (err, result) => {
                    release(); // Release the client back to the pool
                    if (err) {
                        console.error('Error inserting multiple rows:', err);
                        callback(err, null);
                    } else {
                        console.log('Multiple rows inserted successfully');
                        callback(null, true);
                    }
                    // Close the connection pool
                    this.pool.end();
                });
            });
        } else {
            const query = `INSERT INTO ${this.options.tableName} (${fields.join(', ')}) VALUES ('${meta.mid}', '${level}', '${msg}', NOW())`
            return this.pool.connect()
                .then(client => { client
                    .query(query)
                    .then(() => {
                        client.release();
                        this.emit('logged', msg);
                        return callback(null, true);
                    })
                    .catch((error) => {
                        client.release();
                        this.emit('error', error.stack);
                        console.error(`Error while inserting table ${this.options.tableName}:`, error);
                        return callback(error.stack);
                    })
                }).catch(error => {
                    console.error('Error connecting to the database:', error);
                });
        }
        
    }

    health(callback) {
        this.pool.connect()
            .then(client => {
                client.release();
                callback(true);
            }).catch(error => {
                callback(false);
            });
    }
}

winston.transports.Postgres = PostgresDispatcher;

module.exports = { PostgresDispatcher };