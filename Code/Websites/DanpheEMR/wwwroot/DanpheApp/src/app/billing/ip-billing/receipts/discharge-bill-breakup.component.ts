import { Component, Input, OnInit } from "@angular/core";
import { DischargeBillVM } from "../shared/discharge-bill.view.models";

@Component({
    selector: "discharge-bill-breakup",
    templateUrl: "./discharge-bill-breakup.html"
})
export class DischargeBillBreakupComponent {

    @Input("discharge-bill")
    public dischargeBill: DischargeBillVM;
 
    @Input("billType")
    public billType: string;

}