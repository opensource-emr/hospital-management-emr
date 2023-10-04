import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { EditDoctorFeatureViewModel } from '../../billing/shared/edit-doctor-feature-view.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingBLService } from '../../billing/shared/billing.bl.service';

@Component({
  selector: "rad-edit-doctor",
  templateUrl: "./rad-edit-doctors-popup.html"
})

export class RadiologyEditDoctorsPopupComponent {


  //public showEditDoctorPage: boolean = false;
  @Input("editDoctor")
  public SelectedItem: EditDoctorFeatureViewModel;
  @Output("update-doctor")
  updateDoctor: EventEmitter<Object> = new EventEmitter<Object>();
  //for doctor list
  public doctorList: any;
  //for assigning the new provider
  public newPerformer = { EmployeeId: null, EmployeeName: null };
  public newPrescriber = { EmployeeId: null, EmployeeName: null };
  public showmsgbox: boolean = false;
  public showPrescriberChange: boolean = false;
  public status: string = null;
  public message: string = null;

  constructor(public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef,
    public billingBlService: BillingBLService, public router: Router) {

  }

  ngOnInit() {
    this.GetDoctorList();
    if (this.SelectedItem.PerformerId) {
      this.newPerformer = { EmployeeId: this.SelectedItem.PerformerId, EmployeeName: this.SelectedItem.PerformerName };
    }
    if (this.SelectedItem.PrescriberId) {
      this.newPrescriber = { EmployeeId: this.SelectedItem.PrescriberId, EmployeeName: this.SelectedItem.PrescriberName };
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
  GetDoctorList(): void {
    this.newPerformer = null;
    this.newPrescriber = null;
    this.billingBlService.GetProviderList()
      .subscribe(res => this.CallBackGenerateDoctor(res));
  }

  ////this is a success callback of GenerateDoctorList function.
  CallBackGenerateDoctor(res) {
    if (res.Status == "OK") {
      this.doctorList = [];
      this.doctorList.push({ EmployeeId: null, EmployeeName: 'No Doctor' });
      //format return list into Key:Value form, since it searches also by the property name of json.
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.doctorList.push(a);
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
    this.updateDoctor.emit({ SelectedItem: null });
  }



  // for updating the provider
  UpdatePeformerAndPrescriber() {
    let billTxnItemId = this.SelectedItem.BillingTransactionItemId;
    let requisitionId = this.SelectedItem.RequisitionId;
    let performer;
    let prescriber;

    if (this.newPerformer) {
      performer = this.newPerformer.EmployeeName.replace(/&/g, '%26');
      this.newPerformer.EmployeeName = performer;
    }
    if (this.newPrescriber) {
      prescriber = this.newPrescriber.EmployeeName.replace(/&/g, '%26');
      this.newPrescriber.EmployeeName = prescriber;
    }
    //let provider = this.newProvider.EmployeeName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    //let referrer = this.newReferrer.EmployeeName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
    //this.newProvider.EmployeeName = provider;
    //this.newReferrer.EmployeeName = referrer;
    this.billingBlService.UpdateDoctorafterDoctorEditRadiology(billTxnItemId, requisitionId, this.newPerformer, this.newPrescriber)
      .subscribe(res => {
        if (res.Status == "OK") {

           ///emiting the event to the parent page 
           this.updateDoctor.emit({ SelectedItem: this.SelectedItem });
         
          //this.changeDetector.detectChanges();
          this.router.navigate(['/Radiology/EditDoctors']);
          this.msgBoxServ.showMessage("success", ["Saved Successfully."]);
        }
        else {
          this.msgBoxServ.showMessage("error", ["Sorry!!! Not able to update the Doctor"]);
          console.log(res.ErrorMessage)
        }

      });

  }


  //used to format the display of item in ng-autocomplete.
  PerformerListFormatter(data: any): string {
    let html = data["EmployeeName"];
    return html;
  }

  showPrescriber() {
    return this.showPrescriberChange = true;
  }

}
