import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteService } from '../Site.service';

@Component({
selector: 'app-site-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule],
templateUrl: './site-form.component.html',
})
export class SiteFormComponent {
private readonly formBuilder = inject(FormBuilder);
private readonly service = inject(SiteService);

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