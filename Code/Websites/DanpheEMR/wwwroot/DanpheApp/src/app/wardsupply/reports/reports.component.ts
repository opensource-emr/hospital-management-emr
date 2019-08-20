import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { Router } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service"


@Component({
  templateUrl: "./reports.html"
})
export class WardReportComponent {
  validRoutes: any;
  constructor() {
    //this.validRoutes = this.securityService.GetChildRoutes("WardSupply/Reports");
  }
}
