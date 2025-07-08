const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const { emailQueue, queueEvents, setIO } = require('./queue');
const { getStatus, resetStatus, getErrors } = require('./status');

const PORT = process.env.PORT || 3000;

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

// Handle form submission
app.post('/', upload.single('recipients'), async (req, res) => {
  resetStatus();
  const { host, port, user, password, from, subject, message, senderName, messageFormat } = req.body;
  // Validate required fields
  const errors = [];
  if (!host || !host.trim()) errors.push('SMTP Host is required.');
  if (!port || !port.trim()) errors.push('SMTP Port is required.');
  if (!user || !user.trim()) errors.push('SMTP User ID is required.');
  if (!password || !password.trim()) errors.push('SMTP Password is required.');
  if (!from || !from.trim()) errors.push('Sender Email is required.');
  if (!subject || !subject.trim()) errors.push('Subject is required.');
  if (!message || !message.trim()) errors.push('Message is required.');
  if (!req.file) errors.push('Recipients file required.');

  if (errors.length) {
    // If AJAX, send JSON; else, render with error
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(400).json({ errors });
    } else {
      return res.render('index', { formErrors: errors });
    }
  }

  // Parse plain text file for recipients (1 email per line)
  fs.readFile(req.file.path, 'utf8', async (err, data) => {
    if (err) {
      const fileError = 'Error reading recipients file.';
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ errors: [fileError] });
      } else {
        return res.render('index', { formErrors: [fileError] });
      }
    }
    const lines = data.split('\n').map(line => line.trim()).filter(line => line);
    if (!lines.length) {
      const fileError = 'Recipients file is empty or invalid.';
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(400).json({ errors: [fileError] });
      } else {
        return res.render('index', { formErrors: [fileError] });
      }
    }
    for (const to of lines) {
      await emailQueue.add('sendEmail', {
        host: host.trim(),
        port: port.trim(),
        user: user.trim(),
        password: password.trim(),
        to,
        from: from.trim(),
        subject: subject.trim(),
        message: message.trim(),
        senderName: senderName ? senderName.trim() : '',
        messageFormat: messageFormat || 'plain'
      });
    }
    fs.unlinkSync(req.file.path); // Clean up upload
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ success: true });
    } else {
      res.render('index'); // Reload page
    }
  });
});

// Socket.IO for live status
io.on('connection', (socket) => {
  // Send initial status
  socket.emit('status', getStatus());
  socket.emit('errors', getErrors());
});

// Emit status updates on queue events
queueEvents.on('completed', () => {
  io.emit('status', getStatus());
});
queueEvents.on('failed', () => {
  io.emit('status', getStatus());
});
queueEvents.on('waiting', () => {
  io.emit('status', getStatus());
});

setIO(io);

http.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// 404 handler (should be last)
app.use((req, res) => {
  res.status(404).render('404');
});
