import express, { Application } from 'express';

import { Connection } from 'typeorm';
import { dbName } from './config';
import Database from './structures/database.structures';

class Server {
  public app: Application;

  public port: number;

  public db!: Connection;

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
      console.log(`App listening on the http://localhost:${this.port}`);
    });
  }
}

export default Server;
