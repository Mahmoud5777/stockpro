import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HasPermissionDirective } from '../../../core/auth/has-permission.directive';
import { GroupService } from '../Group.service';

@Component({
selector: 'app-group-list',
standalone: true,
imports: [CommonModule, FormsModule, HasPermissionDirective],
templateUrl: './group-list.component.html',
styleUrl: './group-list.component.scss',
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupListComponent {
readonly service = inject(GroupService);
page = 0;
size = 20;
search = '';
data$ = this.service.getAll(this.page, this.size, this.search);

searchItems(): void {
this.page = 0;
this.data$ = this.service.getAll(this.page, this.size, this.search);
}
}