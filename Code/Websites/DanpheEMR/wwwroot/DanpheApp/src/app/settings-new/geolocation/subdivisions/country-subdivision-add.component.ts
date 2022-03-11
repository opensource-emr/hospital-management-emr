import { Component, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CountrySubdivision } from '../../shared/country-subdivision.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { Country } from '../../shared/country.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
@Component({
  selector: "subdivision-add",
  templateUrl: "./country-subdivision-add.html",
  host: { '(window:keyup)': 'hotkeys($event)' }
})

export class CountrySubdivisionAddComponent {
  public showAddPage: boolean = false;


  @Input("selectedSubdivision")
  public selectedSubdivision: CountrySubdivision;

  public subDivisionList: Array<CountrySubdivision> = new Array<CountrySubdivision>();
  public completeSubdivisionList: Array<CountrySubdivision> = new Array<CountrySubdivision>();
  @Input() public update: boolean = false;

  @Output("callback-Add") callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public currentSubDivision: CountrySubdivision = new CountrySubdivision();
  public countryList: Country[];

  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
    this.GetSubdivisions();
    this.GetCountryList();
  }

  public GetSubdivisions() {
    this.subDivisionList = DanpheCache.GetData(MasterType.SubDivision, null)
    this.completeSubdivisionList = this.subDivisionList;


    // this.settingsBLService.GetSubDivisions()
    //     .subscribe(res => {
    //         if (res.Status == 'OK') {
    //             if (res.Results.length) {
    //                 this.subDivisionList = res.Results;
    //                 this.completeSubdivisionList = this.subDivisionList;
    //             }
    //         }
    //         else {
    //             this.showMessageBox("error", "Check log for error message.");
    //             this.logError(res.ErrorMessage);
    //         }
    //     },
    //         err => {
    //             this.showMessageBox("error", "Failed to get SubDivisions. Check log for error message.");
    //             this.logError(err.ErrorMessage);
    //         });
  }

  public GetCountryList() {
    this.countryList = DanpheCache.GetData(MasterType.Country, null);

    // this.settingsBLService.GetCountries()
    // .subscribe(res => {
    // if (res.Status == 'OK') {
    // this.countryList = res.Results;
    // }
    // else {
    // this.showMessageBox("error", "Check log for error message.");
    // this.logError(res.ErrorMessage);
    // }
    // }
    // )
  }

  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    this.FocusElementById("ddlCountry");
    if (this.selectedSubdivision) {
      this.update = true;
      this.currentSubDivision = Object.assign(this.currentSubDivision, this.selectedSubdivision);
      this.currentSubDivision.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.subDivisionList = this.subDivisionList.filter(subdivision => (subdivision.CountrySubDivisionId != this.selectedSubdivision.CountrySubDivisionId));
    }
    else {
      this.currentSubDivision = new CountrySubdivision();
      this.currentSubDivision.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
    }
  }

  AddSubDivision() {
    for (var i in this.currentSubDivision.SubdivisionValidator.controls) {
      this.currentSubDivision.SubdivisionValidator.controls[i].markAsDirty();
      this.currentSubDivision.SubdivisionValidator.controls[i].updateValueAndValidity();
      this.FocusElementById("ddlCountry");
    }

    if (this.currentSubDivision.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddSubDivision(this.currentSubDivision)
        .subscribe(
          res => {
            this.showMessageBox("success", "SubDivision Added");
            this.currentSubDivision = new CountrySubdivision(); //it doesnot let row added again and again
            this.CallBackAddSubDivision(res)
          },
          err => {
            this.logError(err);
            this.FocusElementById("ddlCountry");
          });
    }
  }

  CallBackAddSubDivision(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ subdivision: res.Results });
    }
    else {
      this.showMessageBox("error", "Check log for details");
      console.log(res.ErrorMessage);
    }
  }


  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.currentSubDivision.SubdivisionValidator.controls) {
      this.currentSubDivision.SubdivisionValidator.controls[i].markAsDirty();
      this.currentSubDivision.SubdivisionValidator.controls[i].updateValueAndValidity();
      this.FocusElementById("ddlCountry");
    }

    if (this.currentSubDivision.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateSubdivision(this.currentSubDivision)
        .subscribe(
          res => {
            this.showMessageBox("success", "Sub Division Updated");
            this.currentSubDivision = new CountrySubdivision();
            this.CallBackAddSubDivision(res)

          },
          err => {
            this.logError(err);
            this.FocusElementById("ddlCountry");
          });
    }
  }


  Close() {
    this.selectedSubdivision = null;
    this.update = false;
    this.subDivisionList = this.completeSubdivisionList;
    this.showAddPage = false;
  }



  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  logError(err: any) {
    console.log(err);
  }
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  hotkeys(event){
    if(event.keyCode==27){
        this.Close()
    }
}

}
