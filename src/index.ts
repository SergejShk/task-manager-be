import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import dotenv from 'dotenv';

import App from './app';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const STAGE = process.env.STAGE;
const DATABASE_URL = process.env.DATABASE_URL;

const serverStart = async () => {
  try {
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: true,
    });
    const db = drizzle(pool, {
      logger: STAGE === 'LOCAL' ? true : false,
    });

    // migrations

    // dbs

    // services

    // middlewares

    //controllers

    const app = new App(PORT, []);

    app.listen();
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};

serverStart();
