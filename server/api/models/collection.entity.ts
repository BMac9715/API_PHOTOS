import { ResponseAlbum } from "./album.entity";
import { ResponsePagination } from "./pagination.entity";
import { Photo, ResponsePhoto } from "./photo.entity";
import { User } from "./user.entity";

export interface CollectionPhotos {
    photos: ResponsePhoto[];
    albums: ResponseAlbum[];
    users:  User[];
    total:  number;
}

export interface CollectionResponse {
    items:      Photo[];
    pagination: ResponsePagination;
}