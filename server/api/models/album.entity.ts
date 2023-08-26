import { User } from "./user.entity";

export interface ResponseAlbum {
    userId: number;
    id:     number;
    title:  string;
}

export interface Album {
    id:    number;
    title: string;
    user:  User;
}