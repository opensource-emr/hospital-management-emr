import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../security/shared/security.service"
import { LabService } from './shared/lab.service';
import { CoreService } from '../core/shared/core.service';
import { LabTypesModel } from './lab-selection/lab-type-selection.component';
import { LabsBLService } from './shared/labs.bl.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';


@Component({
  selector: 'my-app',
  templateUrl: "./labs-main.html"   //"/LabView/LabMain"
})

// App Component class
export class LabsMainComponent {
  validRoutes: any;
  public primaryNavItems: Array<any> = null;
  public secondaryNavItems: Array<any> = null;
  public showActiveLabInfo: boolean = false;
  public currentLabId: number = 0;
  public currentLabName: string = null;
  public activeLab: any;
  public labTypes: Array<LabTypesModel>;
  public hasLabTypeSelectionPerm: boolean = false;
  public enableLabChange: boolean = false;

  constructor(public securityService: SecurityService, public labService: LabService, public router: Router,
    public coreService: CoreService,
    public labBlService: LabsBLService,
    public msgBoxServ: MessageboxService) {
    //get the chld routes of Lab from valid routes available for this user.
    this.validRoutes = this.securityService.GetChildRoutes("Lab");
    this.primaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == null || a.IsSecondaryNavInDropdown == 0);
    this.secondaryNavItems = this.validRoutes.filter(a => a.IsSecondaryNavInDropdown == 1);
    this.labService.routeNameAfterverification = this.coreService.GetRouteNameAfterLabReportVerification();

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

    this.activeLab = this.securityService.getActiveLab();
    this.labTypes = this.coreService.labTypes;
  }

  ShowInfo() {
    this.showActiveLabInfo = true;
    var timer = setInterval(() => {
      this.CloseInfo();
      clearInterval(timer);
    }, 10000);
  }

  CloseInfo() {
    this.showActiveLabInfo = false;
  }

  UnsetGloballab() {
    this.securityService.setActiveLab(new LabTypesModel());
    this.showActiveLabInfo = false;
    this.currentLabId = 0;
    this.currentLabName = null;
    this.DeactivateLab();
    this.router.navigate(["/Lab/LabTypeSelection"]);
  }

  DeactivateLab() {
    this.labBlService.DeactivateLab()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.securityService.getActiveLab().LabTypeId = 0;
          this.securityService.getActiveLab().LabTypeName = null;
          this.currentLabId = 0;
          this.currentLabName = null;
         // this.labTypes = this.coreService.GetLabTypes();
        } else {
          this.msgBoxServ.showMessage("error", ["Couldn't deactivate current lab. Please try again later."]);
        }
      })
  }

}

