import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HasPermissionDirective } from '../../../core/auth/has-permission.directive';
import { SiteService } from '../Site.service';

@Component({
selector: 'app-site-list',
standalone: true,
imports: [CommonModule, FormsModule, HasPermissionDirective],
templateUrl: './site-list.component.html',
styleUrl: './site-list.component.scss',
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteListComponent {
readonly service = inject(SiteService);
page = 0;
size = 20;
search = '';
data$ = this.service.getAll(this.page, this.size, this.search);

searchItems(): void {
this.page = 0;
this.data$ = this.service.getAll(this.page, this.size, this.search);
}
}