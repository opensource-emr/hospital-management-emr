import { Component, Input } from "@angular/core";
import * as _ from 'lodash';
import { CoreService } from "../../../../core/shared/core.service";
import { BilPrintBillingSummaryVM, BilPrint_InvoiceItemVM } from "../../../shared/invoice-print-vms";
@Component({
  selector: "discharge-bill-summary",
  templateUrl: "./discharge-bill-summary.html"
})
export class DischargeBillSummaryComponent {

  public ShowProviderName: boolean;


  @Input("bill-items")
  public billItems: Array<BilPrint_InvoiceItemVM>;
  @Input("group-summary")
  public groupSummary = new Array<BilPrintBillingSummaryVM>();

  public data: Array<BilPrint_InvoiceItemVM>;
  public ShowItems: boolean = false;


  constructor(public coreService: CoreService) {

    this.ShowProviderName = this.coreService.SetShowProviderNameFlag();
  }

  ngOnInit() {
    console.log(this.groupSummary);
    let obj = _.cloneDeep(this.billItems); // * this is done to prevent the globel change occured into billItems object...., Krishna, 29th March'22
    this.data = obj.reduce((acc, currVal) => {
      if (acc.hasOwnProperty(currVal.ItemName)) {
        acc[currVal.ItemName].Quantity += currVal.Quantity;
        acc[currVal.ItemName].SubTotal += currVal.SubTotal;
      } else {
        acc[currVal.ItemName] = currVal;
      }
      return acc;
    }, []);

  }


}
