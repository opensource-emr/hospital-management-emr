import { ChangeDetectorRef, Component, Input, Output, EventEmitter  } from "@angular/core";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { InsuranceBlService } from "../../shared/insurance.bl.service";
import { CommonFunctions } from "../../../shared/common.functions";
import * as moment from 'moment/moment';
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  selector: "ins-pat-claim-details-view",
  templateUrl: "./ins-pat-claim-details-view.html"
})

export class InsPatientClaimDetailsView {
    
  @Input("claim-detail")
  public claim: any;

  @Input("selected-patient")
  public selPatient: any;

  @Output("popup-close-action")
  emitCloseAction: EventEmitter<Object> = new EventEmitter<Object>();

  public dlService: DLService = null;
  public testandServicesList: Array<any> = new Array<any>();
  public pharmacyList: Array<any> = new Array<any>();
  public selectedClaimCode: any = null;
  public admissionDate: string = "";
  public dischargeDate: string = "";
  public loading: boolean = false;
  public showPrint: boolean = false;
  public printDetails: any;
  public printedBy: string = null;
  public printedOn: string = null;
  public isPhrmListAvailable: boolean = false;
  public isBillListAvailable: boolean = false;
  public phrmTotal: Array<any> = new Array<any>();
  public billTotal: Array<any> = new Array<any>();
  public grandTotal: Number = 0;
  constructor(_dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public changeDetector: ChangeDetectorRef,
    public insuranceBlService: InsuranceBlService,
    public securityService: SecurityService) {
    this.dlService = _dlService;
  }
  ngOnInit(){
   this.printedBy = this.securityService.GetLoggedInUser().UserName;
   this.printedOn = moment().format('YYYY-MM-DD HH:mm');
   this.loadSingleClaimDetails(this.claim);
  }
  public loadSingleClaimDetails(claimObj: any) {
    this.loading = true;
    this.selectedClaimCode = claimObj.ClaimCode;
    this.dlService.Read("/api/Insurance?reqType=insurance-single-claim-code-details&patientId=" + claimObj.PatientId + "&claimCode=" + claimObj.ClaimCode)
      .map(res => res)
      .finally(() => { this.loading = false; })
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.setData(res.Results);
        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });

  }
  private setData(data) {
    this.admissionDate = null;
    this.dischargeDate = null;

    if (data.AdmissionInfo) {
      if (data.AdmissionInfo.length > 0) {
        this.admissionDate = data.AdmissionInfo[0].AdmissionDate;
        this.dischargeDate = data.AdmissionInfo[0].DischargeDate;
        this.changeDetector.detectChanges();
      }
    }
    if (data.BillingInfo) {
      if (data.BillingInfo.length > 0) {
        this.testandServicesList = data.BillingInfo;
        this.billTotal = CommonFunctions.getGrandTotalData(data.BillingInfo);
        this.grandTotal = this.billTotal[0].Net_TotalAmount;
        this.isBillListAvailable = true;
      }
    }

    if (data.PharmacyInfo) {
      if (data.PharmacyInfo.length > 0) {
        this.pharmacyList = data.PharmacyInfo;
        this.phrmTotal = CommonFunctions.getGrandTotalData(data.PharmacyInfo);
        var total = this.grandTotal;
        this.grandTotal = 0;
        this.grandTotal = total + this.phrmTotal[0].NetAmount;
        this.isPhrmListAvailable = true;
      }
    }
    this.setFocusOnButton('btnPrintInvoice');
  }
  public print() {
    this.showPrint = false;
    this.printDetails = null;
    this.changeDetector.detectChanges();
    this.showPrint = true;
    this.printDetails = document.getElementById("dvClaimDetailPrintPage");
  }
  public setFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }
  public closeClaimPopup() {
    this.testandServicesList = new Array<any>();
    this.pharmacyList = new Array<any>();
    this.billTotal = new Array<any>();
    this.phrmTotal = new Array<any>();
    this.selectedClaimCode = null;
    this.isPhrmListAvailable = false;
    this.isBillListAvailable = true;
    this.emitCloseAction.emit({ showPrintPopup: true});
  }
}
