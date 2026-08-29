import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupeRole } from './GroupeRole.model';

export interface GroupeRolePage {
content: GroupeRole[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class GroupeRoleService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/group-roles';

getAll(page = 0, size = 20, search = ''): Observable<GroupeRolePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<GroupeRolePage>(this.endpoint, { params });
        }

        getById(id: string): Observable<GroupeRole> {
            return this.http.get<GroupeRole>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<GroupeRole, 'id'>): Observable<GroupeRole> {
                        return this.http.post<GroupeRole>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<GroupeRole>): Observable<GroupeRole>
                                    {
                                    return this.http.put<GroupeRole>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }