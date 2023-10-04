import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
  selector: 'app-stock-main',
  templateUrl: './stock-main.component.html',
  styles: []
})
export class StockMainComponent implements OnInit {
  validRoutes: any;
  constructor(private _securityService: SecurityService) {
    this.validRoutes = this._securityService.GetChildRoutes("Dispensary/Stock");
  }
  ngOnInit() {
  }
}
