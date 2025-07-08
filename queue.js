require('dotenv').config();
const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const { sendMail } = require('./mailer');
const { updateStatus, addError } = require('./status');

const redisOptions = {
  maxRetriesPerRequest: null, // Required for BullMQ
};

const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis(redisOptions);

const emailQueue = new Queue('emailQueue', { connection });
const queueEvents = new QueueEvents('emailQueue', { connection });

let ioInstance = null;
function setIO(io) { ioInstance = io; }

// Worker to process email jobs
const worker = new Worker('emailQueue', async job => {
  try {
    await sendMail(job.data);
    updateStatus('success');
    return true;
  } catch (err) {
    updateStatus('retry');
    throw err; // BullMQ will handle retry
  }
}, {
  connection,
  attempts: 3, // Retry up to 3 times
  backoff: {
    type: 'exponential',
    delay: 5000 // 5 seconds
  }
});

worker.on('failed', (job, err) => {
  updateStatus('failed');
  addError({ to: job.data.to, error: err.message });
  if (ioInstance) ioInstance.emit('errors', require('./status').getErrors());
  console.error('Email job failed:', err);
});

module.exports = { emailQueue, queueEvents, setIO }; 