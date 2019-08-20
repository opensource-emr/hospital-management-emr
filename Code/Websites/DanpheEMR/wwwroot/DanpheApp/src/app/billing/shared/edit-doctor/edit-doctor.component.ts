import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Router } from '@angular/router';

import { EditDoctorFeatureViewModel } from "../../shared/edit-doctor-feature-view.model";


import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingBLService } from '../billing.bl.service';

@Component({
    selector: "danphe-edit-doctor",
    templateUrl: "./edit-doctor-popup.html"
})

export class EditDoctorComponent {


    public showEditDoctorPage: boolean = false;
    @Input("editDoctor")
    public SelectedItem: EditDoctorFeatureViewModel;
    @Output("update-provider")
    updateprovider: EventEmitter<Object> = new EventEmitter<Object>();
    //for doctor list
    public providerList: any;
    //for assigning the new provider
    public newProvider: any;
    public showmsgbox: boolean = false;
    public status: string = null;
    public message: string = null;

    constructor(public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef,
        public billingBlService: BillingBLService, public router: Router) {

    }

    @Input("showEditDoctorPage")
    public set value(val: boolean) {
        if (val) {

            //get the  provider list
            this.GetProviderList();
        }
        this.showEditDoctorPage = val;
    }



    //load doctor  
    GetProviderList(): void {
        this.newProvider = null;
        this.billingBlService.GetProviderList()
            .subscribe(res => this.CallBackGenerateDoctor(res));
    }

    ////this is a success callback of GenerateDoctorList function.
    CallBackGenerateDoctor(res) {
        if (res.Status == "OK") {
            this.providerList = [];
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
        this.showEditDoctorPage = false;
    }

    // for updating the provider
    UpdateProvider() {
        if (this.newProvider != undefined && this.newProvider.EmployeeId) {
            let billTxnItemId = this.SelectedItem.BillingTransactionItemId;
            let ProviderId = this.newProvider.EmployeeId;
            let ProviderName = this.newProvider.EmployeeName;
            this.billingBlService.UpdateDoctorafterDoctorEdit(billTxnItemId, ProviderName, ProviderId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.Close();
                        if (this.newProvider) {
                            ///emiting the event to the parent page 
                            this.updateprovider.emit({ SelectedItem: this.SelectedItem });
                        }
                        else {
                            this.updateprovider.emit({ SelectedItem: null });
                        }
                        this.changeDetector.detectChanges();
                        this.router.navigate(['/Billing/EditDoctor']);
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able to update the Doctor"]);
                        console.log(res.ErrorMessage)
                    }

                });

        }
        else {
            this.msgBoxServ.showMessage("notice", ["Please!!! select proper Doctor before updating"]);
        }

    }


    //used to format the display of item in ng-autocomplete.
    ProviderListFormatter(data: any): string {
        let html = data["EmployeeName"];
        return html;
    }

}