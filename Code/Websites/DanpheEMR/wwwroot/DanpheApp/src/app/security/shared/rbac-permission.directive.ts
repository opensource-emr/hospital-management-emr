import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { SecurityService } from './security.service';

@Directive({
  selector: '[rbac-permission]'
})

export class RbacPermissionDirective {
  public hasPermission: boolean = false;
  constructor(
    public el: ElementRef,
    public renderer: Renderer2,
    public securityService: SecurityService) {
  }

  @Input('rbac-permission') rbacPermission = { name: null, actionOnInvalid: '' };

  ngOnInit() {
    if (this.rbacPermission) {
      if (typeof (this.rbacPermission) == "string") {
        this.rbacPermission = JSON.parse(this.rbacPermission);//sud: 18Feb'20--sometimes we get this in string format.. so
      }
      let ipPermissionName = this.rbacPermission.name;
      if (ipPermissionName) {

        

        //check user hasPermission or not
        let hasPermission = this.securityService.HasPermission(ipPermissionName);
        if (!hasPermission) {
          let actionName = this.rbacPermission.actionOnInvalid;
          if (actionName && actionName == 'hidden') {
            this.el.nativeElement.hidden = true;
            this.el.nativeElement.style.display = 'none';
          }
          else if (actionName && actionName == 'disabled') {
            this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
            //this.el.nativeElement.disabled = true;
          }
          else if (actionName && actionName == 'remove') {
            this.el.nativeElement.remove();
          }
        }
      }
    }
  }
}
