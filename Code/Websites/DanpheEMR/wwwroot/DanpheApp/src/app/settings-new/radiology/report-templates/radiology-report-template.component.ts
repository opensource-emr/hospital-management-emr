
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { ImagingItem } from '../../../radiology/shared/imaging-item.model';
import { RadiologyReportTemplate } from '../../../radiology/shared/radiology-report-template.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { SettingsService } from "../../shared/settings-service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  selector: "rad-report-remplate",
  templateUrl: "./radiology-report-template.html",
  host: { '(window:keyup)': 'hotkeys($event)' }

})
export class RadiologyReportTemplateComponent {
  //this flag for show and hide add update popup
  public showAddEditPage: boolean = false;
  //property for determine is update or add 
  public IsUpdate: boolean = false;
  //for edit update single template details
  public currentTemplate: RadiologyReportTemplate = new RadiologyReportTemplate();
  //template list for grid
  public radTemplateList: Array<RadiologyReportTemplate> = new Array<RadiologyReportTemplate>();

  //property for save called tempalate data at locally
  public radTemplateLocalData = new Array<{ TemplateId: number, Template: RadiologyReportTemplate }>();

  //grid column setting
  public radReportTemplateGridColumns: Array<any> = null;
  public isValidTemplate: boolean = true;

  public index: number;
  constructor(
    public messageBoxService: MessageboxService,
    public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService
  ) {
    try {
      this.radReportTemplateGridColumns = this.settingsServ.settingsGridCols.RADRemportTemplateList;
      this.GetRADReportTemplateList();
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //GET Radiology report template list
  GetRADReportTemplateList() {
    try {
      this.settingsBLService.GetRADReportTemplateList()
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.radTemplateList = res.Results;
            }
            else {
              this.messageBoxService.showMessage("success", ["Record not found"]);
            }
          }
        },
          err => {
            this.messageBoxService.showMessage("failed", ["Check log for error message."]);
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //this method fire when user click on add template button
  //this only show add edit page
  NewTemplate() {
    try {
      this.showAddEditPage = true;
      this.IsUpdate = false;
      this.currentTemplate = new RadiologyReportTemplate();
      this.FocusElementById('TemplateCode');
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //grid action
  TemplateGridActions($event: GridEmitModel) {
    try {
      switch ($event.Action) {
        case "edit": {
          this.IsUpdate = true;
          this.index = $event.RowIndex;
          this.currentTemplate = new RadiologyReportTemplate();
          this.showAddEditPage = true;
          this.changeDetector.detectChanges();
          this.FocusElementById('TemplateCode');
          //check template by template id present at local
          //if find locally then no need of server call 
          let template = this.radTemplateLocalData.find(i => i.TemplateId == $event.Data.TemplateId);
          if (template) {
            //assign value to currentTemplate
            this.currentTemplate = (this.currentTemplate, template.Template);
            // Object.assign(this.currentTemplate, this.radTemplateLocalData.find(i => i.TemplateId == $event.Data.TemplateId).Template[0])                        
          } else {
            //server call
            this.GetRADReportTemplateById($event.Data.TemplateId);
          }
          break;
        }
        default:
          break;
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //Get template data by templateId
  GetRADReportTemplateById(templateId: number) {
    try {
      this.settingsBLService.GetRADReportTemplateById(templateId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.currentTemplate = Object.assign(this.currentTemplate, res.Results);
            let localTemplateData = { TemplateId: templateId, Template: this.currentTemplate };
            this.radTemplateLocalData.push(localTemplateData);
          }
          else {
            this.messageBoxService.showMessage("success", ["Record not found"]);
          }

        },
          err => {
            this.messageBoxService.showMessage("Failed to get wards", ["Check log for error message."]);
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //method for onchange ckeditor 
  onChangeEditorData(data) {
    try {
      this.currentTemplate.TemplateHTML = data;
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //Add new template in database
  Add(): void {
    try {
      //if valid then call the BL service to do post request.
      if (this.IsValidModelCheck()) {
        this.currentTemplate.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
        this.currentTemplate.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.settingsBLService.AddRadiologyReportTemplate(this.currentTemplate)
          .subscribe(res => {
            this.messageBoxService.showMessage("Success", ["Template Saved."]);
            this.CallBackAddUpdate(res, "add");
          },
            err => this.logError(err));
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //UpdateTemplate
  Update(): void {
    try {
      //if valid then call the BL service to do post request.
      if (this.IsValidModelCheck()) {
        this.currentTemplate.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.settingsBLService.UpdateRadiologyReportTemplate(this.currentTemplate)
          .subscribe(res => {
            this.messageBoxService.showMessage("Success", ["Template Updated."]);
            this.CallBackAddUpdate(res, "update");
          },
            err => this.logError(err));
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //callback after add and update template data
  CallBackAddUpdate(res, action) {
    try {
      if (res.Status == "OK") {
        let radTemplate = new RadiologyReportTemplate();
        this.isValidTemplate = true;
        radTemplate = Object.assign(radTemplate, res.Results);
        if (action == "add") {

          this.radTemplateList.push(radTemplate);
          this.radTemplateList = this.radTemplateList.slice();
          let localTemplateData = { TemplateId: radTemplate.TemplateId, Template: radTemplate };
          this.radTemplateLocalData.push(localTemplateData);
          this.changeDetector.detectChanges();
          this.showAddEditPage = false;
        } else {
          //get index of data                      
          var i = this.radTemplateList.findIndex(x => x.TemplateId == radTemplate.TemplateId);
          this.radTemplateList.splice(i, 1);//delete old data
          this.radTemplateList.splice(this.index, 0, radTemplate);
          this.radTemplateList = this.radTemplateList.slice();//update list with latest data
          this.changeDetector.detectChanges();
          this.showAddEditPage = false;
        }
      }
      else {
        this.messageBoxService.showMessage("Error", ["Check log for details"]);
        this.logError(res.ErrorMessage);
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //check all validation
  IsValidModelCheck(): boolean {
    try {
      //marking every fields as dirty and checking validity
      for (var i in this.currentTemplate.RadiologyReportTemplateValidator.controls) {
        this.currentTemplate.RadiologyReportTemplateValidator.controls[i].markAsDirty();
        this.currentTemplate.RadiologyReportTemplateValidator.controls[i].updateValueAndValidity();
      }
      if ((this.currentTemplate.IsValidCheck(undefined, undefined) == true) && this.currentTemplate.TemplateHTML.length > 0) {
        this.isValidTemplate = true;
        return true;
      } else {
        if (this.currentTemplate.TemplateHTML.length <= 0) {
          this.isValidTemplate = false;
        }
        return false;
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //log error
  logError(err: any) {
    console.log(err);
  }
  //close popup
  Close() {
    try {
      this.showAddEditPage = false;
      this.IsUpdate = false;
      this.currentTemplate = new RadiologyReportTemplate();
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.messageBoxService.showMessage("error", ["Check error in Console log !"]);
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
