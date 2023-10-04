import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CoreService } from '../../../../core/shared/core.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { OtherChargesMasterModel } from '../other-charges.model';
import { OtherChargesService } from '../other-charges.service';

@Component({
  selector: 'app-other-charges-edit',
  templateUrl: './other-charges-edit.component.html',
  styleUrls: ['./other-charges-edit.component.css']
})
export class OtherChargesEditComponent implements OnInit {

  otherChargesForm: FormGroup;
  @Input() otherCharges: OtherChargesMasterModel;
  @Input("showEditPage") showEditPage: boolean = false;
  @Input('ChargeId') ChargeId: number = null;
  @Output("update-event") UpdateEvent = new EventEmitter();
  @Output("close-edit-page") callBackClose = new EventEmitter();
  showEditMode: boolean = false;
  constructor(private fb: FormBuilder, private _otherChargesService: OtherChargesService, private _msgBox: MessageboxService, private coreService: CoreService) { }

  ngOnInit() {
    if (this.ChargeId != null && this.showEditPage) {
      this.GetChargeDetailById();
    }
  }
  Save(form) {
    form.Id = this.ChargeId;
    this._otherChargesService.UpdateOtherCharge(form)
      .subscribe(result => {
        if (result.Results && result.Status == "OK") {
          this.UpdateEvent.emit();
          this._msgBox.showMessage("Success", [`Other Charge Updated Successfully.`]);
        }
      })
  }
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  hotkeys(event) {
    if (event.keyCode == 27) {
      // this.Close()
    }
  }
  Close() {
    this.callBackClose.emit();
    this.showEditMode = false;
  }
  get ChargeName() {
    return this.otherChargesForm.get("ChargeName") as FormControl;
  }

  GetChargeDetailById() {
    this._otherChargesService.GetOtherCharge(this.ChargeId).subscribe(res => {
      if (res.Status == "OK") {
        this.otherCharges = res.Results;
        this.showEditMode = true;
      }
      else {
        this._msgBox.showMessage("Failed", ["Failed to get charge details."]);
      }
    })
  }


}
