import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { PatientService } from "../../../../../patients/shared/patient.service";
import { PHRMSettlementModel } from "../../../../../pharmacy/shared/pharmacy-settlementModel";
import { PharmacyBLService } from "../../../../../pharmacy/shared/pharmacy.bl.service";
import { PharmacyService } from "../../../../../pharmacy/shared/pharmacy.service";
import { PHRMInvoiceModel } from "../../../../../pharmacy/shared/phrm-invoice.model";
import { PHRMStoreModel } from "../../../../../pharmacy/shared/phrm-store.model";
import { SecurityService } from "../../../../../security/shared/security.service";
import { CallbackService } from "../../../../../shared/callback.service";
import { DanpheHTTPResponse } from "../../../../../shared/common-models";
import { CommonFunctions } from "../../../../../shared/common.functions";
import { GridEmitModel } from "../../../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../../../../shared/routefrom.service";
import DispensaryGridColumns from "../../../../shared/dispensary-grid.column";
import { DispensaryService } from "../../../../shared/dispensary.service";

@Component({
    selector: 'duplicate-print-settlement',
    templateUrl: './duplicate-print-settlement.html',
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMDuplicatePrintSettlementListComponent {
    public allPHRMPendingSettlements: Array<PHRMInvoiceModel> = [];//this contains settleme
    public patCrInvoicDetails: Array<PHRMInvoiceModel> = [];

    public PHRMSettlementGridCols: Array<any> = null;

    public selectAllInvoices: boolean = false;
    public showActionPanel: boolean = false;
    public showDetailView: boolean = false;
    public selInvoicesTotAmount: number = 0;

    public model: PHRMSettlementModel = new PHRMSettlementModel();
    public setlmntToDisplay = new PHRMSettlementModel();

    public showReceipt: boolean = false;//to show hide settlement grid+action panel   OR  SettlementReceipt
    public showGrid: boolean = true;
    public selectAll: boolean = true;

    public discountGreaterThanPayable: boolean = false;
    public PayableAmount: number = 0;
    public settelmentProceedEnable: boolean = true;
    public DepositInfo: any = { "Deposit_In": 0, "Deposit_Out": 0, "Deposit_Balance": 0 };
    public ProvisionalInfo: any = { "ProvisionalTotal": 0 };
    public PatientInfo: any = null;
    public showInvoiceDetail: boolean = false;
    public patientId: number = null;

    public SettlementId: number = 0;

    public patBillHistory = {
        IsLoaded: false,
        PatientId: null,
        CreditAmount: null,
        ProvisionalAmt: null,
        TotalDue: null,
        DepositBalance: null,
        BalanceAmount: null,
        SubtotalAmount: null,
        DiscountAmount: null
    };

    public loading: boolean = false;
    public currentCounter: number = 0;
    public billStatus: string = "All";

    public currentActiveDispensary: PHRMStoreModel;
    allPHRMPSettlements: Array<PHRMInvoiceModel> = [];
    FromDate: string = null;
    ToDate: string = null;
    public dateRange: string = "last1Week";

    constructor(public pharmacyService: PharmacyService, private _dispensaryService: DispensaryService,
        public router: Router,
        public routeFromService: RouteFromService,
        public pharmacyBLService: PharmacyBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public callbackservice: CallbackService,
        public patientService: PatientService,
        public msgBoxServ: MessageboxService) {

        this.currentCounter = this.securityService.getPHRMLoggedInCounter().CounterId;
        this.currentActiveDispensary = this._dispensaryService.activeDispensary;
        if (this.currentCounter < 1) {
            this.callbackservice.CallbackRoute = '/Dispensary/Sale/New'
            this.router.navigate(['/Dispensary/ActivateCounter']);
        }
        else {
            this.PHRMSettlementGridCols = DispensaryGridColumns.PHRMAllSettlementsColSettings;
            // this.GetAllSettlement();
            this.showGrid = true;
        }

    }
    ngOnInit(): void {
    }


    GetAllSettlement() {
        this.allPHRMPendingSettlements = [];
        this.pharmacyBLService.GetPHRMSettlements(this.currentActiveDispensary.StoreId,this.FromDate,this.ToDate)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.allPHRMPSettlements = res.Results;

                }
            });
    }


    PHRMSettlementGridActions($event: GridEmitModel) {
        switch ($event.Action) {

            case "print":
                {
                    var data = $event.Data;
                    if (data.SettlementId > 0) {
                        // this.GetPaidSettlementsDetails(data);
                        this.showReceipt = true;
                        this.showGrid = true;
                        this.SettlementId = data.SettlementId;
                    }

                }
                break;
            default:
                break;
        }
    }

    GetPatientCreditInvoices(row): void {
        this.loading = true;
        this.showGrid = false;
        this.showActionPanel = true;
        this.showReceipt = false;
        //patient mapping later used in receipt print
        let patient = this.patientService.CreateNewGlobal();
        patient.ShortName = row.PatientName;
        patient.PatientCode = row.PatientCode;
        patient.DateOfBirth = row.DateOfBirth;
        patient.Gender = row.Gender;
        patient.PatientId = row.PatientId;
        patient.PhoneNumber = row.PhoneNumber;

        this.pharmacyBLService.GetCreditInvoicesByPatient(patient.PatientId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.patCrInvoicDetails = res.Results.CreditInvoiceInfo;
                    this.PatientInfo = res.Results.PatientInfo;
                    this.DepositInfo = res.Results.DepositInfo;
                    this.ProvisionalInfo = res.Results.ProvisionalInfo;
                    this.patientService.globalPatient = res.Results.PatientInfo;
                    this.patientId = res.Results.PatientInfo.PatientId;
                    var patient = this.patientService.globalPatient;
                    patient.ShortName = `${patient.FirstName} ${patient.MiddleName ? patient.MiddleName : ''} ${patient.LastName}`;
                    this.patCrInvoicDetails.forEach(function (inv) {
                        inv.selectedPatient = res.Results.Patient;
                        inv.CreateOn = moment(inv.CreateOn).format("YYYY-MM-DD HH:mm");
                        //adding new field to manage checked/unchecked invoice.
                        // inv.IsSelected = false;
                    });

                    if (this.ProvisionalInfo && this.ProvisionalInfo.ProvisionalTotal > 0) {
                        this.settelmentProceedEnable = false;
                        this.msgBoxServ.showMessage('warning', ["There are few items in provisaional list,please generate their invoices and proceed for settlement"]);
                    } else {
                        this.settelmentProceedEnable = true;
                    }

                    // this.patCrInvoicDetails.forEach(element => {
                    //   element.InvoiceItems.forEach(a => {
                    //     if (a.DiscountPercentage != 0) {
                    //       // a.DiscountAmount = CommonFunctions.parseAmount(a.TotalAmount / a.DiscountPercentage)     already we have added item level discount if there is discount in item level then it will show otherwise there will be  0
                    //       a.Tax = 0
                    //     } else {
                    //       //a.DiscountAmount = 0;
                    //       a.Tax = 0
                    //     }
                    //   })
                    // });


                    if (this.selectAll) {
                        this.patCrInvoicDetails.forEach(a => {
                            a.isSelected = true;
                        })
                    }
                    this.SelectAll();


                    //by default selecting all items.
                    this.selectAllInvoices = true;
                    this.SelectAllChkOnChange();
                    //this.LoadPatientPastBillSummary(patient.PatientId);
                    this.loading = false;
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Couldn't fetch patient's credit details. Please try again later"], res.ErrorMessage);
                }
            });
    }


    //     //sud: 13May'18--to display patient's bill history
    LoadPatientPastBillSummary(patientId: number) {
        this.pharmacyBLService.GetPatientPastBillSummary(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.patBillHistory = res.Results;
                    this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
                    //provisional amount should exclude itmes those are listed for payment in current window.
                    this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
                    this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount + this.patBillHistory.ProvisionalAmt);
                    this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
                    //if balance is negative it'll be payableamt otherwise it'll be refundable amount.
                    this.patBillHistory.BalanceAmount < 0 ? (this.model.PayableAmount = (-this.patBillHistory.BalanceAmount)) : (this.model.RefundableAmount = this.patBillHistory.BalanceAmount)
                    this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
                    this.patBillHistory.IsLoaded = true;
                    this.patBillHistory.SubtotalAmount = CommonFunctions.parseAmount(this.patBillHistory.SubtotalAmount);           //add subtotal 
                    this.patBillHistory.DiscountAmount = CommonFunctions.parseAmount(this.patBillHistory.DiscountAmount);           // add total discount amount  

                    //this.model.DueAmount = this.patBillHistory.BalanceAmount;
                    this.model.PaidAmount = this.model.PayableAmount;
                    this.model.ReturnedAmount = this.model.RefundableAmount;

                    if (this.patBillHistory.ProvisionalAmt > 0) {
                        this.msgBoxServ.showMessage("warning", ["There are few items in provisional list, please generate their invoices and proceed for settlement"], null, true);
                    }

                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }


    BackToGrid() {
        this.showGrid = true;
        this.showActionPanel = false;
        this.showReceipt = false;
        this.showDetailView = false;
        this.setlmntToDisplay = new PHRMSettlementModel()
        this.selectAll = true;
        //reset current patient value on back button.. 
        this.patientService.CreateNewGlobal();
        this.patCrInvoicDetails = [];
        this.model = new PHRMSettlementModel();
        this.GetAllSettlement();
    }

    gridExportOptions = {
        fileName: 'SettlementLists_' + moment().format('YYYY-MM-DD') + '.xls',
    };


    SelectAllChkOnChange() {
        if (this.patCrInvoicDetails && this.patCrInvoicDetails.length) {
            if (this.selectAllInvoices) {
                this.patCrInvoicDetails.forEach(itm => {
                    itm.IsSelected = true;
                });
                this.showActionPanel = true;
            }
            else {
                this.patCrInvoicDetails.forEach(itm => {
                    itm.IsSelected = false;
                });
                this.showActionPanel = false;

            }

            this.CalculateTotalAmt();
        }
    }

    CalculateTotalAmt() {
        this.selInvoicesTotAmount = 0;
        this.patCrInvoicDetails.forEach(inv => {
            if (inv.IsSelected) {
                this.selInvoicesTotAmount += inv.TotalAmount;
            }
        });
        this.selInvoicesTotAmount = CommonFunctions.parseAmount(this.selInvoicesTotAmount);
    }

    PayProvisionalItems() {
        let patId = this.patientService.globalPatient.PatientId;

        this.pharmacyBLService.GetProvisionalItemsByPatientIdForSettle(patId)
            .subscribe(res => {
                this.routeFromService.RouteFrom = '/Dispensary/Sale/Settlement';
                this.router.navigate(['/Dispensary/Sale/CreditBills']);

            });
    }
    SettlePatientBills() {
        this.loading = true;
        if (this.CheckIsDiscountApplied()) {
            this.model.PHRMInvoiceTransactions = this.patCrInvoicDetails;

            let setlmntToPost = this.GetSettlementInvoiceFormatted();

            this.pharmacyBLService.PostSettlementInvoice(setlmntToPost)
                .subscribe((res: DanpheHTTPResponse) => {
                    console.log("Response from server:");
                    console.log(res);

                    this.setlmntToDisplay = res.Results;
                    this.SettlementId = this.setlmntToDisplay.SettlementId;
                    // this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
                    this.setlmntToDisplay.Patient = this.patientService.globalPatient;
                    this.showReceipt = true;
                    this.showActionPanel = false;
                    this.loading = false;

                },
                    err => {
                        this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
                    }

                );
        }
        else {
            this.loading = false;
        }
    }

    CheckRemarks() {
        if (this.model.DiscountPercentage != null) {
            this.model.IsDiscounted = true;
        }
        else {
            this.model.IsDiscounted = false;
        }
    }
    CheckIsDiscountApplied(): boolean {
        if (this.model.DiscountPercentage != null) {
            this.model.IsDiscounted = true;
        }
        else {
            this.model.IsDiscounted = false;
        }
        if (this.model.IsDiscounted && !this.model.Remarks) {
            this.msgBoxServ.showMessage('failed', ["Remarks is mandatory in case of discount."]);
            return false;
        }
        else
            return true;
    }

    GetSettlementInvoiceFormatted(): PHRMSettlementModel {
        let retSettlModel = new PHRMSettlementModel();
        retSettlModel.PHRMInvoiceTransactions = this.patCrInvoicDetails.filter(a => a.isSelected == true);
        retSettlModel.PatientId = this.patientService.globalPatient.PatientId;
        retSettlModel.PayableAmount = this.model.PayableAmount;
        retSettlModel.RefundableAmount = this.model.RefundableAmount;
        retSettlModel.PaidAmount = this.model.PaidAmount;
        retSettlModel.ReturnedAmount = this.model.ReturnedAmount;
        retSettlModel.DepositDeducted = this.model.DepositDeducted;
        retSettlModel.DueAmount = this.model.DueAmount > 0 ? this.model.DueAmount : (-this.model.DueAmount);
        retSettlModel.PaymentMode = this.model.PaymentMode;
        retSettlModel.PaymentDetails = this.model.PaymentDetails;
        retSettlModel.CounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
        retSettlModel.DiscountAmount = this.model.DiscountAmount;
        retSettlModel.Remarks = this.model.Remarks;
        retSettlModel.CollectionFromReceivable = this.model.CollectionFromReceivable;
        retSettlModel.StoreId = this._dispensaryService.activeDispensary.StoreId;

        this.patCrInvoicDetails.forEach(a => {
            if (a.isSelected == true && a.PHRMReturnIdsCSV) {
                if (a.PHRMReturnIdsCSV.includes(',')) {
                    let phrmReturnIdsCSV: any[] = a.PHRMReturnIdsCSV.toString().split(",");
                    phrmReturnIdsCSV.forEach(b => {
                        retSettlModel.PHRMReturnIdsCSV.push(b);
                    });
                } else {
                    retSettlModel.PHRMReturnIdsCSV.push(a.PHRMReturnIdsCSV);
                }
            }
        });
        return retSettlModel;
    }
    PaidAmountOnChange() {
        if (this.model.PayableAmount < this.model.PaidAmount) {
            this.model.ReturnedAmount = CommonFunctions.parseAmount(this.model.PaidAmount - this.model.PayableAmount);
            this.model.IsDiscounted = false;
            this.model.DiscountAmount = 0;
            this.model.DiscountPercentage = 0;
        }

        else if (this.model.PayableAmount > this.model.PaidAmount) {
            this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
            this.model.IsDiscounted = true;
            this.model.ReturnedAmount = 0;
            this.model.DiscountPercentage = CommonFunctions.parseAmount((this.model.DiscountAmount / this.model.PayableAmount) * 100);

        }
    }
    DiscountAmountOnChange() {
        let disc = this.model.DiscountPercentage / 100;
        this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount * disc);
        this.model.PaidAmount = CommonFunctions.parseFinalAmount(this.model.PayableAmount - this.model.DiscountAmount);
        this.model.IsDiscounted = true;
        this.model.ReturnedAmount = 0;

    }
    DiscountChkOnChange() {
        if (this.model.IsDiscounted) {
            this.model.DiscountAmount = this.model.DueAmount;
            this.model.DueAmount = 0;
        }
        else {
            this.model.DiscountAmount = 0;
            this.model.DueAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
        }
    }

    //     //this is called after event emmitted from settlement receipt
    OnReceiptClosed($event) {
        //write logic based on $event later on.. for now only close this..
        this.showReceipt = false;
        this.setlmntToDisplay = new PHRMSettlementModel();
        this.GetAllSettlement();
        this.BackToGrid();
        this.changeDetector.detectChanges();

    }
    showDetailedView(event: any) {
        console.log(event);
    }

    // GetPaidSettlementsDetails(settlementData) {
    //     this.SettlementId = settlementData.SettlementId;
    //     this.showReceipt = true;
    //     this.showGrid = false;
    //     this.pharmacyBLService.GetPHRMSettlementDuplicateDetails(settlementData.SettlementId)
    //       .subscribe((res: DanpheHTTPResponse) => {
    //         this.setlmntToDisplay = res.Results;
    //         // this.SettlementId = this.setlmntToDisplay.SettlementInfo.SettlementId;
    //         this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
    //         this.showReceipt = true;
    //         this.showGrid = false;
    //       },
    //         err => {
    //           this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
    //         }
    //       );
    // }

    // GetUnPaidSettlementsDetails(row) {
    //     this.pharmacyBLService.GetCreditInvoicesByPatient(row.PatientId)
    //         .subscribe((res: DanpheHTTPResponse) => {
    //             if (res.Status == "OK") {
    //                 this.patCrInvoicDetails = res.Results.CreditInvoiceInfo;
    //                 this.patientService.globalPatient = res.Results.PatientInfo;
    //                 this.setlmntToDisplay.PHRMInvoiceTransactions = this.patCrInvoicDetails;
    //                 this.setlmntToDisplay.Patient = res.Results.PatientInfo;
    //                 this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
    //                 this.showReceipt = true;
    //                 this.showGrid = false;
    //             }
    //             else {
    //                 this.msgBoxServ.showMessage("error", ["Couldn't fetch patient's details. Please try again later"], res.ErrorMessage);
    //             }
    //         });
    // }

    public SelectAll() {
        this.patCrInvoicDetails.forEach(a => {
            a.isSelected = true;
        })
        if (this.selectAll) {
            this.model.CollectionFromReceivable = this.patCrInvoicDetails.reduce(function (acc, itm) { return acc + itm.NetAmount; }, 0);
            if (this.ProvisionalInfo && this.ProvisionalInfo.ProvisionalTotal > 0) {
                this.settelmentProceedEnable = false;
            } else {
                this.settelmentProceedEnable = true;
            }
            this.CalculatePaidAmount();
        } else {
            this.patCrInvoicDetails.forEach(a => {
                a.isSelected = false;
            })
            this.model.CollectionFromReceivable = 0;
            this.CalculatePaidAmount();
        }
    }


    public CalculatePaidAmount() {

        //this.model.PaidAmount = this.model.CollectionFromReceivable - this.model.DiscountAmount - this.DepositInfo.Deposit_Balance;
        if (this.model.DiscountAmount > this.model.CollectionFromReceivable) {
            this.discountGreaterThanPayable = true;
            this.settelmentProceedEnable = false;
        } else {
            this.discountGreaterThanPayable = false;
            if (this.ProvisionalInfo.ProvisionalTotal <= 0) {
                if (this.patCrInvoicDetails.some(a => a.isSelected == true) || this.selectAll) {
                    this.settelmentProceedEnable = true;
                } else {
                    this.settelmentProceedEnable = false;
                }
            } else {
                this.settelmentProceedEnable = false;
            }
        }
        this.model.PayableAmount = Number((this.model.CollectionFromReceivable - this.model.DiscountAmount).toFixed(4));
        if (this.model.PayableAmount >= this.DepositInfo.Deposit_Balance) {
            this.model.PaidAmount = Number((this.model.PayableAmount - this.DepositInfo.Deposit_Balance).toFixed(4));
            this.model.DepositDeducted = this.DepositInfo.Deposit_Balance;
            this.model.RefundableAmount = 0;
        } else {

            this.model.DepositDeducted = Number((this.model.PayableAmount).toFixed(4));
            this.model.RefundableAmount = Number((this.DepositInfo.Deposit_Balance - this.model.PayableAmount).toFixed(4));
            this.model.PaidAmount = 0;
        }


    }
    public OnCheckboxChanged(indx) {
        let currentItem = this.patCrInvoicDetails[indx];
        if (currentItem) {
            this.CalculateTotalCredit(indx);
        }
        let selectedInvoices = this.patCrInvoicDetails.filter(a => a.isSelected == true);
        if (selectedInvoices.length > 0 && (this.ProvisionalInfo && this.ProvisionalInfo.ProvisionalTotal <= 0)) {
            this.settelmentProceedEnable = true;
        } else {
            this.settelmentProceedEnable = false;
        }

        if (this.patCrInvoicDetails.every(b => b.isSelected == true)) {
            this.selectAll = true;
        } else {
            this.selectAll = false;
        }

    }

    public CalculateTotalCredit(indx) {
        if (this.patCrInvoicDetails[indx].isSelected) {
            this.model.CollectionFromReceivable = Number((this.model.CollectionFromReceivable + this.patCrInvoicDetails[indx].NetAmount).toFixed(4));
            this.CalculatePaidAmount();
        }
        else {
            this.model.CollectionFromReceivable = Number((this.model.CollectionFromReceivable - this.patCrInvoicDetails[indx].NetAmount).toFixed(4));
            this.CalculatePaidAmount();
        }
    }

    public singleInvoiceId: number = 0;
    public ShowInvoiceDetail(indx) {
        this.showInvoiceDetail = true;
        let singleInvoiceId = this.patCrInvoicDetails.filter((_, index) => index == indx);
        this.singleInvoiceId = singleInvoiceId[0].InvoiceId;
    }

    public InvoiceDetailCallBack(event: any) {
        if (event) {
            if (event.close) {
                this.showInvoiceDetail = false;
            }
        }
    }
    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.showReceipt = false;
        }
    }

    OnFromToDateChange($event) {
        this.FromDate = $event ? $event.fromDate : this.FromDate;
        this.ToDate = $event ? $event.toDate : this.ToDate;
    }

    onGridDateChange($event) {

        this.FromDate = $event.fromDate;
        this.ToDate = $event.toDate;
        if (this.FromDate != null && this.ToDate != null) {
          if (moment(this.FromDate).isBefore(this.ToDate) || moment(this.FromDate).isSame(this.ToDate)) {
            this.GetAllSettlement();
          } else {
            this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
          }
        }
      }



}
