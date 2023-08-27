import { Request, Response } from 'express';
import PhotosService from '../../services/photos.service';
import L from '../../../common/logger';
import { firstValueFrom } from 'rxjs';
import { PayloadPhoto } from 'server/api/models/photo.entity';

export class Controller {

    all(req: Request, res: Response): void {
        const limit = req.query.limit ? Number.parseInt(req.query.limit.toString()) : 25;
        const offset = req.query.offset ? Number.parseInt(req.query.offset.toString()) : 0;

        if(!(limit >= 0)){
            res.status(500).send({ message: `The entered value is invalid. "limit": "${limit}"` });
            return;
        }

        if(!(offset >= 0)){
            res.status(500).send({ message: `The entered value is invalid. "offset": "${offset}"` });
            return;
        }

        const filters: PayloadPhoto = { };
        filters.title = req.query['title'] ? req.query['title'].toString() : undefined;
        filters.album = req.query['album.title'] ? req.query['album.title'].toString() : undefined;
        filters.email = req.query['album.user.email'] ? req.query['album.user.email'].toString() : undefined;

        firstValueFrom(PhotosService.getAll(filters, { limit, offset }))
        .then(
            data => {
                L.info(`Data length sent: ${data.items.length}`);
                res.status(200).json(data);
            }
        )
        .catch(
            err => {
                L.error(err);
                res.status(500).send(err);
            }
        )
    }

    byId(req: Request, res: Response): void {
        const id = Number.parseInt(req.params['id']);

        firstValueFrom(PhotosService.getById(id))
        .then(
            data => res.status(200).json(data)
        )
        .catch(
            err => {
                console.log(err);
                res.status(500).send(err);
            }
        );
    }
}
export default new Controller();
