import 'dotenv/config';
import app from './app';
import logger from './logger';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.listen(PORT, () => {
  logger.info(`ShirtScout backend running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});
