import express, { Application } from 'express';

import { Connection } from 'typeorm';
import { RecaptchaV2 } from 'express-recaptcha/dist';
import { RateLimiterPostgres } from 'rate-limiter-flexible';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { Pool } from 'pg';
import {
  dbName, maxConsecutiveFailsByUsernameAndIP,
  maxWrongAttemptsByIPPerDay, recaptchaPri, recaptchaPub,
} from './config';
import Database from './structures/database.structures';

class Server {
  public app: Application;

  public port: number;

  public db!: Connection;

  public recaptcha!: RecaptchaV2;

  public limiterSlowBruteByIP!: RateLimiterPostgres;

  public limiterConsecutiveFailsByUsernameAndIP!: RateLimiterPostgres;

  constructor(appInit: { port: number; middleWares: any; controllers: any; }) {
    this.app = express();
    this.port = appInit.port;
    this.init(appInit.middleWares, appInit.controllers);
  }

  private async init(middleWares: any, controllers: any): Promise<void> {
    this.middlewares(middleWares);
    this.routes(controllers);

    this.db = Database.get(dbName);
    await this.db.connect();
    await this.db.synchronize();

    this.recaptcha = new RecaptchaV2(recaptchaPub, recaptchaPri);

    const pool: Pool = (this.db.driver as PostgresDriver).master;

    this.limiterSlowBruteByIP = new RateLimiterPostgres({
      storeClient: pool,
      keyPrefix: 'login_fail_ip_per_day',
      points: maxWrongAttemptsByIPPerDay,
      duration: 60 * 60 * 24,
      blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
    });

    this.limiterConsecutiveFailsByUsernameAndIP = new RateLimiterPostgres({
      storeClient: pool,
      keyPrefix: 'login_fail_consecutive_username_and_ip',
      points: maxConsecutiveFailsByUsernameAndIP,
      duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
      blockDuration: 60 * 60, // Block for 1 hour
    });
  }

  private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }

  private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App with process id ${process.pid} listening on http://localhost:${this.port}`);
    });
  }
}

export default Server;
