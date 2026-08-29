import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSiteDroits } from './UserSiteDroits.model';

export interface UserSiteDroitsPage {
content: UserSiteDroits[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class UserSiteDroitsService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/user-site-droits';

getAll(page = 0, size = 20, search = ''): Observable<UserSiteDroitsPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<UserSiteDroitsPage>(this.endpoint, { params });
        }

        getById(id: string): Observable<UserSiteDroits> {
            return this.http.get<UserSiteDroits>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<UserSiteDroits, 'id'>): Observable<UserSiteDroits> {
                        return this.http.post<UserSiteDroits>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<UserSiteDroits>): Observable<UserSiteDroits>
                                    {
                                    return this.http.put<UserSiteDroits>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }