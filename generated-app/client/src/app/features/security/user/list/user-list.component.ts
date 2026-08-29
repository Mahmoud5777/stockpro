import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HasPermissionDirective } from '../../../core/auth/has-permission.directive';
import { UserService } from '../User.service';

@Component({
selector: 'app-user-list',
standalone: true,
imports: [CommonModule, FormsModule, HasPermissionDirective],
templateUrl: './user-list.component.html',
styleUrl: './user-list.component.scss',
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
readonly service = inject(UserService);
page = 0;
size = 20;
search = '';
data$ = this.service.getAll(this.page, this.size, this.search);

searchItems(): void {
this.page = 0;
this.data$ = this.service.getAll(this.page, this.size, this.search);
}
}