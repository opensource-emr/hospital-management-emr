import { Component } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-sterilization',
  templateUrl: './sterilization.component.html',
  styles: []
})
export class SterilizationComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("CSSD/Sterilization");
  }
}
