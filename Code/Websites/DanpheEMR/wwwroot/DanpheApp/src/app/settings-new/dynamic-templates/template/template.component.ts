import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses } from '../../../shared/shared-enums';
import { SettingsService } from '../../shared/settings-service';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { Template_DTO } from '../shared/template-dto';
import { TemplateFieldMappingModel } from '../shared/template-field-mapping.model';
import { Template } from '../shared/template.model';


@Component({
  selector: 'app-template',
  templateUrl: './template.component.html'
})
export class TemplateComponent {
  public templateList: Array<Template_DTO> = new Array<Template_DTO>();
  public showGrid: boolean = true;
  public templateGridColumns: Array<any> = null;
  public selectedItem: Template;
  public showAddEditPage: boolean = false;
  public IsUpdate: boolean = false;
  public isValidTemplate: boolean = true;
  public currentTemplate: Template = new Template();
  public templateTypeList: Array<Template_DTO> = [];
  public dynTemplateList: Array<Template> = new Array<Template>();

  //property for save called tempalate data at locally
  public dynTemplateLocalData = new Array<{ TemplateId: number, Template: Template }>();

  public index: number;
  public showFieldMappingPage: boolean = false;
  public TemplateFieldMapping: TemplateFieldMappingModel;
  public TemplateId: number = 0;
  public TemplateName: string = '';
  constructor(
    public settingsServ: SettingsService,
    public settingsBLService: SettingsBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public router: Router
  ) {
    this.templateGridColumns = this.settingsServ.settingsGridCols.TemplateList;
    this.GetTemplateList();
  }
  GetTemplateList() {
    this.settingsBLService.GetTemplateList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.templateList = res.Results;
          this.showGrid = true;
        }
        else {
          console.error(res.ErrorMessage)
        }

      });
  }

  TemplateGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "field-mapping": {
        this.TemplateId = $event.Data.TemplateId;
        this.TemplateName = $event.Data.TemplateName;
        this.showFieldMappingPage = true;

        break;
      }
      case "edit": {
        this.IsUpdate = true;
        this.index = $event.RowIndex;
        this.currentTemplate = new Template();
        this.showAddEditPage = true;
        this.changeDetector.detectChanges();
        // this.GetTemplateType();
        this.FocusElementById('TemplateName');
        //check template by template id present at local
        //if find locally then no need of server call 
        let template = this.dynTemplateLocalData.find(i => i.TemplateId == $event.Data.TemplateId);
        if (template) {
          //assign value to currentTemplate
          this.currentTemplate = Object.assign(this.currentTemplate, template.Template);
          this.currentTemplate.DynamicTemplateValidator.controls['TemplateTypeId'].setValue(this.currentTemplate.TemplateTypeId);
        } else {
          //server call
          this.GetDynTemplateDataById($event.Data.TemplateId);
        }
        break;
      }
      case "activate-deactivate": {
        if ($event.Data != null) {
          this.selectedItem = null;
          this.selectedItem = $event.Data;
          this.ActivateDeactivateTemplate(this.selectedItem);
        }
        break;
      }

      default:
        break;
    }
  }
  GetDynTemplateDataById(templateId: number) {
    try {
      this.settingsBLService.GetDynTemplateDataById(templateId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.currentTemplate = Object.assign(this.currentTemplate, res.Results);
            this.currentTemplate.DynamicTemplateValidator.controls['TemplateTypeId'].setValue(this.currentTemplate.TemplateTypeId);
            let localTemplateData = { TemplateId: templateId, Template: this.currentTemplate };
            this.dynTemplateLocalData.push(localTemplateData);
            this.GetTemplateType();
          }
          else {
            this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Record not found"]);
          }

        },
          err => {
            this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Check log for error message."]);
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //Update template status- Activate or Deactivate 
  ActivateDeactivateTemplate(currTemplate: Template) {
    if (currTemplate != null) {

      let proceed: boolean = true;

      if (currTemplate.IsActive) {
        proceed = window.confirm("This template will stop working. Are you sure you want to proceed ?")
      }
      else {
        proceed = window.confirm("Proceed with activating this template?")
      }

      if (proceed) {
        this.settingsBLService.UpdateTemplateSettings(currTemplate.TemplateId)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.OK, ['template Status updated successfully']);
              this.GetTemplateList();
            }
            else {
              this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ['Something wrong, Please Try again..!']);
            }
          },
            err => {
              this.logError(err);
            });
      }
    }
  }

  logError(err: any) {
    console.error(err);
    this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, [err]);
  }

  NewTemplate() {
    try {
      this.GetTemplateType();
      this.showAddEditPage = true;
      this.IsUpdate = false;
      this.currentTemplate = new Template();
      this.FocusElementById('TemplateName');
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  Close() {
    try {
      this.showAddEditPage = false;
      this.IsUpdate = false;
      this.currentTemplate = new Template();
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Check error in Console log !"]);
      console.error(ex);
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
  //check all validation
  IsValidModelCheck(): boolean {
    try {
      //marking every fields as dirty and checking validity
      for (var i in this.currentTemplate.DynamicTemplateValidator.controls) {
        this.currentTemplate.DynamicTemplateValidator.controls[i].markAsDirty();
        this.currentTemplate.DynamicTemplateValidator.controls[i].updateValueAndValidity();
      }
      if ((this.currentTemplate.IsValidCheck(undefined, undefined) == true) && this.currentTemplate.PrintContentHTML.length > 0) {
        this.isValidTemplate = true;
        return true;
      } else {
        if (this.currentTemplate.PrintContentHTML.length <= 0) {
          this.isValidTemplate = false;
        }
        return false;
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }


  GetTemplateType() {
    this.settingsBLService.GetTemplateType()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.templateTypeList = res.Results;
        }
      })
  }

  //method for onchange ckeditor 
  onChangeEditorData(data) {
    try {
      this.currentTemplate.PrintContentHTML = data;
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Add new template in database
  AddNewTemplate(): void {
    try {
      if (this.IsValidModelCheck()) {
        this.currentTemplate.TemplateTypeId = this.currentTemplate.DynamicTemplateValidator.get('TemplateTypeId').value;
        this.currentTemplate.IsActive = true;
        this.settingsBLService.AddNewTemplate(this.currentTemplate)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status = ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.OK, ["Template Saved."]);
              this.CallBackAddUpdate(res, "add");
              this.GetTemplateList();
            }
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
      //if valid then call the BL service to do put request.
      if (this.IsValidModelCheck()) {
        this.settingsBLService.UpdateDynTemplate(this.currentTemplate)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.msgBoxServ.showMessage("Success", ["Template Updated."]);
              this.CallBackAddUpdate(res, "update");
              this.GetTemplateList();
            }
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
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        let dynTemplate = new Template();
        this.isValidTemplate = true;
        dynTemplate = Object.assign(dynTemplate, res.Results);
        if (action == "add") {

          this.dynTemplateList.push(dynTemplate);
          this.dynTemplateList = this.dynTemplateList.slice();
          let localTemplateData = { TemplateId: dynTemplate.TemplateId, Template: dynTemplate };
          this.dynTemplateLocalData.push(localTemplateData);
          this.changeDetector.detectChanges();
          this.showAddEditPage = false;
        } else {
          //get index of data                      
          var i = this.dynTemplateList.findIndex(x => x.TemplateId == dynTemplate.TemplateId);
          this.dynTemplateList.splice(i, 1);//delete old data
          this.dynTemplateList.splice(this.index, 0, dynTemplate);
          this.dynTemplateList = this.dynTemplateList.slice();//update list with latest data
          this.changeDetector.detectChanges();
          this.showAddEditPage = false;
        }
      }
      else {
        this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Check log for details"]);
        this.logError(res.ErrorMessage);
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ClosePopup() {
    this.showFieldMappingPage = false;
  }

}

