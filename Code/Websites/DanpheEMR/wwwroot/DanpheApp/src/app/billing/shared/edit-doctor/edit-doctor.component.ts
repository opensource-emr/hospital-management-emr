import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Router } from '@angular/router';

import { EditDoctorFeatureViewModel } from "../../shared/edit-doctor-feature-view.model";


import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingBLService } from '../billing.bl.service';

@Component({
  selector: "danphe-edit-doctor",
  templateUrl: "./edit-doctor-popup.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class EditDoctorComponent {


  //public showEditDoctorPage: boolean = false;
  @Input("editDoctor")
  public SelectedItem: EditDoctorFeatureViewModel;
  @Output("update-provider")
  updateprovider: EventEmitter<Object> = new EventEmitter<Object>();
  //for doctor list
  public providerList: any;
  //for assigning the new provider
  public newProvider = { EmployeeId: null, EmployeeName: null };
  public newReferrer = { EmployeeId: null, EmployeeName: null };
  public showmsgbox: boolean = false;
  public status: string = null;
  public message: string = null;

  constructor(public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef,
    public billingBlService: BillingBLService, public router: Router) {

  }

  ngOnInit() {
    this.GetProviderList();
    if (this.SelectedItem.ProviderId) {
      this.newProvider = { EmployeeId: this.SelectedItem.ProviderId, EmployeeName: this.SelectedItem.ProviderName };
    }
    if (this.SelectedItem.ReferredById) {
      this.newReferrer = { EmployeeId: this.SelectedItem.ReferredById, EmployeeName: this.SelectedItem.ReferredByName };
    }

  }


  //@Input("showEditDoctorPage")
  //public set value(val: boolean) {
  //  if (val) {

  //    //get the  provider list
  //    this.GetProviderList();
  //  }
  //  this.showEditDoctorPage = val;
  //}

  //load doctor  
  GetProviderList(): void {
    this.newProvider = null;
    this.newReferrer = null;
    this.billingBlService.GetProviderList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  ////this is a success callback of GenerateDoctorList function.
  CallBackGenerateDoctor(res) {
    if (res.Status == "OK") {
      this.providerList = [];
      this.providerList.push({ EmployeeId: null, EmployeeName: 'No Doctor' });
      //format return list into Key:Value form, since it searches also by the property name of json.
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.providerList.push(a);
        });
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Not able to get Doctor list"]);
      console.log(res.ErrorMessage)
    }
  }
  //to close the pop up
  Close() {
    //this.showEditDoctorPage = false;
    this.updateprovider.emit({ SelectedItem: null });
  }


  //// for updating the provider
  //UpdateProvider() {
  //  if (this.newProvider != undefined && this.newProvider.EmployeeId) {
  //    let billTxnItemId = this.SelectedItem.BillingTransactionItemId;
  //    let ProviderId = this.newProvider.EmployeeId;
  //    let ProviderName = this.newProvider.EmployeeName;
  //    this.billingBlService.UpdateDoctorafterDoctorEdit(billTxnItemId, ProviderName, ProviderId)
  //      .subscribe(res => {
  //        if (res.Status == "OK") {
  //          this.Close();
  //          if (this.newProvider) {
  //            ///emiting the event to the parent page 
  //            this.updateprovider.emit({ SelectedItem: this.SelectedItem });
  //          }
  //          else {
  //            this.updateprovider.emit({ SelectedItem: null });
  //          }
  //          this.changeDetector.detectChanges();
  //          this.router.navigate(['/Billing/EditDoctor']);
  //        }
  //        else {
  //          this.msgBoxServ.showMessage("error", ["Sorry!!! Not able to update the Doctor"]);
  //          console.log(res.ErrorMessage)
  //        }

  //      });

  //  }
  //  else {
  //    this.msgBoxServ.showMessage("notice", ["Please!!! select proper Doctor before updating"]);
  //  }

  //}

  // for updating the provider
  UpdateProviderAndReferer() {
    let billTxnItemId = this.SelectedItem.BillingTransactionItemId;
    let provider;
    let referrer;

    if (this.newProvider) {
      provider = this.newProvider.EmployeeName.replace(/&/g, '%26');
      this.newProvider.EmployeeName = provider;
    }
    if (this.newReferrer) {
      referrer = this.newReferrer.EmployeeName.replace(/&/g, '%26');
      this.newReferrer.EmployeeName = referrer;
    }
    //let provider = this.newProvider.EmployeeName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    //let referrer = this.newReferrer.EmployeeName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    //this.newProvider.EmployeeName = provider;
    //this.newReferrer.EmployeeName = referrer;
    this.billingBlService.UpdateDoctorafterDoctorEdit(billTxnItemId, this.newProvider, this.newReferrer)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.Close();
          if (this.newProvider || this.newReferrer) {
            ///emiting the event to the parent page 
            this.updateprovider.emit({ SelectedItem: this.SelectedItem });
          }
          else {
            this.updateprovider.emit({ SelectedItem: null });
          }
          //this.changeDetector.detectChanges();
          this.router.navigate(['/Billing/EditDoctor']);
        }
        else {
          this.msgBoxServ.showMessage("error", ["Sorry!!! Not able to update the Doctor"]);
          console.log(res.ErrorMessage)
        }

      });

  }


  //used to format the display of item in ng-autocomplete.
  ProviderListFormatter(data: any): string {
    let html = data["EmployeeName"];
    return html;
  }
  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.Close();
    }
  }
}
