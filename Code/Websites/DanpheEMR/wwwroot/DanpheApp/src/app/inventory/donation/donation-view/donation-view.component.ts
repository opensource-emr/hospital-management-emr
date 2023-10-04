import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { InventoryService } from '../../shared/inventory.service';
import { DonationDetailsVM, DonationModel } from '../donation.model';
import { DonationService } from '../donation.service';

@Component({
  selector: 'app-donation-view',
  templateUrl: './donation-view.component.html',
  styleUrls: ['./donation-view.component.css']
})
export class DonationViewComponent implements OnInit {
  showReceipt: boolean = false;
  headerDetail: any;
  DonationId: number = null;
  DonationData: DonationDetailsVM = new DonationDetailsVM();
  printDetaiils: HTMLElement;
  showPrint: boolean = false;
  loading: boolean = false;
  model: DonationModel;
  editMode: boolean = false;
  showNepaliReceipt: boolean = false;
  Remarks: string = null;
  showCancelPopUp: boolean = false;
  disableButton: boolean = true;

  constructor(public donationService: DonationService, public coreService: CoreService, public msgBox: MessageboxService, public inventoryService: InventoryService, public router: Router, public routeFromService: RouteFromService,) { }

  ngOnInit() {
    this.CheckReceiptSettings();
    this.GetInventoryBillingHeaderParameter();
    this.DonationId = this.inventoryService.DonationId
    this.GetDonationViewById(this.DonationId)
  }

  GetDonationViewById(donationId) {
    this.donationService.GetDonationViewById(donationId).subscribe(res => {
      if (res.Status == "OK") {
        this.DonationData = res.Results;
        this.showReceipt = true;
      }
      else {
        this.msgBox.showMessage("Failed", [`Failed to get donation details.  ${res.ErrorMessage}`])
      }
    },
      err => {
        this.msgBox.showMessage("Failed", [`Failed to get donation details ${err.ErrorMessage}`])
      })
  }
  CheckReceiptSettings() {
    //check for english or nepali receipt style
    let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
  }

  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  Close() {
    this.showReceipt = false;
    this.router.navigate(["/Inventory/Donation/DonationList"]);
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
  edit(donationId) {
    this.loading = true;
    this.donationService.GetDonationById(donationId).finally(() => { this.loading = false; }).subscribe(res => {
      if (res.Status == "OK") {
        this.model = res.Results;
        this.editMode = true;
      }
      else {
        this.msgBox.showMessage("Failed", [`Failed to get dontion details. ${res.ErrorMessage}`])
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
