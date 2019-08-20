import { Component,Input, OnInit } from "@angular/core";
import {  DischargeBillVM } from "../shared/discharge-bill.view.models";
@Component({
    selector: "discharge-bill-summary",
    templateUrl: "./discharge-bill-summary.html"
})
export class DischargeBillSummaryComponent {

    @Input("discharge-bill")
    public dischargeBill: DischargeBillVM;
    @Input("billType")
    public billType: string;

    
}