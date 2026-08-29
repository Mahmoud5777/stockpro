import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Group } from './Group.model';

export interface GroupPage {
content: Group[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/groups';

getAll(page = 0, size = 20, search = ''): Observable<GroupPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<GroupPage>(this.endpoint, { params });
        }

        getById(id: string): Observable<Group> {
            return this.http.get<Group>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<Group, 'id'>): Observable<Group> {
                        return this.http.post<Group>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<Group>): Observable<Group>
                                    {
                                    return this.http.put<Group>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }