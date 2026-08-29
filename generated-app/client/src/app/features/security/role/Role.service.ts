import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from './Role.model';

export interface RolePage {
content: Role[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/roles';

getAll(page = 0, size = 20, search = ''): Observable<RolePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<RolePage>(this.endpoint, { params });
        }

        getById(id: string): Observable<Role> {
            return this.http.get<Role>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<Role, 'id'>): Observable<Role> {
                        return this.http.post<Role>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<Role>): Observable<Role>
                                    {
                                    return this.http.put<Role>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }