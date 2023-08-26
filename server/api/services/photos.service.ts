import { Observable, from, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import {  map, mergeMap, switchMap, toArray } from 'rxjs/operators';

import { Album, ResponseAlbum } from '../models/album.entity';
import { CollectionPhotos, CollectionResponse } from '../models/collection.entity';
import { PayloadPhoto, Photo, ResponsePhoto } from '../models/photo.entity';
import { Pagination, ResponsePagination } from '../models/pagination.entity';
import { User } from '../models/user.entity';

import AlbumService from './album.service';
import UsersService from './users.service';
import L from '../../common/logger';

export class PhotosService {

  private _baseUri = process.env.BASE_API_PHOTOS;

  getAll(filters: PayloadPhoto, pag: Pagination): Observable<CollectionResponse> {
    L.info(`Getting photos filterd by: ${JSON.stringify(filters)}`);

    if(filters.title && filters.album && filters.email) {
      return this._getPhotosTitleAlbumTitleUserEmail(filters.title, filters.album, filters.email, pag)
            .pipe(
              map(coll => this._buildResponse(coll, pag))
            );
    }

    if(filters.title && filters.email) {
      return this._getPhotosTitleUserEmail(filters.title, filters.email, pag)
              .pipe(
                map(coll => this._buildResponse(coll, pag))
              );
    }

    if(filters.title && filters.album) {
      return this._getPhotosTitleAlbumTitle(filters.title, filters.album, pag)
              .pipe(
                map(coll => this._buildResponse(coll, pag))
              );
    }

    if(filters.album && filters.email) {
      return this._getPhotosAlbumTitleUserEmail(filters.album, filters.email, pag)
              .pipe(
                map(coll => this._buildResponse(coll, pag))
              );
    }

    if(filters.email){
      return this._getPhotosUserEmail(filters.email, pag)
              .pipe(
                map(coll => this._buildResponse(coll, pag))
              );
    }

    if(filters.album){
      return this._getPhotosAlbumTitle(filters.album, pag)
              .pipe(
                map(coll => this._buildResponse(coll, pag))
              );
    }

    if(filters.title) {
      return this._getPhotosTitle(pag, filters.title)
              .pipe(
                map(coll => this._buildResponse(coll, pag))
              )
    }

    return this._getPhotosTitle(pag)
            .pipe(
              map(coll => this._buildResponse(coll, pag))
            )
  }

  getPhotos(title?: string, albums?: Number[]): Observable<ResponsePhoto[]> {
    L.info('Getting photos by title');

    return fromFetch(`${this._baseUri}/photos`)
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
              map(photos => photos as ResponsePhoto[]),
              map(photos => albums && albums.length > 0 ? photos.filter(photo => albums.includes(photo.albumId)) : photos),
              map(photos => title ? photos.filter(photo => photo.title.includes(title)) : photos)
            )
  }

  getById(id: number): Observable<Photo> {
    L.info(`Fetch photo with id ${id}`);

    return fromFetch(`${this._baseUri}/photos/${id}`)
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
            map(data => data as ResponsePhoto),
            mergeMap((photo: ResponsePhoto) => {
              return AlbumService.getById(photo.albumId)
                      .pipe(
                        mergeMap((album: ResponseAlbum) => {
                          return UsersService.getById(album.userId)
                                  .pipe(
                                    map((user: User) => {
                                      const data: Photo = {
                                        id: photo.id,
                                        title: photo.title,
                                        url: photo.url,
                                        thumbnailUrl: photo.thumbnailUrl,
                                        album: {
                                          id: album.id,
                                          title: album.title,
                                          user: user
                                        }
                                      }

                                      return data;
                                    })
                                  )
                        })
                      )
            })
          )
  }

  private _buildResponse(coll: CollectionPhotos, pag: Pagination): CollectionResponse {
    const albums: Record<number, Album> = {}

    coll.albums?.forEach(albm =>{
      const user = coll.users?.find(u => u.id == albm.userId);
      if(user){
        albums[albm.id] = { id: albm.id, title: albm.title, user}
      }
    });

    const items: Photo[] = coll.photos.map(photo => {
      const album = albums[photo.albumId];
      return { id: photo.id, title: photo.title, url: photo.url, thumbnailUrl: photo.thumbnailUrl, album } as Photo
    });

    const currentPage = (pag.offset / pag.limit) + 1

    const pagination: ResponsePagination = {
      page: currentPage,
      totalItems: coll.total,
      perPage: pag.limit,
      totalPages: Math.ceil(coll.total / pag.limit),
      prevPage: currentPage - 1,
      nextPage: currentPage + 1
    }

    return { items, pagination }
  }

  private _getPhotosTitle(pag: Pagination, title?: string): Observable<CollectionPhotos> {
    return this.getPhotos(title)
            .pipe(
              //Pagination
              map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})), 
              //Get Albumns by Unique id
              mergeMap(({total, photos}) => {
                return from([ ... new Set(photos.map(p => p.albumId)) ])
                       .pipe(
                         mergeMap(album => AlbumService.getById(album)),
                         toArray(),
                         map(albums => ({ total, photos, albums }) as CollectionPhotos)
                       )
              }),
              //Get Users by Unique id
              mergeMap((coll: CollectionPhotos) => {
                return from([ ... new Set(coll.albums ? coll.albums.map((a => a.userId)) : []) ])
                .pipe(
                  mergeMap(user => UsersService.getById(user)),
                  toArray(),
                  map(users => ({ ...coll, users }) as CollectionPhotos)
                )
              })
            )
  }

  private _getPhotosAlbumTitle(title: string, pag: Pagination): Observable<CollectionPhotos> {
    return AlbumService.getAlbums(title)
            .pipe(
              //Get Users by Unique id
              mergeMap((albums: ResponseAlbum[]) => {
                return from([ ... new Set(albums.map(a => a.userId)) ])
                .pipe(
                  mergeMap(user => UsersService.getById(user)),
                  toArray(),
                  map(users => ({ albums, users }) as CollectionPhotos)
                )
              }),
              //Get Photos by Unique albumId
              mergeMap((coll: CollectionPhotos) => {
                if(coll.albums.length == 0 || coll.users.length == 0) {
                  return of({ photos: [], albums: [], users: [], total: 0 } as CollectionPhotos);
                }
  
                return this.getPhotos(undefined, [ ... new Set(coll.albums.map(a => a.id)) ])
                        .pipe(
                          //Pagination
                          map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})), 
                          map(({total, photos}) => ({ ...coll, photos, total }) as CollectionPhotos)
                        )
              })
            )
  }

  private _getPhotosUserEmail(email: string, pag: Pagination): Observable<CollectionPhotos> {
    return UsersService.getUsers(email)
            .pipe(
              //Get Albums by Unique userId
              mergeMap((users: User[]) => {
                return AlbumService.getAlbums(undefined, [ ... new Set(users.map(u => u.id)) ])
                        .pipe(
                          map(albums => ({ albums, users }) as CollectionPhotos)
                        )
              }),
              //Get Photos by Unique albumId
              mergeMap((coll: CollectionPhotos) => {
                if(coll.albums.length == 0 || coll.users.length == 0) {
                  return of({ photos: [], albums: [], users: [], total: 0 } as CollectionPhotos);
                }
  
                return this.getPhotos(undefined, [ ... new Set(coll.albums.map(a => a.id)) ])
                        .pipe(
                          //Pagination
                          map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})),
                          map(({total, photos}) => ({ ...coll, photos, total }) as CollectionPhotos)
                        )
              })
            )
  }

  private _getPhotosTitleAlbumTitle(title: string, album: string, pag: Pagination): Observable<CollectionPhotos> {
    return AlbumService.getAlbums(album)
          .pipe(
            //Get Users by Unique id
            mergeMap((albums: ResponseAlbum[]) => {
              return from([ ... new Set(albums.map(a => a.userId)) ])
              .pipe(
                mergeMap(user => UsersService.getById(user)),
                toArray(),
                map(users => ({ albums, users }) as CollectionPhotos)
              )
            }),
            //Get Photos by Unique albumId and title
            mergeMap((coll: CollectionPhotos) => {
              if(coll.albums.length == 0 || coll.users.length == 0) {
                return of({ photos: [], albums: [], users: [], total: 0 } as CollectionPhotos);
              }

              return this.getPhotos(title, [ ... new Set(coll.albums.map(a => a.id)) ])
                      .pipe(
                        //Pagination
                        map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})),
                        map(({total, photos}) => ({ ...coll, photos, total }) as CollectionPhotos)
                      )
            })
          )
  }

  private _getPhotosTitleUserEmail(title: string, email: string, pag: Pagination): Observable<CollectionPhotos> {
    return UsersService.getUsers(email)
          .pipe(
            //Get Albums by Unique userId
            mergeMap((users: User[]) => {
              return AlbumService.getAlbums(undefined, [ ... new Set(users.map(u => u.id)) ])
                      .pipe(
                        map(albums => ({ albums, users }) as CollectionPhotos)
                      )
            }),
            //Get Photos by Unique albumId and title
            mergeMap((coll: CollectionPhotos) => {
              if(coll.albums.length == 0 || coll.users.length == 0) {
                return of({ photos: [], albums: [], users: [], total: 0 } as CollectionPhotos);
              }

              return this.getPhotos(title, [ ... new Set(coll.albums.map(a => a.id)) ])
                      .pipe(
                        //Pagination
                        map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})),
                        map(({total, photos}) => ({ ...coll, photos, total }) as CollectionPhotos)
                      )
            })
          )
  }

  private _getPhotosAlbumTitleUserEmail(album:string, email:string, pag: Pagination): Observable<CollectionPhotos> {
    return UsersService.getUsers(email)
          .pipe(
            //Get Albums by Unique userId and Album Title
            mergeMap((users: User[]) => {
              return AlbumService.getAlbums(album, [ ... new Set(users.map(u => u.id)) ])
                      .pipe(
                        map(albums => ({ albums, users }) as CollectionPhotos)
                      )
            }),
            //Get Photos by Unique albumId
            mergeMap((coll: CollectionPhotos) => {
              if(coll.albums.length == 0 || coll.users.length == 0) {
                return of({ photos: [], albums: [], users: [], total: 0 } as CollectionPhotos);
              }

              return this.getPhotos(undefined, [ ... new Set(coll.albums.map(a => a.id)) ])
                      .pipe(
                        //Pagination
                        map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})),
                        map(({total, photos}) => ({ ...coll, photos, total }) as CollectionPhotos)
                      )
            })
          )      
  }

  private _getPhotosTitleAlbumTitleUserEmail(title: string, album:string, email:string, pag: Pagination): Observable<CollectionPhotos> {
    return UsersService.getUsers(email)
          .pipe(
            //Get Albums by Unique userId and Album Title
            mergeMap((users: User[]) => {
              return AlbumService.getAlbums(album, [ ... new Set(users.map(u => u.id)) ])
                      .pipe(
                        map(albums => ({ albums, users }) as CollectionPhotos)
                      )
            }),
            //Get Photos by Unique albumId
            mergeMap((coll: CollectionPhotos) => {
              if(coll.albums.length == 0 || coll.users.length == 0) {
                return of({ photos: [], albums: [], users: [], total: 0} as CollectionPhotos);
              }

              return this.getPhotos(title, [ ... new Set(coll.albums.map(a => a.id)) ])
                      .pipe(
                        //Pagination
                        map(photos => ({ total: photos.length, photos: photos.slice(pag.offset, pag.offset + pag.limit)})),
                        map(({total, photos}) => ({ ...coll, photos, total }) as CollectionPhotos)
                      )
            })
          )  
  }
}

export default new PhotosService();
