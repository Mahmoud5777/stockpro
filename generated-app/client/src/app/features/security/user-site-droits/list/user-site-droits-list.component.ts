import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HasPermissionDirective } from '../../../core/auth/has-permission.directive';
import { UserSiteDroitsService } from '../UserSiteDroits.service';

@Component({
selector: 'app-user-site-droits-list',
standalone: true,
imports: [CommonModule, FormsModule, HasPermissionDirective],
templateUrl: './user-site-droits-list.component.html',
styleUrl: './user-site-droits-list.component.scss',
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSiteDroitsListComponent {
readonly service = inject(UserSiteDroitsService);
page = 0;
size = 20;
search = '';
data$ = this.service.getAll(this.page, this.size, this.search);

searchItems(): void {
this.page = 0;
this.data$ = this.service.getAll(this.page, this.size, this.search);
}
}