import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router';
import photosRouter from './api/controllers/photos/router';

export default function routes(app: Application): void {
  app.use('/externalapi/examples', examplesRouter);
  app.use('/externalapi/photos', photosRouter);
}
