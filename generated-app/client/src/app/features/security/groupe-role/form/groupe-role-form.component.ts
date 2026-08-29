import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupeRoleService } from '../GroupeRole.service';

@Component({
selector: 'app-groupe-role-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './groupe-role-form.component.html',
})
export class GroupeRoleFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(GroupeRoleService);

readonly form = this.formBuilder.nonNullable.group({
groupId: ['', [Validators.required]],
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