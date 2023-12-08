import { Component } from "@angular/core";
import { SecurityService } from "../../security/shared/security.service";

@Component({
  selector: 'dynamic-template',
  templateUrl: './dynamic-template-main.component.html',

})
export class DynamicTemplateMainComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {

    this.validRoutes = this.securityService.GetChildRoutes("Settings/DynamicTemplates");

  }

}
