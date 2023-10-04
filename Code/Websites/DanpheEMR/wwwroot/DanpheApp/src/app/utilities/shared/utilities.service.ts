import { Injectable } from "@angular/core";
import { SecurityService } from '../../security/shared/security.service';
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";

@Injectable()
export class UtilitiesService {
  public settingsGridCols: GridColumnSettings;

  constructor(private _securityService: SecurityService) {
    this.settingsGridCols = new GridColumnSettings(this._securityService)
  }


}