import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../User.service';

@Component({
selector: 'app-user-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './user-form.component.html',
})
export class UserFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(UserService);

readonly form = this.formBuilder.nonNullable.group({
username: ['', [Validators.required]],
email: ['', [Validators.required]],
password: ['', [Validators.required]],
prenom: ['', []],
nom: ['', []],
estActif: ['', []],
siteId: [''],
});

submit(): void {
if (this.form.invalid) {
this.form.markAllAsTouched();
return;
}
this.service.create(this.form.getRawValue()).subscribe();
}
}