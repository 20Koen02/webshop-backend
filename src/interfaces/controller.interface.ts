import { Router } from 'express';

interface ControllerInterface {
  router: Router,
  initRoutes(): any
}

export default ControllerInterface;
