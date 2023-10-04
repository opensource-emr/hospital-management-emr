import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../../../src/app/shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../../../../src/app/shared/common-models';
import { CoreCFGLookUp } from '../shared/coreCFGLookUp.model';

@Component({
  selector: 'add-lookUp',
  templateUrl: './lookups-add.component.html',
  styles: [`
        .managetxt label{line-height: 2;}
textarea{resize: none;}
      `]
})

export class AddLookUpComponent {
  @Input() labLookUpComponent: CoreCFGLookUp = new CoreCFGLookUp();

  public lookUpData: Array<any> = new Array();
  public update: boolean = false;

  public index: number = 1;
  public loading: boolean = false;
  public initialLoad: boolean = true;


  @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();

  constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {  }

  ngOnInit() {
    if (this.labLookUpComponent && this.labLookUpComponent.LookUpId) {
      this.update = true;
      this.lookUpData = JSON.parse(this.labLookUpComponent.LookupDataJson);
    } else {
      this.update = false;
      this.labLookUpComponent = new CoreCFGLookUp();
      this.labLookUpComponent.ModuleName = "Lab";
      this.AddRowRequest();
      this.initialLoad = false;
    }
  }

  DeleteRow(ind) {
    this.lookUpData.splice(ind, 1);
  }

  AddRowRequest() {
    let newCompJson:string = "";
    this.lookUpData.push(newCompJson);
  }

  lookUpListFormatter(data: any): string {
    let html = data["LookUpName"];
    return html;
  }
  customTrackBy(index: number, obj: any): any {
    return index;
  }

  public AddNewLookUp() {
    if (this.loading && this.lookUpData[0]!="") {
      this.labLookUpComponent.LookupDataJson = JSON.stringify(this.lookUpData);
      this.labSettingBlServ.PostLabLookUp(this.labLookUpComponent)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.sendDataBack.emit({ LookUp: res.Results, success: true });
              this.msgBoxServ.showMessage("success", ["Labtest component posted successfully!"]);
            } else {
              this.msgBoxServ.showMessage("Failed", ["Cannot Post the Labtest component!"]);
              this.sendDataBack.emit({ LookUp: res.Results, success: false });
            }
          });
      }
      else {
      this.msgBoxServ.showMessage("error", ["something occured"]);
        this.loading = false;
      }



  }

  public UpdateLookUp() {
    if (this.loading && this.lookUpData[0] != "") {
      this.labLookUpComponent.LookupDataJson = JSON.stringify(this.lookUpData);
      this.labSettingBlServ.UpdateLabLookUpComponent(this.labLookUpComponent)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.sendDataBack.emit({ lookup: this.labLookUpComponent, success: true });
              this.msgBoxServ.showMessage("success", [this.labLookUpComponent.LookUpName + "Labtest component Updated successfully!"]);
            } else {
              this.msgBoxServ.showMessage("Failed", ["Cannot Update " + this.labLookUpComponent.LookUpName + "Lookup!"]);
              this.sendDataBack.emit({ LookUp: res.Results, success: false });
            }
          });
      }
      else {
        this.msgBoxServ.showMessage("error",["something occured"]);
        this.loading = false;
    }
  }

  closePopUpBox() {
    this.sendDataBack.emit({ LookUp: null, success: false });
  }
}
