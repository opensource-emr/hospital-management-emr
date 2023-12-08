import { Component } from '@angular/core';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { ENUM_DanpheHTTPResponses } from '../../../shared/shared-enums';
import { SettingsService } from '../../shared/settings-service';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { TemplateType } from '../shared/template-type.model';

@Component({
  selector: 'app-template-type',
  templateUrl: './template-type.component.html'
})
export class TemplateTypeComponent {
  public templateTypeList: Array<TemplateType> = new Array<TemplateType>();
  public showGrid: boolean = false;
  public templateTypeGridColumns: Array<any> = null;

  constructor(
    public settingsServ: SettingsService,
    public settingsBLService: SettingsBLService,
  ) {
    this.templateTypeGridColumns = this.settingsServ.settingsGridCols.TemplateTypeList;
    this.GetTemplateTypeList();
  }
  GetTemplateTypeList() {
    this.settingsBLService.GetTemplateTypeList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.templateTypeList = res.Results;
          this.showGrid = true;
        }
        else {
          console.error(res.ErrorMessage)
        }

      });

  }


}
