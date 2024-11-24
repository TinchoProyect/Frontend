import sql from 'mssql';
import { logger } from '../config/logger';

const config: sql.config = {
  server: 'SERVIDORA\\SQLEXPRESS',
  database: 'SaldoInicialDB',
  user: 'LamdaDatosConsolidados',
  password: 'Lamda2024!',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool: sql.ConnectionPool | null = null;

export const getConnection = async (): Promise<sql.ConnectionPool> => {
  try {
    if (pool) {
      return pool;
    }

    pool = await new sql.ConnectionPool(config).connect();
    logger.info('Database connection established successfully');
    return pool;
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw new Error('Database connection failed');
  }
};

export const closeConnection = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      logger.info('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw new Error('Failed to close database connection');
  }
};