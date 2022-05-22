/*
 * ===== sql.js =====
 * 
 * Custom module for interacting with the bot's SQLite database.
 * Contains builder classes for quickly assembling SQL statements,
 * adjusted specifically to be used together with settings.js' table schemas.
 */


/* ===== Imports ===== */

const utils = require('./utils');

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');


/* ===== Helper Object Initialization ===== */

/**
 * The `Database` object for running SQL statements.
 */
const db = new sqlite3.Database('./owl.db', (err) => {
    if(err) utils.printError(`Failed to connect to database: ${err}`);
    else utils.print('Successfully connected to database!');
});

// Ensure that a database file exists and that it follows the correct schema
if(!fs.existsSync('./owl.db')) {
    utils.print('Database file not found, creating...');
    fs.openSync('./owl.db', 'w');
    let schema = fs.readFileSync('./owl.sql')?.toString();
    if(schema) db.serialize(() => schema.toString().split(/\;$/gm).forEach(q => db.run(`${q};`)));
    else utils.printWarn('Database schema not found, database tables couldn\'t be created!');
}


/* ===== Helper Functions ===== */

/**
 * Parses the given value into a valid SQLite form.
 * @param {*} val Value to parse
 * @returns {string} The parsed value
 */
function sqlize(val) {
    if(val) {
        if(typeof val === 'number') return val;
        else return `"${val.toString().replace(/\"/gm, '""')}"`
    } else return 'NULL';
}

/**
 * Creates a valid SQLite conditional statement comparing the values in the given column
 * to the given value using the given operator.
 * @param {string} variable Name of the relevant database column
 * @param {string} operator The operator to use in the equation, e.g. `=`, `>`, ...
 * @param {*} value The value to check for
 * @returns {string} The valid SQLite conditional statement from the given parameters
 */
function condition(variable, operator, value) {
    return `${variable} ${operator} ${sqlize(value)}`;
}


/* ===== Export Content ===== */

/**
 * Base communicator class for interactions with the SQLite database.
 * 
 * Contains static methods for initializing SQL statements, which can then be fully
 * customized by chaining onto the returned objects before being executed.
 */
class SQLite {
    /**
     * The raw text of the SQL statement that will be executed if passed
     * to the sqlite3 module's respective functions.
     */
    raw = '';
    constructor(baseStatement) {
        this.raw = baseStatement;
    }

    /* ===== Statement Execution Functions ===== */

    /**
     * Runs the assembled statement on the database, returning no results.
     * @returns {Promise<void>} 
     */
    async asUpdate() {
        if(db instanceof sqlite3.Database) {
            utils.printDebug(`Executing update statement: ${this.raw}`);
            return new Promise((resolve, reject) => db.prepare(this.raw).run(function(err) {
                if(err) reject(err);
                else resolve();
            }).finalize());
        } else utils.printWarn(`Refusing to run update while not connected to database: ${this.raw}`);
    }

    /* ===== Statement Creation Functions ===== */

    /**
     * Initializes an SQL statement builder for `SELECT` statements.
     * @param {string} from Name of the database Table to query data from
     * @param  {...string} what Names of the columns to return values of
     * @returns An `SQLSelect` container object to chain further statement customization on
     */
    static select(from, ...what) {
        return new SQLSelect(`SELECT ${what.join(', ')} FROM ${from._}`);
    }
    /**
     * Initializes an SQL statement builder for `DELETE` statements.
     * @param {string} from Name of the database Table to delete data from
     * @returns An `SQLDelete` container object to chain further statement customization on
     */
    static delete(from) {
        return new SQLDelete(`DELETE FROM ${from._}`);
    }
    /**
     * Initializes an SQL statement builder for `INSERT` statements.
     * @param {string} into Name of the database Table to insert data into
     * @param {object} what Object literal containing the column-value pairs of data to insert
     * @param  {boolean} orIgnore Whether to initialize this as an `INSERT OR IGNORE` statement instead
     * @returns An `SQLInsert` container object to chain further statement customization on
     */
    static insert(into, what, orIgnore = false) {
        let keys = [], vals = [];
        for(let key of Object.keys(what)) {
            keys.push(key.replace(new RegExp(`${into._}\.`), ''));
            vals.push(sqlize(what[key]));
        }
        return new SQLInsert(`INSERT ${orIgnore ? 'OR IGNORE ' : ''}INTO ${into._} (${keys.join(', ')}) VALUES (${vals.join(', ')})`);
    }
    /**
     * Initializes an SQL statement builder for `UPDATE` statements.
     * @param {string} table Name of the database Table to update data in
     * @param  {object} set Object literal containing the column-value pairs of data to update
     * @returns An `SQLUpdate` container object to chain further statement customization on
     */
    static update(table, set) {
        return new SQLUpdate(`UPDATE ${table._}`).set(set);
    }
}

/**
 * Parent class for statement builder classes where the statement can contain conditions.
 */
class SQLConditionable extends SQLite {
    where(variable, operator, value) {
        this.raw += ` WHERE ${condition(variable, operator, value)}`;
        return this;
    }
    and(variable, operator, value) {
        this.raw += ` AND ${condition(variable, operator, value)}`;
        return this;
    }
    or(variable, operator, value) {
        this.raw += ` OR ${condition(variable, operator, value)}`;
        return this;
    }
}

/**
 * Statement builder class for creating SQL `SELECT` statements.
 */
class SQLSelect extends SQLConditionable {
    join(what, variable, operator, value) {
        this.raw += ` JOIN ${what._} ON ${variable} ${operator} ${value}`;
        return this;
    }
    group(by, asc = false) {
        this.raw += ` GROUP BY ${by} ${asc ? 'ASCENDING' : 'DESCENDING'}`;
        return this;
    }
    order(by, asc = false) {
        this.raw += ` GROUP BY ${by} ${asc ? 'ASCENDING' : 'DESCENDING'}`;
        return this;
    }

    /**
     * Runs the assembled statement on the database as a query, returning a single row.
     * @returns {Promise<object>} The first matching row, if found, with the column names as keys.
     */
    async asSingleQuery() {
        if(db instanceof sqlite3.Database) {
            utils.printDebug(`Executing single-query statement: ${this.raw}`);
            return new Promise((resolve, reject) => db.prepare(this.raw).get(function(err, row) {
                if(err) reject(err);
                else resolve(row);
            }).finalize());
        } else utils.printWarn(`Refusing to run single-query while not connected to database: ${this.raw}`);
    }
    /**
     * Runs the assembled statement on the database as a query, returning all rows found.
     * @returns {Promise<object[]>} Array of matching rows, each with the column names as keys.
     */
    async asQuery() {
        if(db instanceof sqlite3.Database) {
            utils.printDebug(`Executing query statement: ${this.raw}`);
            return new Promise((resolve, reject) => db.prepare(this.raw).all(function(err, row) {
                if(err) reject(err);
                else resolve(row);
            }).finalize());
        } else utils.printWarn(`Refusing to run query while not connected to database: ${this.raw}`);
    }
}
/**
 * Statement builder class for creating SQL `UPDATE` statements.
 */
class SQLUpdate extends SQLConditionable {
    set(vals) {
        let sets = [];
        for(let key in vals) sets.push(condition(key, '=', vals[key]));
        this.raw += ` SET ${sets.join(', ')}`;
        return this;
    }
}
/**
 * Statement builder class for creating SQL `DELETE` statements.
 */
class SQLDelete extends SQLConditionable {

}
/**
 * Statement builder class for creating SQL `INSERT` statements.
 */
class SQLInsert extends SQLite {
    onConflict(method, ...conflictables) {
        for(let i = 0; i < conflictables.length; i++) conflictables[i] = conflictables[i].replace(/\w+\./, '');
        this.raw += ` ON CONFLICT (${conflictables.join(', ')}) DO ${method}`;
        return new SQLUpdate(this.raw);
    }
}

module.exports = SQLite;