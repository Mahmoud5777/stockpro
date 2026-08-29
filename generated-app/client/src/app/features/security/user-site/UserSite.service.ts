import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSite } from './UserSite.model';

export interface UserSitePage {
content: UserSite[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class UserSiteService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/user-sites';

getAll(page = 0, size = 20, search = ''): Observable<UserSitePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<UserSitePage>(this.endpoint, { params });
        }

        getById(id: string): Observable<UserSite> {
            return this.http.get<UserSite>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<UserSite, 'id'>): Observable<UserSite> {
                        return this.http.post<UserSite>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<UserSite>): Observable<UserSite>
                                    {
                                    return this.http.put<UserSite>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }