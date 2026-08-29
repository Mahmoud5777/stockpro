import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HasPermissionDirective } from '../../../core/auth/has-permission.directive';
import { RoleService } from '../Role.service';

@Component({
selector: 'app-role-list',
standalone: true,
imports: [CommonModule, FormsModule, HasPermissionDirective],
templateUrl: './role-list.component.html',
styleUrl: './role-list.component.scss',
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListComponent {
readonly service = inject(RoleService);
page = 0;
size = 20;
search = '';
data$ = this.service.getAll(this.page, this.size, this.search);

searchItems(): void {
this.page = 0;
this.data$ = this.service.getAll(this.page, this.size, this.search);
}
}