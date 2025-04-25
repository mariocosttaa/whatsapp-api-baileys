const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho para o banco de dados
const dbPath = path.resolve(__dirname, '../../database.sqlite');

// Inicializar o banco de dados
function initDatabase() {
    return new Promise((resolve, reject) => {
        // Garantir que o diretório do banco de dados existe
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                return reject(err);
            }
        });

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
            `, (err) => {
                if (err) {
                    console.error('Error creating sessions table:', err);
                    db.close();
                    return reject(err);
                }

                // Verificar se a tabela foi criada corretamente
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'", (err, row) => {
                    if (err) {
                        console.error('Error verifying table creation:', err);
                        db.close();
                        return reject(err);
                    }

                    if (!row) {
                        const error = new Error('Failed to create sessions table');
                        console.error(error);
                        db.close();
                        return reject(error);
                    }

                    console.log('Database initialized successfully');
                    db.close();
                    resolve();
                });
            });
        });
    });
}

// Obter conexão com o banco de dados
function getDbConnection() {
    return new sqlite3.Database(dbPath);
}

module.exports = {
    initDatabase,
    getDbConnection
};