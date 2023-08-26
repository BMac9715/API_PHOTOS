import { Album } from "./album.entity";

export interface ResponsePhoto {
    albumId:      number;
    id:           number;
    title:        string;
    url:          string;
    thumbnailUrl: string;
}

export interface Photo {
    id:           number;
    title:        string;
    url:          string;
    thumbnailUrl: string;
    album:        Album;
}

export interface PayloadPhoto {
    title?: string;
    album?: string;
    email?: string;
}