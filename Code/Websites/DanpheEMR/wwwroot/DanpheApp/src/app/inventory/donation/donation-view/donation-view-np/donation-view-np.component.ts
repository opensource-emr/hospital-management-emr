import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../../core/shared/core.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { DonationDetailsVM, DonationModel } from '../../donation.model';
import { DonationService } from '../../donation.service';

@Component({
  selector: 'app-donation-view-np',
  templateUrl: './donation-view-np.component.html',
  styleUrls: ['./donation-view-np.component.css']
})
export class DonationViewNpComponent implements OnInit {

  model: DonationModel;
  headerDetail: any;
  @Input('donationData') donationData: DonationDetailsVM = new DonationDetailsVM();
  @Output("call-back-close") callbackClose: EventEmitter<any> = new EventEmitter();

  printDetaiils: HTMLElement;
  showPrint: boolean = false;
  editMode: boolean = false;
  loading: boolean = false;
  showCancelPopUp: boolean;
  Remarks: string = null;
  disableButton: boolean = true;;

  constructor(public coreService: CoreService, public msgBox: MessageboxService, public donationService: DonationService, public router: Router) { }

  ngOnInit() {
    this.GetInventoryBillingHeaderParameter();
  }
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Failed to get header parameter"]);
  }
  Close() {
    this.callbackClose.emit();
  }
  Print() {
    var abc = document.getElementById("print-page");
    var printHtmlEntity = document.createElement("div");

    printHtmlEntity.innerHTML = `<style>
    tr.donation-item-header th, tr.donation-item-row td { font-size: 1rem !important; }
    tr.donation-item-header :first-child, tr.donation-item-row :first-child {  width: 4rem; }
    .break-word-in-print {  overflow-wrap: break-word;}
    </style>` + abc.innerHTML;
    this.printDetaiils = printHtmlEntity;
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  Edit(donationId) {
    this.loading = true;
    this.donationService.GetDonationById(donationId).finally(() => { this.loading = false; }).subscribe(res => {
      if (res.Status == "OK") {
        this.model = res.Results;
        this.editMode = true;
      }
    })
  }
  Cancel() {
    this.showCancelPopUp = true;
  }
  CancelDonation(donationId, Remarks) {
    this.donationService.CancelDonation(donationId, Remarks).finally(() => {
      this.loading = false;
    }).subscribe(res => {
      if (res.Status == "OK") {
        this.msgBox.showMessage("Success", ["Donation Cancelled Successfully !"]);
        this.router.navigate(["/Inventory/Donation/DonationList"]);
        this.showCancelPopUp = false;
      }
      else {
        this.msgBox.showMessage("Failed", [`Failed to get dontion details. ${res.ErrorMessage}`]);
      }
    })
  }
  LoadRemarks() {
    if (this.Remarks.trim() != '') {
      this.disableButton = false;
    }
    else {
      this.disableButton = true;
    }
  }

}
