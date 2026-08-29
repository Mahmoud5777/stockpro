import { Routes } from '@angular/router';

export const UserSiteRoutes: Routes = [
{
path: 'user-sites',
loadComponent: () => import('./list/user-site-list.component').then((m) => m.UserSiteListComponent),
},
{
path: 'user-sites/new',
loadComponent: () => import('./form/user-site-form.component').then((m) => m.UserSiteFormComponent),
},
];