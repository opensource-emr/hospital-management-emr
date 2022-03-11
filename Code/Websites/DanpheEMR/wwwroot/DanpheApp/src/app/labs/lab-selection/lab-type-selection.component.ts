import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CallbackService } from "../../shared/callback.service";
import { SecurityService } from "../../security/shared/security.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { LabsBLService } from "../shared/labs.bl.service";
import { CoreService } from "../../core/shared/core.service";

@Component({
  selector: "select-lab-type",
  templateUrl: "./lab-type-selection.html",
})
export class LabTypeSelectionComponent {
  public currentLabId: number = 0;
  public currentLabName: string = null;
  public activeLab: LabTypesModel = null;
  public showNoPermission: boolean = true;
  public labTypes: Array<LabTypesModel>;
  public hasMultipleLabType: boolean = false;

  constructor(
    private messageBoxService: MessageboxService,
    private router: Router,
    public coreService: CoreService,
    private securityService: SecurityService,
    public labBlService: LabsBLService,
    public callbackservice: CallbackService
  ) {
    this.labTypes = this.coreService.labTypes;
    let actLab = this.securityService.getActiveLab();
    this.activeLab = actLab ? actLab : new LabTypesModel();
    this.assignPermission();
    if (this.coreService.labTypes.length > 1) {
      this.hasMultipleLabType = true;
    } else {
      this.hasMultipleLabType = false;
    }
  }

  public assignPermission() {
    if (this.labTypes && this.labTypes.length) {
      this.labTypes.forEach((W) => {
        W["PermissionInfo"] =
          '{"name":"lab-type-' + W.PermName + '","actionOnInvalid":"remove"}';
        let perm = "lab-type-" + W.PermName;
        if (
          this.securityService.UserPermissions.find(
            (p) => p.PermissionName == perm
          )
        ) {
          this.showNoPermission = false;
        }
      });
      console.log(this.labTypes)
    }
  }

  setGlobalLab(labId) {
    if (this.hasMultipleLabType) {
      var selectedlab = this.labTypes.find((a) => a.LabTypeId == labId);
      this.securityService.setActiveLab(selectedlab);
      this.currentLabId = selectedlab.LabTypeId;
      this.router.navigate(["/Lab/Dashboard"]);
    } else {
      var selectedLab = this.labTypes[0];
      this.securityService.setActiveLab(selectedLab);
      this.currentLabId = selectedLab.LabTypeId;
      this.router.navigate(["/Lab/Dashboard"]);
    }
  }

  ActivateLab(lab) {
    this.labBlService
      .ActivateLab(lab.LabTypeId, lab.LabTypeName)
      .subscribe((res) => {
        if (res.Status == "OK") {
          let actLabId = res.Results;
          this.securityService.getActiveLab().LabTypeId = actLabId.LabTypeId;
          this.currentLabId = actLabId;
          this.labTypes.forEach((lab) => {
            if (lab.LabTypeId == this.currentLabId) {
              this.currentLabName = lab.LabTypeName;
              this.securityService.getActiveLab().LabTypeName = lab.LabTypeName;
            }
          });
        }
      });
  }

  DeactivateLab() {
    this.labBlService.DeactivateLab().subscribe((res) => {
      if (res.Status == "OK") {
        let freshObj = new LabTypesModel();
        this.securityService.setActiveLab(freshObj);
        this.securityService.getActiveLab().LabTypeId = 0;
        this.securityService.getActiveLab().LabTypeName = null;
        this.currentLabId = 0;
        this.currentLabName = null;
      } else {
        this.messageBoxService.showMessage("error", [
          "Couldn't deactivate current lab. Please try again later.",
        ]);
        console.log(res.ErrorMessage);
      }
    });
  }

  GoHome() {
    this.router.navigate(["Home/Index"]);
  }
}


export class LabTypesModel {
    LabTypeId: number = 0;
    LabTypeName: string = null;
    DisplayName: string = null;
    CreatedBy: number;
    CreatedOn: string = null;
    ModifiedBy: number;
    ModifiedOn: string = null;
    IsActive: boolean = true;
    PermName: string = null;
    IsDefault: boolean = false;
}
