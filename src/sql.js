const utils = require('./utils');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./owl.db');

function sqlize(val) {
    if(val) {
        if(typeof val === 'number') return val;
        else return `"${val.toString().replace(/\"/gm, '""')}"`
    } else return 'NULL';
}
function condition(variable, operator, value) {
    return `${variable} ${operator} ${sqlize(value)}`;
}

class SQLite {
    /**
     * The SQLite statement that will be executed if passed to the sqlite3 module's
     * respective functions.
     */
    raw = '';
    constructor(baseStatement) {
        this.raw = baseStatement;
    }

    /* ===== Statement Execution Functions ===== */

    async asUpdate() {
        utils.printDebug(`Executing update statement: ${this.raw}`);
        return new Promise((resolve, reject) => db.prepare(this.raw).run(function(err) {
            if(err) reject(err);
            else resolve();
        }).finalize());
    }

    /* ===== Statement Creation Functions ===== */

    static select(from, ...what) {
        return new SQLSelect(`SELECT ${what.join(', ')} FROM ${from._}`);
    }
    static delete(from) {
        return new SQLDelete(`DELETE FROM ${from._}`);
    }
    static insert(into, what, orIgnore = false) {
        let keys = [], vals = [];
        for(let key of Object.keys(what)) keys.push(key.replace(new RegExp(`${into._}\.`), ''));
        for(let val of keys) vals.push(sqlize(what[val]));
        return new SQLInsert(`INSERT ${orIgnore ? 'OR IGNORE ' : ''}INTO ${into._} (${keys.join(', ')}) VALUES (${vals.join(', ')})`);
    }
    static update(table, set) {
        return new SQLUpdate(`UPDATE ${table._}`).set(set);
    }

    /* ===== Statement Detailing Functions ===== */

    and(variable, operator, value) {
        this.raw += ` AND ${condition(variable, operator, value)}`;
        return this;
    }
    or(variable, operator, value) {
        this.raw += ` OR ${condition(variable, operator, value)}`;
        return this;
    }
}

class SQLWhereable extends SQLite {
    where(variable, operator, value) {
        this.raw += ` WHERE ${condition(variable, operator, value)}`;
        return this;
    }
}

class SQLSelect extends SQLWhereable {
    join(what, variable, operator, value) {
        this.raw += ` JOIN ${what} ON ${variable} ${operator} ${value}`;
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

    async asSingleQuery() {
        utils.printDebug(`Executing single-query statement: ${this.raw}`);
        return new Promise((resolve, reject) => db.prepare(this.raw).get(function(err, row) {
                if(err) reject(err);
                else resolve(row);
        }).finalize());
    }
    async asQuery() {
        utils.printDebug(`Executing query statement: ${this.raw}`);
        return new Promise((resolve, reject) => db.prepare(this.raw).all(function(err, row) {
            if(err) reject(err);
            else resolve(row);
        }).finalize());
    }
}
class SQLUpdate extends SQLWhereable {
    set(vals) {
        let sets = [];
        for(let key in vals) sets.push(condition(key, '=', vals[key]));
        this.raw += ` SET ${sets.join(', ')}`;
        return this;
    }
}
class SQLDelete extends SQLWhereable {

}
class SQLInsert extends SQLite {
    onConflict(method, ...conflictables) {
        for(let i = 0; i < conflictables.length; i++) conflictables[i] = conflictables[i].replace(/\w+\./, '');
        this.raw += ` ON CONFLICT (${conflictables.join(', ')}) DO ${method}`;
        return this;
    }
}

module.exports = SQLite;