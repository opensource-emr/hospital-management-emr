import { Injectable } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from './mr.bl.service';
@Injectable()

export class MedicalRecordService {

    public _Id: number = null;
    public icd10List: Array<any>=Array<any>();

    get Id(): number {
        return this._Id;
    }
    set Id(Id: number) {
        this._Id = Id;
    }

    constructor( public mrBLService: MR_BLService, public msgBoxServ:MessageboxService) {

    }

    
  public GetICDList() {
    this.mrBLService.GetICDList()
      .subscribe(res => {
        if (res.Status == 'OK') {

          this.icd10List = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get ICD10.. please check log for detail.']);
          console.log(err.ErrorMessage);
        });
  }

}
