
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { BillingPackage } from '../../billing/shared/billing-package.model';
import { BillingBLService } from '../shared/billing.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingService } from "../../billing/shared/billing.service";

//testing
@Component({
  selector: 'billing-package-select',
  templateUrl: './billing-package-select.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class BillingPackageSelectComponent {
  public billingPackageList: Array<BillingPackage> = new Array<BillingPackage>();
  @Output("callBack-select")
  callBackSelect: EventEmitter<Object> = new EventEmitter<Object>();
  public selectedPackage: BillingPackage;
  @Input("showSelectPage")
  public showSelectPage: boolean = false;
  public filterBy: string;
  public allPackage: Array<any> = [];
  public headerName: string;

  constructor(public billingBLService: BillingBLService,
    public msgBoxServ: MessageboxService,
    public billingService: BillingService) {
    this.getBillingPackageList();
  }

  filterData() {
    this.billingPackageList = this.allPackage.filter(ins =>
      ins.BillingPackageName.toLowerCase().includes(this.filterBy.toLowerCase())
      //ins.PackageCode.toLowerCase().includes(this.filterBy.toLowerCase()) ||
    );
  }

  public getBillingPackageList() {
    if (this.billingService.BillingFlow == "insurance") {
      this.headerName = "Insurance";
      this.billingBLService.GetInsurancePackages()
        .subscribe(res => { this.CallBackGetBillingPackageList(res) });
    }
    else {
      this.billingBLService.GetBillingPackageList()
        .subscribe(res => { this.CallBackGetBillingPackageList(res) });
    }

  }

  public CallBackGetBillingPackageList(res) {
    if (res.Status == "OK") {
      this.billingPackageList = res.Results;
      this.allPackage = this.billingPackageList;
      if (this.billingPackageList && this.billingPackageList.length > 0) {
        this.billingPackageList.forEach((currInsPkg: any) => {
          currInsPkg.IsSelected = false;//temporary property to bind with radiobutton.

          //sud: 21Jul'19 --
          //we need to make object to array for those packages having only one items.
          //that is a problem with XML to JSON Converter in Server side. 
          if (currInsPkg.BillingItemsXML.Items && currInsPkg.BillingItemsXML.Items.length == undefined) {
            let arrayFromItemObject = [currInsPkg.BillingItemsXML.Items];
            currInsPkg.BillingItemsXML.Items = arrayFromItemObject;
          }
          else if (currInsPkg.BillingItemsXML.Items && (currInsPkg.BillingItemsXML.Items.length == 0 || currInsPkg.BillingItemsXML.Items.length)) {
            //do nothing here.. 
          }


        });
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  //public getBillingPackageList() {
  //    this.billingBLService.GetBillingPackageList()
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.billingPackageList = res.Results;
  //                if (this.billingPackageList && this.billingPackageList.length > 0) {
  //                    this.billingPackageList.forEach((pkg:any) => {
  //                        pkg.IsSelected = false;//temporary property to bind with radiobutton.
  //                    });
  //                }
  //            }
  //            else {
  //                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //            }
  //        });
  //}

  @Input("showSelectPage")
  public set value(val: boolean) {
    this.showSelectPage = val;
    //ashim: 09Sep018 : to reset package selection.
    this.selectedPackage = null;

    if (!this.billingPackageList.length && this.showSelectPage) {
      this.msgBoxServ.showMessage("failed", ["No Packages Available"]);
      this.showSelectPage = false;
    }
    else {
      this.billingPackageList.forEach(pkg => pkg.IsSelected = false);
    }
  }
  public AssignPackage(pkg: BillingPackage) {
    this.selectedPackage = pkg;
  }
  public Submit() {
    if (this.selectedPackage)
      this.callBackSelect.emit({ pkg: this.selectedPackage });
    else
      this.msgBoxServ.showMessage("failed", ["Select Package"]);
  }
  Close() {
    this.selectedPackage = null;
    this.showSelectPage = false;
    this.filterBy = "";
    this.getBillingPackageList();
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.Close();
    }
  }

}
