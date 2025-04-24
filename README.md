WhatsApp API
A lightweight and efficient WhatsApp API built using the Baileys library. This project enables developers to interact with WhatsApp programmatically, supporting features like creating sessions, sending text and media messages, and managing statuses such as "typing." It is designed to run in shared hosting environments, making it accessible for a wide range of use cases.
Features

Session Management: Create, list, check status, close, or delete WhatsApp sessions.
Messaging: Send text messages and media (images, documents, videos, etc.).
Status Control: Simulate "typing" status for a contact.
QR Code Authentication: Generate QR codes for session authentication.
JSON Responses: All API responses, including errors, are returned in JSON format.
Shared Hosting Compatibility: Optimized for environments with limited resources.
SQLite Database: Automatically creates a lightweight database for session management.

Documentation
Full API documentation is available in the docs/index.html file. It includes detailed information on endpoints, parameters, responses, and usage examples. Open the file in a browser to explore the interactive documentation.
Getting Started
Prerequisites

Node.js (for running the backend server)
A shared hosting environment or local server with write permissions
WhatsApp account for scanning QR codes

Installation

Clone the repository:
git clone https://github.com/mariocosttaa/whatsapp-api.git
cd whatsapp-api


Install dependencies:
npm install


Configure folder permissions:

Ensure the public/qrcodes folder has write permissions for storing QR codes.
Verify the SQLite database directory has write permissions.


Start the server:
npm start


Access the API at http://your-server-address.


Usage

Create a Session:
curl -X POST http://your-server-address/api/session/create \
-H "Content-Type: application/json" \
-d '{"sessionName": "my-session"}'

This returns a QR code path for authentication.

Scan the QR Code:Access the QR code at /public/qrcodes/my-session.png and scan it with WhatsApp.

Send a Message:
curl -X POST http://your-server-address/api/message/send \
-H "Content-Type: application/json" \
-d '{"sessionName": "my-session", "phone": "5511999999999", "message": "Hello!"}'



Refer to the documentation (docs/index.html) for more endpoints and examples.
Endpoints

Sessions:

POST /api/session/create: Create a new session.
GET /api/session/{sessionName}/qr: Get QR code for authentication.
GET /api/session/{sessionName}/status: Check session status.
GET /api/session: List all sessions.
POST /api/session/{sessionName}/close: Close a session.
DELETE /api/session/{sessionName}: Delete a session.


Messages:

POST /api/message/send: Send a text message.
POST /api/message/send-media: Send a media file.


Status:

POST /api/status/typing: Send "typing" status.
POST /api/status/stop-typing: Stop "typing" status.



Important Notes

Supported Media Formats: JPEG, PNG, GIF, MP4, PDF, DOC, DOCX, XLS, XLSX, TXT.
File Size Limit: Maximum 10MB for media uploads.
Session Names: Avoid starting names with numbers or special characters.
HTTP Status Codes: Used consistently (e.g., 200, 400, 404).
Database: SQLite database is created automatically on first run.

Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub. Ensure your code follows the project's coding style and includes appropriate tests.
Credits

Built using Baileys © 2025
Developed by Mário Costa

License
This project is licensed under the MIT License. See the LICENSE file for details.
