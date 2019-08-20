import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { SecurityService } from './security.service';

@Directive({
  selector: '[rbac-permission]'
})

export class RbacPermissionDirective{
    public hasPermission: boolean = false;
    constructor(
        public el: ElementRef,
        public renderer: Renderer2,
        public securityService: SecurityService) {
    }

    @Input('rbac-permission') rbacPermission = { name: null, action: '' };

    ngOnInit() {
        if (this.rbacPermission) {
            let ipPermissionName = this.rbacPermission.name;
            if (ipPermissionName) {
                //check user hasPermission or not
                let hasPermission = this.securityService.HasPermission(ipPermissionName);
                if (!hasPermission) {
                    let actionName = this.rbacPermission.action;
                    if (actionName && actionName == 'hidden') {
                        this.el.nativeElement.hidden = true;
                    }
                    if (actionName && actionName == 'disabled') {
                        this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
                        //this.el.nativeElement.disabled = true;
                    }
                }
            }
        }
    }
}