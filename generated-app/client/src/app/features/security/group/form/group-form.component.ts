import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../Group.service';

@Component({
selector: 'app-group-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './group-form.component.html',
})
export class GroupFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(GroupService);

readonly form = this.formBuilder.nonNullable.group({
nom: ['', [Validators.required]],
code: ['', [Validators.required]],
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