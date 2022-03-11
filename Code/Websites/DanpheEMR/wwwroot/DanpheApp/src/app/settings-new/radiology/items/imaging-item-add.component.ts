
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';

import { ImagingItem } from '../../../radiology/shared/imaging-item.model';
import { ImagingType } from '../../../radiology/shared/imaging-type.model';
import { ServiceDepartment } from '../../shared/service-department.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { BillItemPriceModel } from '../../shared/bill-item-price.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { RadiologyReportTemplate } from "../../../radiology/shared/radiology-report-template.model";
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: "img-item-add",
  templateUrl: "./imaging-item-add.html",
  host: { '(window:keyup)': 'hotkeys($event)' }
})

export class ImagingItemAddComponent {
  public serviceDepartmentList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public CurrentImagingItem: ImagingItem = new ImagingItem();
  public selectedTemplate: any;

  public showAddPage: boolean = false;
  @Input("selectedImgItem")
  public selectedImgItem: ImagingItem;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  public imgTypeList: Array<ImagingType> = new Array<ImagingType>();
  public ratReportTemplateList: Array<RadiologyReportTemplate> = new Array<RadiologyReportTemplate>();
  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.GetImgTypes();
    this.GetRADReportTemplateList();
    this.getSrvDeptList();
  }

  //ngOnInit() {
  //  //disable ImagingType selection in case of update.
  //  //we have to disable it since ImagingType is mapped with service department of billing and we shouldn't change it.
  //  if (this.update && this.CurrentImagingItem) {
  //    this.CurrentImagingItem.EnableControl("ImagingTypeId", false);
  //  }
  //}
   

  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedImgItem) {
      this.update = true;
      this.CurrentImagingItem = Object.assign(this.CurrentImagingItem, this.selectedImgItem);
      this.CurrentImagingItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.selectedTemplate = this.ratReportTemplateList.filter(x => x.TemplateId == this.selectedImgItem.TemplateId)[0];
    }
    else {
      this.CurrentImagingItem = new ImagingItem();
      //this.CurrentImagingItem.ImagingTypeId = null;//it's set as zero which is not validated by Required Validator.
      this.CurrentImagingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
    }
  }

  public GetImgTypes() {
    this.settingsBLService.GetImgTypes()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.imgTypeList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.imgTypeList, "ImagingTypeName");
          }
          else {
            this.showMessageBox("Failed", "Check log for error message.");
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.showMessageBox("Failed to get wards", "Check log for error message.");
          this.logError(err.ErrorMessage);
        });
  }

  //GET Radiology report template list
  GetRADReportTemplateList() {
    try {
      this.settingsBLService.GetRADReportTemplateList()
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.ratReportTemplateList = res.Results;
              CommonFunctions.SortArrayOfObjects(this.ratReportTemplateList, "TemplateName");



            }
            else {
              this.showMessageBox("success", "Record not found");
            }
          }
        },
          err => {
            this.showMessageBox("failed", "Check log for error message.");
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  AddImagingItem(): void {
    //marking every fields as dirty and checking validity
    for (var i in this.CurrentImagingItem.ImagingItemValidator.controls) {
      this.CurrentImagingItem.ImagingItemValidator.controls[i].markAsDirty();
      this.CurrentImagingItem.ImagingItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.selectedTemplate)
      this.CurrentImagingItem.TemplateId = this.selectedTemplate ? this.selectedTemplate.TemplateId : null;
    //if valid then call the BL service to do post request.
    if (this.CurrentImagingItem.IsValidCheck(undefined, undefined) == true) {



      this.settingsBLService.AddImagingItem(this.CurrentImagingItem)
        .subscribe(res => {
          this.showMessageBox("success", "Item Added");
          this.Close();
          this.CallBackAddUpdate(res);

        },
          err => this.logError(err));
    }
  }

  public getSrvDeptList() {
    this.settingsBLService.GetServiceDepartments()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.serviceDepartmentList = res.Results;




        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  myListFormatter(data: any): string {
    let html = data["TemplateName"];
    return html;
  }
  UpdateImagingItem(): void {

    //marking every fields as dirty and checking validity
    for (var i in this.CurrentImagingItem.ImagingItemValidator.controls) {
      this.CurrentImagingItem.ImagingItemValidator.controls[i].markAsDirty();
      this.CurrentImagingItem.ImagingItemValidator.controls[i].updateValueAndValidity();
    }

    //if valid then call the BL service to do post request.
    if (this.CurrentImagingItem.IsValidCheck(undefined, undefined) == true) {
      if (this.selectedTemplate)
        this.CurrentImagingItem.TemplateId = this.selectedTemplate ? this.selectedTemplate.TemplateId : null;
      this.settingsBLService.UpdateImagingItem(this.CurrentImagingItem)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.showMessageBox("success", "Item Updated");
            //this.CurrentImagingItem = new ImagingItem();
            this.CallBackAddUpdate(res);
          }
          else {
            this.showMessageBox("Error", "Check log for details");
            console.log(res.ErrorMessage);
            this.Close();
          }

        },
          err => this.logError(err));
    }
  }

  Close() {
    this.selectedImgItem = null;
    this.update = false;
    this.showAddPage = false;
    this.selectedTemplate = null;
  }


  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var imgItem: any = {};
      imgItem.ImagingItemId = res.Results.ImagingItemId;
      imgItem.ImagingItemName = res.Results.ImagingItemName;
      imgItem.ImagingTypeId = res.Results.ImagingTypeId;
      imgItem.ImagingItemPrice = res.Results.ImagingItemPrice;
      imgItem.ProcedureCode = res.Results.ProcedureCode;
      imgItem.IsActive = res.Results.IsActive;
      imgItem.CreatedOn = res.Results.CreatedOn;
      imgItem.CreatedBy = res.Results.CreatedBy;
      imgItem.TemplateId = res.Results.TemplateId;
      for (let img of this.imgTypeList) {
        if (img.ImagingTypeId == res.Results.ImagingTypeId) {
          imgItem.ImagingTypeName = img.ImagingTypeName;
          break;
        }
      };
      //var img = this.imgTypeList.find(val => val.ImagingTypeId == res.Results.ImagingTypeId);
      //imgItem.ImagingTypeName = img.ImagingTypeName;

      //if (img && img.length) {
      //  imgItem.ImagingTypeName = img[0].ImagingTypeName;
      //}



      let srvDptId = this.serviceDepartmentList.find(srv => srv.ServiceDepartmentName == imgItem.ImagingTypeName).ServiceDepartmentId;

      let billItem = new BillItemPriceModel();
      billItem.ServiceDepartmentId = srvDptId;
      billItem.ItemName = imgItem.ImagingItemName;
      billItem.Price = 0;
      billItem.ItemId = res.Results.ImagingItemId;
      billItem.TaxApplicable = true;
      billItem.DiscountApplicable = true;
      billItem.IsActive = true;
      billItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      billItem.CreatedOn = imgItem.CreatedOn;

      //Insert the created data to BillItemPrice Table
      this.settingsBLService.AddBillingItem(billItem)
        .subscribe(
          res => { billItem = new BillItemPriceModel(); },
          err => { this.logError(err); });




      this.callbackAdd.emit({ imgItem: imgItem }); //(destination:source)
    }
    else {
      this.showMessageBox("Error", "Check log for details");
      console.log(res.ErrorMessage);
    }

  }

  logError(err: any) {
    console.log(err);
  }

  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }
  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
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
