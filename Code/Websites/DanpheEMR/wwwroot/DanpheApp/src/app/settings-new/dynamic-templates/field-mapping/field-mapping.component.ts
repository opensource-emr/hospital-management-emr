import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { TemplateFieldMapping_DTO } from '../shared/template-field-mapping.dto';
import { TemplateFieldMappingModel } from '../shared/template-field-mapping.model';

@Component({
  selector: 'field-mapping',
  templateUrl: './field-mapping.component.html',

})
export class FieldMappingComponent implements OnInit {
  @Input('template-id')
  TemplateId: number;
  @Input('template-name')
  TemplateName: string = '';
  TemplateFieldMapping: TemplateFieldMappingModel;
  TemplateFieldMappings: TemplateFieldMapping_DTO[] = [];
  @Output('call-back-popup-close')
  CallBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();


  enterSequenceValidationMessage: string;
  IsValid: boolean;
  constructor(
    public settingsBLService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService
  ) {

  }

  ngOnInit() {
    if (this.TemplateId) {
      this.GetFieldMasterByTemplateId(this.TemplateId);
    }
  }
  GetFieldMasterByTemplateId(templateId: number) {
    this.settingsBLService.GetFieldMasterByTemplateId(templateId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.TemplateFieldMappings = res.Results;
        }
      });
  }
  Save() {
    const activeFields = this.TemplateFieldMappings.filter(field => field.IsActive === true || field.IsCompulsoryField === true);
    this.CheckValidation(activeFields)
    if (this.IsValid === false) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Enter Valid EnterSequence Number."]);
    }
    else {
      this.AddUpdateFieldMapping(this.TemplateFieldMappings);
    }
  }

  CheckValidation(template: TemplateFieldMapping_DTO[]) {
    this.IsValid = !(template.some(item => item.EnterSequence <= 0 || item.EnterSequence > 10000));
  }

  AddUpdateFieldMapping(selectedFields: TemplateFieldMapping_DTO[]) {
    try {
      this.settingsBLService.AddUpdateFieldMapping(selectedFields)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["FieldMappings is Saved."]);
            this.Close();
          }
        },
          err => this.logError(err));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ValidateSequenceNumber(template: TemplateFieldMapping_DTO) {
    template.IsSelected = false;
    if (template.EnterSequence <= 0) {
      this.enterSequenceValidationMessage = "Sequence number must be greater than zero";
      template.IsSelected = true;
    }
    else if (template.EnterSequence > 10000) {
      this.enterSequenceValidationMessage = "Sequence number must be less than 10000";
      template.IsSelected = true;
    }


  }

  OnCheckMapping(field: TemplateFieldMapping_DTO) {
    field.IsActive = !field.IsActive;

  }
  IsMandatory(field: TemplateFieldMapping_DTO) {
    field.IsMandatory = !field.IsMandatory;
  }

  Close() {
    this.CallBackPopupClose.emit();

  }
  logError(err: any) {
    console.error(err);
    this.msgBoxServ.showMessage("error", [err]);
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.error(ex);
    }
  }
  Discard() {
    let sure = window.confirm("Unsaved changes. Confirm discarding?");
    if (sure) {
      this.Close();
    }
  }

}
