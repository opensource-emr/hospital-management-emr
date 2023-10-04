import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { SterilizationService } from '../../sterilization.service';

@Component({
  selector: 'app-disinfect-item',
  templateUrl: './disinfect-item.component.html',
  styles: []
})
export class DisinfectItemComponent implements OnInit {

  @Input() showPopUp: boolean = false;
  @Input() selectedItemName: string = "";
  @Input() selectedItemCssdTxnId: number = null;
  storeForm: FormGroup;
  disinfectionDate: string;
  @Output("call-back-close") callBackClose: EventEmitter<any> = new EventEmitter();
  constructor(public msgBox: MessageboxService, public sterilizationService: SterilizationService) { }

  ngOnInit() {
    this.storeForm = new FormGroup({
      DisinfectedDate: new FormControl(''),
      DisinfectionMethod: new FormControl('', Validators.required),
      DisinfectionRemarks: new FormControl('')
    });
  }
  ngOnDestroy() {
    this.storeForm = null;
  }
  submit(form) {
    this.storeForm.updateValueAndValidity();
    this.storeForm.markAsTouched();
    if (this.storeForm.valid) {
      this.sterilizationService.disinfectCSSDItem(this.selectedItemCssdTxnId, form.DisinfectionMethod, form.DisinfectionRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.msgBox.showMessage("Success", ["Item disinfected successfully."]);
            this.Close({ event: 'disinfect', status: 'success' });
          }
          else {
            this.msgBox.showMessage("Failed", ["Failed to disinfect selected item."]);
          }
        }, err => {
          this.msgBox.showMessage("Failed", ["Failed to disinfect selected item."]);
        });
    }
    else {
      this.msgBox.showMessage("Failed", ["Check all the mandatory fields."]);
    }
  }
  Close(event: any = { event: 'close' }) {
    this.showPopUp = false;
    this.callBackClose.emit(event);
  }
}
