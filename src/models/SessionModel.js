const { getDbConnection } = require('../database/sqlite');

class SessionModel {
    // Criar uma nova sessão no banco de dados
    static createSession(sessionName) {
        return new Promise((resolve, reject) => {
            const db = getDbConnection();

            db.run(
                'INSERT INTO sessions (session_name, status) VALUES (?, ?) ON CONFLICT(session_name) DO UPDATE SET status = ?, updated_at = CURRENT_TIMESTAMP', [sessionName, 'initializing', 'initializing'],
                function(err) {
                    db.close();

                    if (err) {
                        return reject(err);
                    }

                    resolve({ id: this.lastID, sessionName });
                }
            );
        });
    }

    // Atualizar o status e QR code de uma sessão
    static updateSessionQR(sessionName, qrCode) {
        return new Promise((resolve, reject) => {
            const db = getDbConnection();

            db.run(
                'UPDATE sessions SET qr_code = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_name = ?', [qrCode, 'qr_generated', sessionName],
                function(err) {
                    db.close();

                    if (err) {
                        return reject(err);
                    }

                    resolve({ updated: this.changes > 0 });
                }
            );
        });
    }

    // Atualizar o status de uma sessão
    static updateSessionStatus(sessionName, status) {
        return new Promise((resolve, reject) => {
            const db = getDbConnection();

            db.run(
                'UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_name = ?', [status, sessionName],
                function(err) {
                    db.close();

                    if (err) {
                        return reject(err);
                    }

                    resolve({ updated: this.changes > 0 });
                }
            );
        });
    }

    // Obter uma sessão pelo nome
    static getSession(sessionName) {
        return new Promise((resolve, reject) => {
            const db = getDbConnection();

            db.get(
                'SELECT * FROM sessions WHERE session_name = ?', [sessionName],
                (err, row) => {
                    db.close();

                    if (err) {
                        return reject(err);
                    }

                    resolve(row);
                }
            );
        });
    }

    // Listar todas as sessões
    static getAllSessions() {
        return new Promise((resolve, reject) => {
            const db = getDbConnection();

            db.all('SELECT * FROM sessions', (err, rows) => {
                db.close();

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            });
        });
    }

    // Deletar uma sessão
    static deleteSession(sessionName) {
        return new Promise((resolve, reject) => {
            const db = getDbConnection();

            db.run(
                'DELETE FROM sessions WHERE session_name = ?', [sessionName],
                function(err) {
                    db.close();

                    if (err) {
                        return reject(err);
                    }

                    resolve({ deleted: this.changes > 0 });
                }
            );
        });
    }
}

module.exports = SessionModel;