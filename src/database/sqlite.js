const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho para o banco de dados
const dbPath = path.resolve(__dirname, '../../database.sqlite');

// Inicializar o banco de dados
function initDatabase() {
    const db = new sqlite3.Database(dbPath);

    // Criar tabela de sessões se não existir
    db.serialize(() => {
        db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_name TEXT UNIQUE,
        status TEXT,
        qr_code TEXT,
        auth_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    });

    console.log('Database initialized successfully');
    db.close();
}

// Obter conexão com o banco de dados
function getDbConnection() {
    return new sqlite3.Database(dbPath);
}

module.exports = {
    initDatabase,
    getDbConnection
};