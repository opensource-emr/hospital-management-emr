import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { LabTest } from "../../shared/lab-test.model";
import { Observable } from 'rxjs/Observable';
import { LabReportTemplateModel } from '../../shared/lab-report-template.model';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabComponentModel } from '../../shared/lab-component-json.model';
import * as _ from 'lodash';
import { Subscription } from "rxjs/Rx";
import { ServiceDepartment } from '../../../billing/shared/service-department.model';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { DanpheHTTPResponse } from '../../../../../src/app/shared/common-models';
import { LabTestComponentMap } from '../shared/lab-test-component-map.model';
import { CoreCFGLookUp } from '../shared/coreCFGLookUp.model';
import { LabCategoryModel } from '../../shared/lab-category.model';

@Component({
  selector: 'add-lab-category',
  templateUrl: './add-lab-category.html'
})

export class AddLabCategoryComponent {
  public update: boolean = false;
  @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();
  @Input() labCategory: LabCategoryModel = new LabCategoryModel();
  public loading: boolean = false;

  constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public settingsBLService: SettingsBLService) {
  
  }

  ngOnInit() {
    if (this.labCategory && this.labCategory.TestCategoryId) {
      this.update = true;
    }
  }

  public AddNewCategory() {
    if (this.labCategory && this.labCategory.TestCategoryName.length && this.labCategory.TestCategoryName.trim() != '') {
      this.labSettingBlServ.PostNewLabCategory(this.labCategory)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.sendDataBack.emit({ close: true, category: this.labCategory });
          } else {
            this.msgBoxServ.showMessage("error", ['Cannot Add Lab Category']);
          }
        });
    } else {
      this.msgBoxServ.showMessage("error", ['Please Write Category Name']);
    }
  }

  public UpdateNewCategory() {
    if (this.labCategory && this.labCategory.TestCategoryId && this.labCategory.TestCategoryName.length && this.labCategory.TestCategoryName.trim() != '') {
      this.labSettingBlServ.PutLabCategory(this.labCategory)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.sendDataBack.emit({ close: true, category: this.labCategory });
          } else {
            this.msgBoxServ.showMessage("error", ['Cannot Update Lab Category']);
          }
        });
    } else {
      this.msgBoxServ.showMessage("error", ['Please Write Category Name']);
    }
  }

  public Close() {
    this.sendDataBack.emit({ close: true, category: null });
  }
  
}
