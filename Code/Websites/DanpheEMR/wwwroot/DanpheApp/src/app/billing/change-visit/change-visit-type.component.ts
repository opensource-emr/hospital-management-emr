import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core'
import { BillingTransactionItem } from '../shared/billing-transaction-item.model';
import { BillingBLService } from '../shared/billing.bl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';

@Component({
    selector: 'change-visit-type',
    templateUrl: "./change-visit-type.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class ChangeVisitTypeComponent {

    @Input("itemToEdit")
    itemToEdit_Input: BillingTransactionItem = null;

    @Input("patientInfo")
    currPatientInfo: any;


    @Output("on-closed")
    public onClose = new EventEmitter<object>();

    constructor() {

    }


    ContinueERBilling() {
        this.onClose.emit({ CloseWindow: true, EventName: "continueWithER" });
    }

    ChangeToOutpatient() {
        this.onClose.emit({ CloseWindow: true, EventName: "changeToOPD" });
    }


    OnPopupClosed() {
        this.onClose.emit({ CloseWindow: true, EventName: "close" });
    }

    public hotkeys(event) {
        if (event.keyCode == 27) {//key->ESC
            this.OnPopupClosed();
        }
    }
}