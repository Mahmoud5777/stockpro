import { Routes } from '@angular/router';

export const SiteRoutes: Routes = [
{
path: 'sites',
loadComponent: () => import('./list/site-list.component').then((m) => m.SiteListComponent),
},
{
path: 'sites/new',
loadComponent: () => import('./form/site-form.component').then((m) => m.SiteFormComponent),
},
];