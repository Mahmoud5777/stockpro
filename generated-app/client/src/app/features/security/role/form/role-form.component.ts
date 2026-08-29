import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../Role.service';

@Component({
selector: 'app-role-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './role-form.component.html',
})
export class RoleFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(RoleService);

readonly form = this.formBuilder.nonNullable.group({
codeRole: ['', [Validators.required]],
libelle: ['', [Validators.required]],
description: ['', []],
});

submit(): void {
if (this.form.invalid) {
this.form.markAllAsTouched();
return;
}
this.service.create(this.form.getRawValue()).subscribe();
}
}