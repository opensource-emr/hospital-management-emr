import { Component, Input, OnInit } from "@angular/core";
import { forEach } from "@angular/router/src/utils/collection";
import { CoreService } from "../../../../core/shared/core.service";
import { BilPrint_InvoiceItemVM } from "../../../shared/invoice-print-vms";
@Component({
    selector: "discharge-bill-summary",
    templateUrl: "./discharge-bill-summary.html"
})
export class DischargeBillSummaryComponent {

    public ShowProviderName: boolean;


    @Input("bill-items")
    public billItems: Array<BilPrint_InvoiceItemVM>;

    public data: Array<BilPrint_InvoiceItemVM>;


    constructor(public coreService: CoreService) {

        this.ShowProviderName = this.coreService.SetShowProviderNameFlag();
    }

 ngOnInit(){
this.data = this.billItems.reduce((acc,currVal) => {
    if(acc.hasOwnProperty(currVal.ItemName)){
      acc[currVal.ItemName].Quantity += currVal.Quantity;
      acc[currVal.ItemName].SubTotal +=currVal.SubTotal;
    } else{
      acc[currVal.ItemName] = currVal;
    }
    return acc;
},[]);

}


}