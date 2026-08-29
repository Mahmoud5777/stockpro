import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSiteDroitsService } from '../UserSiteDroits.service';

@Component({
selector: 'app-user-site-droits-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './user-site-droits-form.component.html',
})
export class UserSiteDroitsFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(UserSiteDroitsService);

readonly form = this.formBuilder.nonNullable.group({
codeDroit: ['', [Validators.required]],
libelleDroit: ['', [Validators.required]],
estExporte: ['', []],
userSiteId: ['', [Validators.required]],
roleId: ['', [Validators.required]],
});

submit(): void {
if (this.form.invalid) {
this.form.markAllAsTouched();
return;
}
this.service.create(this.form.getRawValue()).subscribe();
}
}