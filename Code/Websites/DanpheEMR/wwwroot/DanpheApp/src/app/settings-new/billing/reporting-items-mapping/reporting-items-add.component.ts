import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { SettingsService } from "../../shared/settings-service";
import { ReportingItemsModel } from "../../shared/reporting-items.model";
import { DynamicReportNameModel } from "../../shared/dynamic-report-names.model";

@Component({
  selector: "reporting-items-add",
  templateUrl: "./reporting-items-add.html",
})
export class ReportingItemsAddComponent {
  //declare boolean loading variable for disable the double click event of button
  public loading: boolean = false;
  public currentReportingItem: ReportingItemsModel = new ReportingItemsModel();
  //public ImagingItem: ImagingItem = new ImagingItem();
  //public LabItem: LabTest = new LabTest();

  public Category: Array<string> = new Array<string>();
  public showAddServiceDepartmentPopUp: boolean = false;


  @Input("selectedItem")
  public selectedItem: ReportingItemsModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("reporting-items-list")
  public reportingitemsList: Array<ReportingItemsModel>;
  public update: boolean = false;
  public maxItemCode: Array<any> = [];
  public dynamicReportNameList: Array<DynamicReportNameModel> = [];
  public dynamicReportNameObj: DynamicReportNameModel = new DynamicReportNameModel();

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService, public settingsService: SettingsService) {
      this.GetDynamicReportNameList();
  }

  ngOnInit() {
    this.loading = false;
    if (this.selectedItem) {
      this.update = true;
      this.currentReportingItem = Object.assign(this.currentReportingItem, this.selectedItem);      
      this.currentReportingItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.currentReportingItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.dynamicReportNameObj = new DynamicReportNameModel();
    }
    else {
      this.currentReportingItem.ReportingItemsValidator.reset();
      this.currentReportingItem = new ReportingItemsModel();
      this.currentReportingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentReportingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.update = false;
    }
  }

  GetDynamicReportNameList(){
    this.settingsBLService.GetDynamicReportNameList()
    .subscribe((res:any)=>{
      if (res.Status == "OK") {
        this.dynamicReportNameList = res.Results;
        this.OnReportChangeName(this.currentReportingItem.DynamicReportId);
      }
    })
  }

  OnReportChangeName(dynamicId:number){
    if(!!dynamicId && dynamicId>0){
      this.dynamicReportNameObj.ReportCode = this.dynamicReportNameList.find(a => a.DynamicReportId == dynamicId).ReportCode;
      this.dynamicReportNameObj.ReportDescription = this.dynamicReportNameList.find(a => a.DynamicReportId == dynamicId).ReportDescription;  
    }
    else{
      this.dynamicReportNameObj.ReportCode = "";
      this.dynamicReportNameObj.ReportDescription = "";
    }

  }

  //it is the centralized function to check validations.
  CheckValidations(): boolean {
    let isValid: boolean = true;
    for (var i in this.currentReportingItem.ReportingItemsValidator.controls) {
      if( this.currentReportingItem.ReportingItemsValidator.controls[i].invalid){
        this.currentReportingItem.ReportingItemsValidator.controls[i].markAsDirty();
        this.currentReportingItem.ReportingItemsValidator.controls[i].updateValueAndValidity();
        isValid = false;
      }
    }
    if(this.currentReportingItem.DynamicReportId==0){
      this.msgBoxServ.showMessage("failed", ["Please Select Report Name."]);
      isValid = false;
      return
    }
    return isValid;
  }

    Add() {
        if (this.CheckValidations() && !this.loading) {
            this.loading = true;
            this.settingsBLService.AddReportingItem(this.currentReportingItem)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status == 'OK') {
                            this.CallBackAddUpdate(res.Results);
                            this.loading = false;
                        }
                    });             
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Please fill all mandatory fields."]);
        }
    }


  Update() {
    if (this.CheckValidations()) {
      if (!this.loading) {
        this.loading = true;
        this.settingsBLService.UpdateReportingItem(this.currentReportingItem)
          .subscribe(
            (res: DanpheHTTPResponse) => {

              if (res.Status == "OK") {
                this.showMessageBox("success", "Reporting Item Updated");
                this.CallBackAddUpdate(res.Results);

              }
              else {
                this.showMessageBox("failed", "Failed updating Reporting Item, check log for details");
              }


              this.currentReportingItem = new ReportingItemsModel();
              this.loading = false;
            },
            err => {
              this.logError(err);
              this.loading = false;
            });

      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please fill all mandatory fields."]);
    }
  }

  CallBackAddUpdate(freeService: ReportingItemsModel) {
    let updatedItem: ReportingItemsModel = freeService;
    var item: ReportingItemsModel = new ReportingItemsModel();
    item.ReportingItemsId = updatedItem.ReportingItemsId;    
    this.callbackAdd.emit({ action: this.update ? "update" : "add", item: item });
  }

  logError(err: any) {
    console.log(err);
  }
  Close() {
    this.currentReportingItem = new ReportingItemsModel;
    this.currentReportingItem.ReportingItemsValidator.reset();
    this.selectedItem = null;
    this.callbackAdd.emit({ action: "close", item: null });
    this.update = false;
  }

  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

}
