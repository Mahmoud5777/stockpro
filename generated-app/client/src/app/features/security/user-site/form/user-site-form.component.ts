import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSiteService } from '../UserSite.service';

@Component({
selector: 'app-user-site-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './user-site-form.component.html',
})
export class UserSiteFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(UserSiteService);

readonly form = this.formBuilder.nonNullable.group({
roleUtilisateur: ['', []],
dateAffectation: ['', []],
userId: ['', [Validators.required]],
siteId: ['', [Validators.required]],
});

submit(): void {
if (this.form.invalid) {
this.form.markAllAsTouched();
return;
}
this.service.create(this.form.getRawValue()).subscribe();
}
}