import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { LabService } from './shared/lab.service';
import { CoreService } from '../core/shared/core.service';


@Component({
  selector: 'my-app',
  templateUrl: "./labs-main.html"   //"/LabView/LabMain"
})

// App Component class
export class LabsMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;

  constructor(public securityService: SecurityService, public labService: LabService,
    public coreService: CoreService) {
    //get the chld routes of Lab from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Lab");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);

    var folderDetailObj: any = null;
    var allLabStickerFolderDetail = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'lab' && a.ParameterName == 'LabStickerSettings');

    if (allLabStickerFolderDetail) {
      folderDetailObj = JSON.parse(allLabStickerFolderDetail.ParameterValue);
      if (folderDetailObj.length > 1) {
        if (localStorage.getItem('Danphe_LAB_Default_PrinterName')) {
          this.labService.defaultPrinterName = localStorage.getItem('Danphe_LAB_Default_PrinterName');
        } else {
          this.labService.defaultPrinterName = null;
        }
      } else {        
        if (localStorage.getItem('Danphe_LAB_Default_PrinterName')) {
          localStorage.removeItem('Danphe_LAB_Default_PrinterName');
        }  
        this.labService.defaultPrinterName = folderDetailObj[0].Name;
      }
    }
    
  }
}
