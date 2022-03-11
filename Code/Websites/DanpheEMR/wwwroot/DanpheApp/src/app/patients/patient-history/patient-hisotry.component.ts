import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PatientsBLService } from '../shared/patients.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from "../../core/shared/core.service";
import { Lightbox } from 'angular2-lightbox';
import { PatientFilesModel } from '../shared/patient-files.model'
@Component({
    selector: "patient-history",
    templateUrl: "./patient-history.html"
})
export class PatientHistoryComponent {
    public patientId: number = 0;
    public labHistory: any;
    public imagingHistory: any;
    public billingHistory: any;
    public visitHistory: any;
    public drugDetails: any;
    public uploadedDocuments: any;
    public admissionHistory: any;
    public showVisitDetails: boolean = true;
    public showAdmissionDetails: boolean = false;
    public showDrugDetails: boolean = false;
    public showLabDetails: boolean = false;
    public showRadiologyDetails: boolean = false;
    public showBillDetails: boolean = false;
    public showDocumentsDetails: boolean = false;
    public showPatientHistory: boolean = false;
    public showuploadedDocuments: boolean = false;
    public showImage: boolean = false;
    public isShowUploadMode: boolean = false;
    public isShowListMode: boolean = false;
    public showUploadFiles: boolean = false;
    public album = [];
    @Input("selectedPatient")
    public selectedPatient: any;

    /////For Binding the Image to Popup box 
    public PopupImageData: PatientFilesModel = new PatientFilesModel();

    public totalBillAmount: number = 0;
    public paidAmount: number = 0;
    public cancelledBillAmount: number = 0;
    public unpaidBillAmount: number = 0;
    public returnedAmount: number = 0;
    public depositAmount: number = 0;
    public discountAmount: number = 0;
    public balance: number = 0;
    public checkouttimeparameter: string;
    public ShowBillHistory : boolean =false;
  





    constructor(public patientBLService: PatientsBLService, public lightbox: Lightbox, public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public coreService: CoreService) {
        this.checkouttimeparameter = this.coreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime").ParameterValue;   
        this.ShowBillHistory = this.GetParameterForShowBillDetail();
}
public GetParameterForShowBillDetail() {
    var show = this.coreService.Parameters.find(
      (val) =>
        val.ParameterName == "ShowBillDetailsOnHistoryPage" &&
        val.ParameterGroupName.toLowerCase() == "patient"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

    @Input("showPatientHistory")
    public set value(val: boolean) {
        this.showPatientHistory = val;
        if (this.showPatientHistory) {
            this.getPatientVisitList();
            this.getDrugHistory();
            this.getAdmissionHistory();
            this.getLabResult();
            this.getImagingResult();
            if(this.ShowBillHistory==true){
                this.getBillingHistory();
            }
             
            this.changeDetector.detectChanges();
            this.isShowUploadMode = false;
            this.isShowListMode = true;
            this.patientId = this.selectedPatient.PatientId;            
        }
    }   

    public getLabResult() {
        this.patientBLService.GetPatientLabReport(this.selectedPatient.PatientId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results)
                        this.labHistory = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get Lab Results"]);
            });
    }
    public getAdmissionHistory() {
        this.patientBLService.GetAdmissionHistory(this.selectedPatient.PatientId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results)
                        this.admissionHistory = res.Results;
                    var adt = this.admissionHistory;
                    this.calculateDays();
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get Lab Results"]);
            });
    }
    public calculateDays() {
        this.admissionHistory.forEach(adt => {
            adt.BedInformations.forEach(bed => {
                //calculate days
                var duration = CommonFunctions.calculateADTBedDuration(bed.StartDate, bed.EndDate, this.checkouttimeparameter);
                if (duration.days > 0 && duration.hours)
                    bed.Days = duration.days + ' + ' + duration.hours + ' hour';
                else if (duration.days && !duration.hours)
                    bed.Days = duration.days;
                else if (!duration.days && duration.hours)
                    bed.Days = duration.hours + ' hour';
                bed.Action = bed.Action.charAt(0).toUpperCase() + bed.Action.slice(1);
            });
        });
    }
    public getPatientVisitList() {
        this.patientBLService.GetPatientVisitList(this.selectedPatient.PatientId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.visitHistory = res.Results;
                        //this is for formatting the time to show properly in html(to show properly to the client)....
                        this.visitHistory.forEach(visit => {
                            visit.VisitTime = moment(visit.VisitTime, "hhmm").format('hh:mm A');
                        });
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get Visit History"]);
            });
    }

    public getImagingResult() {
        this.patientBLService.GetPatientImagingReports(this.selectedPatient.PatientId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length)
                        this.imagingHistory = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get Imaging Results"]);

            });
    }
    public getBillingHistory() {
        this.patientBLService.GetPatientBillHistory(this.selectedPatient.PatientCode)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.billingHistory = res.Results;
                        this.CalculateTotal();
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get BillingHistory"]);
            });
    }
    public getDrugHistory() {
        this.patientBLService.GetPatientDrugList(this.selectedPatient.PatientId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.drugDetails = res.Results;
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get BillingHistory"]);
            });
    }     
    Close() {
        this.showImage = false;
        this.showPatientHistory = true;
    }
    public updateView(category: number): void {
        this.showVisitDetails = (category == 0);
        this.showAdmissionDetails = (category == 1);
        this.showDrugDetails = (category == 2);
        this.showLabDetails = (category == 3);
        this.showRadiologyDetails = (category == 4);
        this.showBillDetails = (category == 5);
        this.showDocumentsDetails = (category == 6);
    }
    public CalculateTotal() {
        if (this.billingHistory.paidBill.length) {
            this.billingHistory.paidBill.forEach(bill => {
                this.paidAmount = this.paidAmount + bill.SubTotal;
                this.discountAmount = this.discountAmount + bill.Discount;
            });
        }
        if (this.billingHistory.unpaidBill.length) {
            this.billingHistory.unpaidBill.forEach(bill => {
                this.unpaidBillAmount = this.unpaidBillAmount + bill.SubTotal;
                this.discountAmount = this.discountAmount + bill.Discount;
            });
        }
        if (this.billingHistory.returnBill) {
            this.billingHistory.returnBill.forEach(bill => {
                this.returnedAmount = this.returnedAmount + bill.ReturnedAmount;
                this.discountAmount = this.discountAmount + bill.Discount;
            });

        }
        if (this.billingHistory.deposits) {
            this.billingHistory.deposits.forEach(bill => {
                if (bill.DepositType == "Deposit")
                    this.depositAmount = this.depositAmount + bill.Amount;
                else
                    this.depositAmount = this.depositAmount - bill.Amount;
            });

        }
        if (this.billingHistory.cancelBill) {
            this.billingHistory.cancelBill.forEach(bill => {
                this.cancelledBillAmount = this.cancelledBillAmount + bill.CancelledAmount;
                this.discountAmount = this.discountAmount + bill.Discount;
            });

        }
        this.totalBillAmount = this.paidAmount + this.unpaidBillAmount + this.returnedAmount + this.cancelledBillAmount;
        this.balance = this.depositAmount - this.unpaidBillAmount;
        this.ParseAmounts();
    }

    public ParseAmounts() {
        this.paidAmount = CommonFunctions.parseAmount(this.paidAmount);
        this.returnedAmount = CommonFunctions.parseAmount(this.returnedAmount);
        this.depositAmount = CommonFunctions.parseAmount(this.depositAmount);
        this.cancelledBillAmount = CommonFunctions.parseAmount(this.cancelledBillAmount);
        this.totalBillAmount = CommonFunctions.parseAmount(this.totalBillAmount);
        this.balance = CommonFunctions.parseAmount(this.balance);
        this.discountAmount = CommonFunctions.parseAmount(this.discountAmount);
    }
}