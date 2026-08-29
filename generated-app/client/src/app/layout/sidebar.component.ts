import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'app-sidebar', standalone: true, imports: [RouterLink], template: `<nav aria-label="Navigation">
    <a routerLink="/">Accueil</a><a routerLink="/user">Utilisateurs</a><a routerLink="/site">Sites</a><a routerLink="/role">Rôles</a><a routerLink="/group">Groupes</a><a routerLink="/user-site">User Sites</a><a routerLink="/groupe-role">Group Roles</a><a routerLink="/user-site-droits">User Site Droits</a>
</nav>` })
export class SidebarComponent {}