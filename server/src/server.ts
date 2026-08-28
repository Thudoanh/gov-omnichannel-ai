import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, () => console.info(`Gov Omnichannel API listening on http://localhost:${port}`));

const shutdown = () => server.close(() => void prisma.$disconnect().finally(() => process.exit(0)));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
