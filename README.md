# WhatsApp API 📱

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Baileys](https://img.shields.io/badge/Powered%20by-Baileys-orange)

A lightweight and efficient **WhatsApp API** built with the [Baileys](https://github.com/adiwajshing/Baileys) library. This project empowers developers to interact with WhatsApp programmatically, enabling features like session management, text and media messaging, and status control (e.g., "typing"). Optimized for **shared hosting environments**, it’s perfect for a wide range of applications, from automation to customer engagement.

## ✨ Features

- **Session Management**: Create, list, check, close, or delete WhatsApp sessions.
- **Messaging**: Send text messages and media (images, videos, documents, etc.).
- **Status Control**: Simulate "typing" status for contacts.
- **QR Code Authentication**: Generate QR codes for secure session authentication.
- **JSON Responses**: All API responses, including errors, are returned in JSON format.
- **Shared Hosting Ready**: Designed for resource-constrained environments.
- **SQLite Database**: Lightweight, auto-initialized database for session management.

## 📖 Documentation

Comprehensive API documentation is available in [`docs/index.html`](./docs/index.html). It includes detailed endpoint descriptions, parameters, responses, and usage examples. Open it in a browser for an interactive experience.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- A **shared hosting environment** or local server with write permissions
- A **WhatsApp account** for QR code scanning

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mariocosttaa/whatsapp-api-baileys
   cd whatsapp-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure permissions**:
   - Ensure the `public/qrcodes/` folder has **write permissions** for QR code storage.
   - Verify the SQLite database directory has **write permissions**.

4. **Start the server**:
   ```bash
   node src/index.js
   ```

5. **Access the API** at `http://your-server-address`.

### Usage Example

1. **Create a session**:
   ```bash
   curl -X POST http://your-server-address/api/session/create \
   -H "Content-Type: application/json" \
   -d '{"sessionName": "my-session"}'
   ```
   Returns a QR code path (e.g., `/public/qrcodes/my-session.png`).

2. **Scan the QR code**:
   - Access the QR code at `http://your-server-address/public/qrcodes/my-session.png`.
   - Scan it using WhatsApp to authenticate the session.

3. **Send a message**:
   ```bash
   curl -X POST http://your-server-address/api/message/send \
   -H "Content-Type: application/json" \
   -d '{"sessionName": "my-session", "phone": "5511999999999", "message": "Hello from WhatsApp API!"}'
   ```

Explore more endpoints and examples in the [documentation](./docs/index.html).

## 🛠️ API Endpoints

### Sessions
- `POST /api/session/create`: Create a new session with QR code.
- `GET /api/session/{sessionName}/qr`: Retrieve QR code for authentication.
- `GET /api/session/{sessionName}/status`: Check session status.
- `GET /api/session`: List all sessions.
- `POST /api/session/{sessionName}/close`: Close a session.
- `DELETE /api/session/{sessionName}`: Delete a session.

### Messages
- `POST /api/message/send`: Send a text message.
- `POST /api/message/send-media`: Send media (images, documents, etc.).

### Status
- `POST /api/status/typing`: Send "typing" status.
- `POST /api/status/stop-typing`: Stop "typing" status.

## 📝 Important Notes

- **Supported Media Formats**: JPEG, PNG, GIF, MP4, PDF, DOC, DOCX, XLS, XLSX, TXT.
- **File Size Limit**: 10MB for media uploads.
- **Session Names**: Avoid starting with numbers or special characters.
- **HTTP Status Codes**: Consistent use of 200, 400, 404, etc.
- **Database**: SQLite database is auto-created on first run.
- **Hosting**: Ensure proper folder permissions in shared hosting environments.

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows the project’s coding style and includes tests.

## 🙌 Credits

- **Powered by**: [Baileys](https://github.com/adiwajshing/Baileys) © 2025
- **Developed by**: [Mário Costa](https://github.com/mariocosttaa)

## 📜 License

This project is licensed under the [MIT License](./LICENSE). See the [LICENSE](./LICENSE) file for details.

---

Happy coding! 🚀