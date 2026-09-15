import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cold-connect-backend' });
});

app.get('/', (_req, res) => {
  res.json({ service: 'cold-connect-backend', phase: 'phase-2-not-implemented' });
});

app.listen(port, () => {
  console.log(`[cold-connect-backend] listening on :${port}`);
});