import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Site } from './Site.model';

export interface SitePage {
content: Site[];
totalElements: number;
totalPages: number;
size: number;
number: number;
}

@Injectable({ providedIn: 'root' })
export class SiteService {
private readonly http = inject(HttpClient);
private readonly endpoint = '/api/sites';

getAll(page = 0, size = 20, search = ''): Observable<SitePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<SitePage>(this.endpoint, { params });
        }

        getById(id: string): Observable<Site> {
            return this.http.get<Site>(`${this.endpoint}/${id}`);
                }

                create(value: Omit<Site, 'id'>): Observable<Site> {
                        return this.http.post<Site>(this.endpoint, value);
                            }

                            update(id: string, value: Partial<Site>): Observable<Site>
                                    {
                                    return this.http.put<Site>(`${this.endpoint}/${id}`, value);
                                        }

                                        delete(id: string): Observable<void> {
                                            return this.http.delete<void>(`${this.endpoint}/${id}`);
                                                }
                                                }