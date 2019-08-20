import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { SecurityService } from "../../security/shared/security.service"
@Component({
  templateUrl: "./eye-examination.html",
  styleUrls: ['./eye-examination.component.css']
})
export class EyeExaminationComponent {
  validRoutes: any;
  constructor(public securityService: SecurityService) {
    this.validRoutes = this.securityService.GetChildRoutes("Clinical/EyeExamination");
  }
}
