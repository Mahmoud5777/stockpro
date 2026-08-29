import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HasPermissionDirective } from '../../../core/auth/has-permission.directive';
import { UserSiteService } from '../UserSite.service';

@Component({
selector: 'app-user-site-list',
standalone: true,
imports: [CommonModule, FormsModule, HasPermissionDirective],
templateUrl: './user-site-list.component.html',
styleUrl: './user-site-list.component.scss',
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSiteListComponent {
readonly service = inject(UserSiteService);
page = 0;
size = 20;
search = '';
data$ = this.service.getAll(this.page, this.size, this.search);

searchItems(): void {
this.page = 0;
this.data$ = this.service.getAll(this.page, this.size, this.search);
}
}