import { Routes } from '@angular/router';

export const GroupRoutes: Routes = [
{
path: 'groups',
loadComponent: () => import('./list/group-list.component').then((m) => m.GroupListComponent),
},
{
path: 'groups/new',
loadComponent: () => import('./form/group-form.component').then((m) => m.GroupFormComponent),
},
];