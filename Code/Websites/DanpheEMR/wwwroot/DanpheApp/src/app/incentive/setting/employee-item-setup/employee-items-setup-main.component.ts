import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { CommonFunctions } from '../../../shared/common.functions';
import { IncentiveBLService } from '../../shared/incentive.bl.service'; ``
import { EmployeeBillItemsMapModel } from '../../shared/employee-billItems-map.model';
import { ItemGroupDistributionModel } from '../../shared/item-group-distribution.model';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { EmployeeIncentiveInfoModel } from '../../shared/employee-incentiveInfo.model';
import { ProfileModel } from '../../shared/profile.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { CoreService } from '../../../core/shared/core.service';
import { INCTVGridColumnSettings } from '../../shared/inctv-grid-column-settings';
import { DLService } from '../../../shared/dl.service';



@Component({
  templateUrl: './employee-items-setup-main.component.html'
})
export class EmployeeItemsSetupMainComponent {

  //public currentEmployeeIncentiveInfo: EmployeeIncentiveInfoModel = new EmployeeIncentiveInfoModel();
  public EmployeeIncentiveSetupGridColumns: Array<any> = [];
  public EmployeeIncentiveList: Array<any> = [];
  public showEmployeeSetUpPopup: boolean = false;
  public allDoctorList: any = [];
  public allBillitmList: any = [];
  public selectedEmployee: number = null;
  public profileList: Array<ProfileModel> = new Array<ProfileModel>();

  public dlService: DLService = null;

  constructor(public msgBoxServ: MessageboxService,
    public incentiveBLService: IncentiveBLService,
    public securityService: SecurityService,
    public coreService: CoreService,
    _dlService: DLService,) {
    this.dlService = _dlService;
    this.EmployeeIncentiveSetupGridColumns = INCTVGridColumnSettings.EmployeeItemSetupList;
    this.GetEmployeeIncentiveInfo();
    this.LoadDocterList();
    this.GetItemsForIncentive();
    this.GetProfileList();
  }

  public GetEmployeeIncentiveInfo() {
    try {
      this.incentiveBLService.GetEmployeeIncentiveInfo()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.EmployeeIncentiveList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }

  public showTdsEditPopup: boolean = false;

  public EmployeeIncentiveSetupGridActions($event) {
    switch ($event.Action) {

      case 'editItemsPercent': {
        this.selectedEmployee = $event.Data.EmployeeId;
        this.showEmployeeSetUpPopup = true;
        break;
      }
      case 'edit-tds': {
        this.selEmpObjForTds = Object.assign({}, $event.Data);
        //console.log($event.Data);
        this.showTdsEditPopup = true;
        break;
      }
      case 'activateEmployeeIncentiveSetup': {
        var EmployeeIncentiveSetup = $event.Data;
        EmployeeIncentiveSetup.IsActive = true;
        this.ActivateDeactivateEmployeeSetup(EmployeeIncentiveSetup);
        break;
      }
      case 'deactivateEmployeeIncentiveSetup': {
        var EmployeeIncentiveSetup = $event.Data;
        EmployeeIncentiveSetup.IsActive = false;

        let proceed: boolean = true;
        proceed = window.confirm("This Employee Incentive Setting will be Deactivated. Are you sure you want to proceed ?")
        if (proceed)
          this.ActivateDeactivateEmployeeSetup(EmployeeIncentiveSetup);
        break;
      }
      default:
        break;
    }
  }

  ActivateDeactivateEmployeeSetup(currentEmployeeIncentiveInfo: EmployeeIncentiveInfoModel) {

    this.incentiveBLService.ActivateDeactivateEmployeeSetup(currentEmployeeIncentiveInfo)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetEmployeeIncentiveInfo();
          this.msgBoxServ.showMessage('sucess', ['Employee IncentiveSetup Updated Successfully!!']);

        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public LoadDocterList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allDoctorList = res.Results;
        }
      });
  }

  public incentiveInfoChange($event) {
    console.log($event);
    this.showEmployeeSetUpPopup = false;
    //Reload the Grid if it's for NewEmployee Incentive.
    if (this.isNewEmpIncentive) {
      this.GetEmployeeIncentiveInfo();
      this.isNewEmpIncentive = false;
    }
  }

  public GetItemsForIncentive() {
    try {
      this.incentiveBLService.GetItemsForIncentive()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.allBillitmList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
            console.log(res.ErrorMessage);
          }
        });
    } catch (error) {

    }
  }
  public GetProfileList() {
    this.incentiveBLService.GetProfileList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.profileList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public isNewEmpIncentive: boolean = false;//sud:06-Oct-2020: If new then we need to reload the grid.
  AddEmployeeIncentive_ForNEW() {
    this.selectedEmployee = null;
    this.isNewEmpIncentive = true;//we'll check it's value later on.
    this.showEmployeeSetUpPopup = true;
  }


  //sud:06-Oct-2020 : For TDS UPdate 
  public selEmpObjForTds: any = null;
  SaveTDSPercent() {
    //Write code to update TDS for current employee..
    if (this.selEmpObjForTds && this.selEmpObjForTds.EmployeeId) {
      if (this.selEmpObjForTds.TDSPercent == null || this.selEmpObjForTds.TDSPercent > 100 || this.selEmpObjForTds.TDSPercent < 0) {
        this.msgBoxServ.showMessage("Error", ["TDS Percentage INVALID !!.", "It Can't be Empty", "Can't be Greater than 100", "Can't be less than Zero."]);
      }
      else {
        this.incentiveBLService.SaveEmployeeBillItemsMap(this.selEmpObjForTds)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.showTdsEditPopup = false;
              this.selEmpObjForTds = null;
              this.msgBoxServ.showMessage("success", ["TDS Percentage Updated Successfully"]);
              this.GetEmployeeIncentiveInfo();
            }
            else {
              this.msgBoxServ.showMessage('failed', [res.ErrorMessage]);
              console.log(res.ErrorMessage);
            }
          });
      }
    }
  }

  CloseTDSPopup() {
    this.showTdsEditPopup = false;
    this.selEmpObjForTds = null;
  }

  public ExportAllIncentiveDate() {
    //let jsonStrSummary = this.GetSummaryFormatedForExportExcel();

    //let summaryHeader = "Calculation Summary";
    
    this.dlService.ReadExcel("/ReportingNew/ExportToExcel_INCTV_AllEmpItemsSettings")
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "INCTV_AllEmpItemsSettings_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
}



