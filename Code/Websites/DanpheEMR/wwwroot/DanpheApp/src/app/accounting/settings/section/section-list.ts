
import { Component, ChangeDetectorRef } from "@angular/core";

import { LedgerModel } from '../shared/ledger.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { SectionModel } from "../shared/section.model";
import { AccountingService } from "../../shared/accounting.service";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  selector: 'section-list',
  templateUrl: './section-list.html',
})
export class SectionListComponent {
  //public sectionList: Array<LedgerModel> = new Array<LedgerModel>();
  public sectionList: Array<SectionModel> = new Array<SectionModel>();
  public showsectionList: boolean = true;
  public sectionGridColumns: Array<any> = null;
  public selectedSection: SectionModel = new SectionModel();
  public edit : boolean = false;

  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public accountingservice: AccountingService,
    public msgBox: MessageboxService,
    public coreService : CoreService,
    public changeDetector: ChangeDetectorRef,private securityServ:SecurityService) {
    this.sectionGridColumns = GridColumnSettings.sectionList;
    this.getsectionList();

  }
  public getsectionList() {
    // this.accountingSettingsBLService.GetsectionList()
    //   .subscribe(res => {
        if (!!this.accountingservice.accCacheData.Sections && this.accountingservice.accCacheData.Sections.length>0) {//mumbai-team-june2021-danphe-accounting-cache-change
          this.sectionList = this.accountingservice.accCacheData.Sections;//mumbai-team-june2021-danphe-accounting-cache-change
          this.sectionList = this.sectionList.slice();//mumbai-team-june2021-danphe-accounting-cache-change

          this.showsectionList = true;
         }
        else {
          this.msgBox.showMessage("error", ['No Data']);
        }

      // });
  }

  AddSection() {
    this.showsectionList = false;
    this.edit =false;
  }

  SectionGridActions($event: GridEmitModel) {

    switch ($event.Action) {
       case "edit": {
        //this.selectedSection = null;
        this.edit = true;
        this.showsectionList = false;
        this.changeDetector.detectChanges();
        let temp = $event.Data;
      this.setdata(temp);
        break;
      }
      default:
        break;
    }
  }
  setdata(data){
    this.selectedSection.SectionId = data.SectionId;
    this.selectedSection.SectionName = data.SectionName;
    this.selectedSection.SectionCode = data.SectionCode;
  }
  Close() {
    this.showsectionList = true;
    this.edit =false;
    this.selectedSection = new SectionModel();
  }
  // Automatically capitalized department code when user writes something in that field.
  CapitalizeSectionCode() {

    let secCode = this.selectedSection.SectionCode;
    if (secCode) {
      this.selectedSection.SectionCode = secCode.toUpperCase();
    }
  }
  SavenewSection() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.selectedSection.SectionValidator.controls) {
      this.selectedSection.SectionValidator.controls[i].markAsDirty();
      this.selectedSection.SectionValidator.controls[i].updateValueAndValidity();
    }

    if (this.selectedSection.IsValidCheck(undefined, undefined)) {

      this.accountingSettingsBLService.AddSection(this.selectedSection)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.showsectionList = true;
              this.selectedSection = new SectionModel();                         
            }
            else {
              this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
            }
          },
          err => {
            this.logError(err);
          });
    }
  }
//update section
  UpdateSection()
  {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.selectedSection.SectionValidator.controls) {
      this.selectedSection.SectionValidator.controls[i].markAsDirty();
      this.selectedSection.SectionValidator.controls[i].updateValueAndValidity();
    }

    if (this.selectedSection.IsValidCheck(undefined, undefined)) {

      this.accountingSettingsBLService.UpdateSection(this.selectedSection)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.showsectionList = true;
              this.edit =false;
              this.selectedSection = new SectionModel();
                         
            }
            else {
              this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
            }
          },
          err => {
            this.logError(err);
          });
    }
  }

  logError(err: any) {
    console.log(err);
  }

}
