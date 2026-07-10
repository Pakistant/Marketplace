const sqlite3 = require("sqlite3").verbose();
const { databaseFile } = require("../config");

let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(databaseFile);
    db.run("PRAGMA foreign_keys = ON");
  }
  return db;
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

module.exports = { all, get, getDb, run };

