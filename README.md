# Email Marketing App

A modern, queue-based bulk email sender built with Node.js, Express, BullMQ, Redis (Upstash compatible), and Socket.IO. Supports live status tracking, robust error handling, and custom SMTP credentials.

---

## Features
- Upload a text file with one recipient email per line
- Enter SMTP credentials, sender name/email, subject, and message
- Emails are queued and sent with retry logic (BullMQ + Redis)
- Live tracking of sent, failed, and retried emails
- All errors (form, file, and per-email) are shown on the frontend
- Custom 404 page
- Ready for deployment on Render, Railway, or any Node.js host

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```
# For Upstash or managed Redis
REDIS_URL="rediss://<user>:<password>@<host>:<port>"

# (Optional) For self-hosted Redis, use these instead:
# REDIS_HOST=127.0.0.1
# REDIS_PORT=6379
# REDIS_PASSWORD=
```

### 4. Start Redis (if self-hosted)
```bash
redis-server
```

### 5. Start the App
```bash
node app.js
```

The app will run on [http://localhost:3000](http://localhost:3000)

---

## Usage
1. Open the app in your browser.
2. Upload a `.txt` file with one email per line.
3. Enter SMTP credentials, sender name/email, subject, and message.
4. Click **Send Emails**.
5. Watch live status and error tracking as emails are sent.

---

## Deployment
- **Render:** Connect your repo, set `REDIS_URL` in the dashboard, and use `node app.js` as the start command.
- **Other platforms:** Any Node.js host with Redis support will work.

---

## Environment Variables
| Name         | Description                        | Example/Default |
|--------------|------------------------------------|-----------------|
| REDIS_URL    | Redis connection string (Upstash)  | `rediss://...`  |
| REDIS_HOST   | Redis host (self-hosted)           | `127.0.0.1`     |
| REDIS_PORT   | Redis port (self-hosted)           | `6379`          |
| REDIS_PASSWORD | Redis password (self-hosted)     | (blank)         |

---

## Notes
- For best reliability, use a Redis instance with `noeviction` policy (not required for short-term/testing).
- All errors are shown live on the frontend for easy debugging.
- For production, consider using a process manager like `pm2`.

---

## License
MIT
