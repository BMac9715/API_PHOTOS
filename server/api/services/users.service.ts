import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import L from '../../common/logger';
import { User } from '../models/user.entity';
import { fromFetch } from 'rxjs/fetch';

export class UsersService {

  private _baseUri = process.env.BASE_API_PHOTOS;

  getUsers(email?:string, ids?:number[]): Observable<User[]> {
    L.info('Getting users filter by email');

    return fromFetch(`${this._baseUri}/users`)
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
              map(users => users as User[]),
              map(users => ids && ids.length > 0 ? users.filter(usr => ids.includes(usr.id)) : users),
              map(users => email ? users.filter(usr => usr.email.toLowerCase() == email.toLowerCase()) : users)
            );
  }

  getById(id: number): Observable<User> {
    L.info(`Fetch user with id ${id}`);

    return fromFetch(`${this._baseUri}/users/${id}`)
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
              map((res: any) => res as User)
            )
  }
}

export default new UsersService();
