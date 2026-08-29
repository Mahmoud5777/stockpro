import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './User.model';

export interface UserPage {
content: User[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/users';

getAll(page = 0, size = 20, search = ''): Observable<UserPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<UserPage>(this.endpoint, { params });
        }

        getById(id: string): Observable<User> {
            return this.http.get<User>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<User, 'id'>): Observable<User> {
                        return this.http.post<User>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<User>): Observable<User>
                                    {
                                    return this.http.put<User>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }