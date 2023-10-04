import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CoreService } from '../../../../core/shared/core.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { OtherChargesMasterModel } from '../other-charges.model';
import { OtherChargesService } from '../other-charges.service';

@Component({
  selector: 'app-other-charges-form',
  templateUrl: './other-charges-form.component.html',
  styleUrls: ['./other-charges-form.component.css']
})
export class OtherChargesFormComponent implements OnInit {

  otherChargesForm: FormGroup;
  @Input('OtherCharges') otherCharges: OtherChargesMasterModel;
  @Input('showAddPage') showAddPage: boolean = false;
  @Input('showEditMode') showEditMode: boolean = false;
  @Output("submit-event") submitEvent: EventEmitter<Object> = new EventEmitter<Object>();
  @Output("submit-update-event") submitUpdateEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output("close-add-page") callBackClose = new EventEmitter();
  @Output("close-edit-page") callEditClose = new EventEmitter();
  othercharges: Array<OtherChargesMasterModel> = new Array<OtherChargesMasterModel>();
  loading: boolean = false;
  constructor(private fb: FormBuilder, private _otherChargesService: OtherChargesService, private _msgBox: MessageboxService, private coreService: CoreService) {
    this.GetOtherCharges();
  }

  ngOnInit() {
    if (!this.otherCharges) {
      this.otherCharges = new OtherChargesMasterModel();
    }
    this.createOtherChargesForm();
  }

  createOtherChargesForm() {
    this.otherChargesForm = this.fb.group({
      ChargeId: [this.otherCharges.ChargeId],
      ChargeName: [this.otherCharges.ChargeName, [Validators.required]],
      Description: [this.otherCharges.Description],
      IsActive: [this.otherCharges.IsActive],
      IsVATApplicable: [this.otherCharges.IsVATApplicable],
      VATPercentage: [this.otherCharges.VATPercentage],
      IsDefault: [this.otherCharges.IsDefault]
    });
  }

  submit(form) {
    this.otherChargesForm.updateValueAndValidity();
    this.otherChargesForm.markAsUntouched();
    if (this.otherChargesForm.valid) {
      if (!this.showEditMode) {
        let charge = this.othercharges.filter(a => a.ChargeName.toLocaleLowerCase().replace(/\s+/g, '') == form.ChargeName.toLocaleLowerCase().replace(/\s+/g, ''));
        if (charge.length > 0) {
          this._msgBox.showMessage('Notification', [`Charge Name with the Name '${form.ChargeName}' is already saved.`, `Duplicate Charge Name is not allowed.`]);
          return;
        }
        if (form.VATPercentage < 0) {
          this._msgBox.showMessage('Notification', [`VAT Percentage should not be negative`]);
          return;
        }
        this.loading = true;
        form.CreatedOn = moment().format('YYYY-MM-DD');
        this._otherChargesService.createOtherCharges(form).finally(() => { this.loading = false })
          .subscribe(result => {
            if (result.Results && result.Status == "OK") {
              this.submitEvent.emit({ othercharge: result.Results });
              this._msgBox.showMessage("Success", [`Other Charges Added Successfully.`]);
              this.otherChargesForm.reset();
            }
          })
      }
      else {
        if (form.IsVATApplicable == false) {
          form.VATPercentage = 0;
        }
        this.submitUpdateEvent.emit(form);
      }
    }
    else {
      this._msgBox.showMessage("Failed", ["Check all the mandatory fields."]);
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
  hotkeys(event) {
    if (event.keyCode == 27) {
      // this.Close()
    }
  }
  Close() {
    this.callBackClose.emit();
    this.callEditClose.emit();
  }
  get ChargeName() {
    return this.otherChargesForm.get("ChargeName") as FormControl;
  }

  GetOtherCharges() {
    this._otherChargesService.GetOtherCharges().subscribe(res => {
      if (res.Status == "OK") {
        this.othercharges = res.Results;
      }
    })
  }

}
