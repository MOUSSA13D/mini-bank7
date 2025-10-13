import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import agentsRouter from './routes/agents.js';
import authRouter from './routes/auth.js';
import { getCollection } from './db.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.get('/', (_req, res) => res.json({ ok: true, service: 'mini-bank-api' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/health/db', async (_req, res) => {
  try {
    const col = await getCollection(process.env.COLLECTION_NAME || 'agents');
    // simple call to ensure connectivity
    await col.estimatedDocumentCount();
    res.json({ ok: true, db: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, db: false, error: 'db_connection_failed' });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/agents', agentsRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
