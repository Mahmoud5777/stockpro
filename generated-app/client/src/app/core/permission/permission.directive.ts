import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appPermission]', standalone: true })
export class PermissionDirective {
@Input() set appPermission(allowed: boolean) {
this.view.clear();
if (allowed) this.view.createEmbeddedView(this.template);
}
constructor(private template: TemplateRef<unknown>, private view: ViewContainerRef) {}
    }