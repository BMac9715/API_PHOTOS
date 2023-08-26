import { Observable, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map, switchMap } from 'rxjs/operators';
import { ResponseAlbum } from '../models/album.entity';
import L from '../../common/logger';

export class AlbumService {

  private _baseUri = process.env.BASE_API_PHOTOS;

  getAlbums(title?: string, users?: number[]): Observable<ResponseAlbum[]> {
    L.info('Getting albums filtered by title and usersId');

    return fromFetch(`${this._baseUri}/albums`)
            .pipe(
              switchMap(response => {
                if (response.ok) {
                  // OK return data
                  return response.json();
                } else {
                  // Server is returning a status requiring the client to try something else.
                  return of({ error: true, message: `Error ${ response.status }` });
                }
              }),
              map((res) => res as ResponseAlbum[]),
              map((albums) => users && users.length > 0 ? albums.filter(albm => users.includes(albm.userId)) : albums),
              map((albums) => title ? albums.filter(albm => albm.title.includes(title)) : albums)
            )
  }

  getById(id: number): Observable<ResponseAlbum> {
    L.info(`Fetch album with id ${id}`);

    return fromFetch(`${this._baseUri}/albums/${id}`)
    .pipe(
        switchMap(response => {
          if (response.ok) {
            // OK return data
            return response.json();
          } else {
            // Server is returning a status requiring the client to try something else.
            return of({ error: true, message: `Error ${ response.status }` });
          }
        }),
        map((res: any) => res as ResponseAlbum)
    )
  }
}

export default new AlbumService();
