import { Routes } from '@angular/router';

export const UserRoutes: Routes = [
{
path: 'users',
loadComponent: () => import('./list/user-list.component').then((m) => m.UserListComponent),
},
{
path: 'users/new',
loadComponent: () => import('./form/user-form.component').then((m) => m.UserFormComponent),
},
];