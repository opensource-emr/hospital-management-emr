import { Component, Injector, ChangeDetectorRef, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { BillingService } from '../../shared/billing.service';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingReceiptModel } from "../../shared/billing-receipt.model";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { RouteFromService } from '../../../shared/routefrom.service';
import { Visit } from "../../../appointments/shared/visit.model";
//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
//import { BackButtonDisable } from "../../core/shared/backbutton-disable.service";
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { Location } from "@angular/common";
import { VisitService } from "../../../appointments/shared/visit.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
  selector: "bil-print-invoice-main-old",
  templateUrl: "./receipt-print-main-old.html"
})
export class ReceiptPrintMainComponent_Old implements OnInit {

  showReceiptNavigation: boolean = false;
  currentReceiptNo: number = 1;
  disablePreviousBtn: boolean = false;
  disableNextBtn: boolean = false;
  showOpdSticker: boolean = false;

  billingReceipt: BillingReceiptModel = new BillingReceiptModel();
  selectedVisit: Visit = new Visit();
  //public _backbutton: BackButtonDisable;
  latestBillingReceiptNo: number = 0;//sud-5May'18: why do we need this here ??

  //to show whether provisional or other receipt.
  public showProvisionalReceipt = false;
  public showInpatientReceipt: boolean = false;//sud:20Au'18
  public showNormalReceipt: boolean = true;//by default this will be true. 
  public showERSticker: boolean = false;
  public showPackageBillingSticker: boolean = false;
  public patientVisitId: number;
  public isInsuranceBilling: boolean = false;
  public IMISCode: string = "";
  public billingTransactionId: number;
  public numberofbill: { pharmacy, billing, inventory };
  public noOfBillGenerate: number = 0;
  public _locationSubscription: any;
  constructor(
    public location: Location,
    //  public commonService: CommonService,
    public changeDetectorRef: ChangeDetectorRef,
    public billingBlService: BillingBLService,
    public billingService: BillingService,
    public router: Router,
    public msgbox: MessageboxService,
    public routeFromSrv: RouteFromService,
    public httpobj: HttpClient,
    public visitService: VisitService,
    public injector: Injector,
    public coreService: CoreService) {

    //show-hide receipt navigation based on requesting page.
    this.showReceiptNavigation = (routeFromSrv.RouteFrom == "duplicate-bills");

    if (this.billingService.globalBillingReceipt.PrintCount == 0 && this.billingService.globalBillingReceipt.ReceiptNo != 0) {
      this.GetBillPrintParameter();
    }

    this.billingReceipt = this.billingService.globalBillingReceipt;
    this.isInsuranceBilling = this.billingReceipt.IsInsuranceBilling;
    this.selectedVisit.ClaimCode = this.visitService.ClaimCode;
    this.IMISCode = this.billingReceipt.IMISCode;
    this.billingReceipt.BillingDate = moment(this.billingReceipt.BillingDate).format("YYYY-MM-DD hh:mm A");
    this.currentReceiptNo = this.billingReceipt.ReceiptNo;


    this.showOpdSticker = (routeFromSrv.RouteFrom == "OPD");
    this.showERSticker = (routeFromSrv.RouteFrom == "ER-Sticker");
    routeFromSrv.RouteFrom = "";//reset value to empty once checked.

    if (this.showERSticker) {
      this.patientVisitId = this.billingReceipt.VisitId;
    }
    else if (this.showOpdSticker) {
      //we have to show OPDSticker for only appointment type OPD only 
      //set patientID and PatientVisitID because we are passing this to <opd-sticker></opd-sticker> in recipt print view
      this.selectedVisit.PatientId = this.billingReceipt.Patient.PatientId;
      this.selectedVisit.PatientVisitId = this.billingReceipt.VisitId;
      this.selectedVisit.QueueNo = this.billingReceipt.QueueNo;
    }
    if (this.billingReceipt.PackageId != null) {
      if (this.billingReceipt.PackageId > 0) {
        this.billingTransactionId = this.billingReceipt.BillingTransactionId;
        this.showPackageBillingSticker = true;
      }
    }

    //this.CheckERItem();

    //if (this.showOpdSticker) {
    //  this.ShowOPDStickerForOPDAppointment();
    //} else {
    //  this.CheckERItem();
    //}

    //provisionalreceipt shows/hide either normal receipt or provisional one.
    if (this.billingReceipt.ReceiptType == "provisional") {
      this.showNormalReceipt = false;
      this.showInpatientReceipt = false;
      this.showProvisionalReceipt = true;
    }
    else {
      this.showInpatientReceipt = false;
      this.showProvisionalReceipt = false;
      this.showNormalReceipt = true;
    }

    if (!this.billingReceipt.IsValid) {
      this.router.navigate(['/Billing/SearchPatient']);
    }
    else {

    }
    this.latestReceiptNo();
  }

  ngOnInit(): void {

    this._locationSubscription = this.location.subscribe(currentLocation => {
      if (currentLocation.url === "/Billing/BillingTransactionItem") {
        this.router.navigate(['/Billing/SearchPatient']);
      }
    });
  }


  // ngOnDestroy() {
  //     this._locationSubscription.unsubscribe();
  // }

  PreviousReceipt() {
    if (this.currentReceiptNo > 1) {
      this.disableNextBtn = false;
      this.currentReceiptNo -= 1;
      this.GetTransactionDetails(this.currentReceiptNo);
    }
    else {
      this.disablePreviousBtn = true;
    }
  }

  NextReceipt() {
    //need to get last receiptno to disable next button when reached to the end.
    if (this.currentReceiptNo < this.latestBillingReceiptNo) {
      this.currentReceiptNo += 1;
      this.showReceiptNavigation = false;
      this.GetTransactionDetails(this.currentReceiptNo);
      this.showReceiptNavigation = true;
      this.disablePreviousBtn = false;
      if (this.currentReceiptNo == this.latestBillingReceiptNo) {
        this.disableNextBtn = true;
      }
    }
    else {
      this.disableNextBtn = true;
    }
  }

  GetTransactionDetails(receiptNo: number) {
    let getVisitInfo = false;
    let fiscalYrId: number = 1;//remove this hardCode ASAP -- sud:5May'18
    let isInsuranceBilling = true;
    this.billingBlService.GetInvoiceByReceiptNo(receiptNo, fiscalYrId, getVisitInfo, isInsuranceBilling)
      .subscribe(res => {
        if (res.Status == "OK") {
          let dupReceipt = BillingReceiptModel.GetReceiptForDuplicate(res.Results);
          this.billingReceipt = dupReceipt;
          if (this.billingReceipt) {
            this.billingReceipt.BillingDate = moment(this.billingReceipt.BillingDate).format("YYYY-MM-DD hh:mm A");
          }
        }
      });

  }



  AfterStickerPrintAction($event) {
    /////passing empty event to reusable component 
    if ($event && ($event.routeTo == "new-visit")) {
      this.router.navigate(['/Appointment/PatientSearch']);
    }
  }

  latestReceiptNo() {
    this.billingBlService.GetlatestBillingReceiptNo().subscribe(res => {
      if (res.Status == "OK") {
        this.latestBillingReceiptNo = res.Results;
      }
    });
  }
  //Ashim: 23Sep2018 : check if itemlist contains emergency registration item and display sticker.
  CheckERItem() {
    let erItem = this.billingReceipt.BillingItems.find(a => a.ItemName == "EMERGENCY REGISTRATION");
    if (erItem) {
      this.showERSticker = true;
      this.patientVisitId = erItem.PatientVisitId;
    }

    this.showERSticker = true;
    this.patientVisitId = this.billingReceipt.VisitId;
  }

  GetBillPrintParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Bill Print Parameter').ParameterValue;
    if (paramValue) {
      this.numberofbill = JSON.parse(paramValue);
      this.noOfBillGenerate = parseInt(this.numberofbill.billing);
    }
    else {
      this.msgbox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }
  }

}
