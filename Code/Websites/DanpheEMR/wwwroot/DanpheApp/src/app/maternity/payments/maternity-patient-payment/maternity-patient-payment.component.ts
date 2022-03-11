import {Component} from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { MaternityBLService } from '../../shared/maternity.bl.service';
import MaternityGridColumnSettings from '../../shared/maternity.grid.settings';
import { MaternitypatientPaymentModel } from './maternity-patient-payment.model';
import { Patient } from '../../../patients/shared/patient.model';
import { CallbackService } from '../../../shared/callback.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DanpheCache } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MaternityService } from '../../shared/maternity.service';

@Component({
    templateUrl: './maternity-patient-payment.html',
})
export class MaternityPatientPaymentComponent{
    public maternityPatientGridColumns: any;
    public maternityPatientPaymentData:[] = [] ;
    public patient:Patient = new Patient();
    public paymentModelObj : MaternitypatientPaymentModel = new MaternitypatientPaymentModel();
    public isPaymentReturn : boolean = false;
    public paymentAmounts:any;
    public loading:any;
    public showPaymentReceipt:any;
    public paymentPatientId:number = 0;
    currentCounter: number;
    totalPaid:number= 0;
    totalReturn:number = 0;
    constructor(public maternityBlService:MaternityBLService,
             public msgBoxServ:MessageboxService,
             public coreService: CoreService,
             public securityService: SecurityService,
             public callbackService:CallbackService,
             public router:Router,
             public matService:MaternityService){
             this.maternityPatientGridColumns = MaternityGridColumnSettings.MaternityPaymentHistory;
             this.GetBillingCounterForMaternity();
             this.GetPaymentAmountFromCoreParameter();
    }

    ngOnInit(){
        this.patient = this.matService.GetPatientForPayment()
        this.paymentModelObj.PatientId = this.patient.PatientId;
        this.GetPatientPaymentDetails(this.patient.PatientId);
        this.paymentModelObj.InOrOutAmount = null;
    }

    GetBillingCounterForMaternity() {
        let allBilCntrs: Array<any>;
        allBilCntrs = DanpheCache.GetData(MasterType.BillingCounter, null);
        let counter = allBilCntrs.find(cnt => cnt.CounterType == "MATERNITY");
        if (counter) {
            this.paymentModelObj.CounterId = counter.CounterId;
        }
    }

 GetPatientPaymentDetails(patientId:number){
     this.maternityBlService.GetPatientPaymentDetailById(patientId)
     .subscribe((res) => {
        if (res.Status == 'OK') {
            this.totalPaid = 0;
            this.totalReturn = 0;
            this.maternityPatientPaymentData = res.Results;
            this.maternityPatientPaymentData.forEach((ele:any) => {
                if(ele.TransactionType == "MaternityAllowanceReturn"){
                    ele.InOrOutAmount = ele.InAmount;
                    this.totalReturn += ele.InAmount;
                  }
                  else{
                    ele.InOrOutAmount = ele.OutAmount;
                    this.totalPaid += ele.OutAmount;
                  } 
            }); 
        }
     },(err) => {
        this.msgBoxServ.showMessage('failed', ['Failed to get the patient details. Please try later.']);
     })
 }


 GetPaymentAmountFromCoreParameter(){
    let csvString:string = this.coreService.Parameters.find(p => p.ParameterGroupName == "Maternity" && p.ParameterName == "PaymentAmountsAvailable").ParameterValue;
    this.paymentAmounts = csvString.split(',').map(Number);
 }

    Save() {
        this.loading = true;
        if (this.paymentModelObj.MaternityPaymentDetailsValidator.controls['Amount'].invalid) {
            this.paymentModelObj.MaternityPaymentDetailsValidator.controls['Amount'].markAsDirty();
            this.paymentModelObj.MaternityPaymentDetailsValidator.controls['Amount'].updateValueAndValidity();
            this.loading = false;
            this.msgBoxServ.showMessage("error",["Please check the Amount and try again."]);
            return;
        }
        if (this.isPaymentReturn) {
            if (this.paymentModelObj.MaternityPaymentDetailsValidator.controls['Remarks'].invalid) {
                this.paymentModelObj.MaternityPaymentDetailsValidator.controls['Remarks'].markAsDirty();
                this.paymentModelObj.MaternityPaymentDetailsValidator.controls['Remarks'].updateValueAndValidity();
                this.msgBoxServ.showMessage("error",["Remarks is mandatory for Return."]);
                this.loading = false;
                return;
            }
            if(this.totalPaid - this.totalReturn <= 0){
                this.msgBoxServ.showMessage('failed', ['Cannot return more amount than paid amount']);
                this.loading = false;
                return;
            }
            if(this.totalPaid - this.totalReturn > 0 && this.paymentModelObj.InOrOutAmount > (this.totalPaid - this.totalReturn)){
                this.msgBoxServ.showMessage('failed', ['Cannot return more amount than paid amount']);
                this.loading = false;
                return;
            }
        }
        if (this.isPaymentReturn) {
            this.paymentModelObj.InAmount = this.paymentModelObj.InOrOutAmount;
            this.paymentModelObj.OutAmount = 0;
            this.paymentModelObj.TransactionType = 'MaternityAllowanceReturn';
        }
        else {
            this.paymentModelObj.OutAmount = this.paymentModelObj.InOrOutAmount;
            this.paymentModelObj.InAmount = 0;
            this.paymentModelObj.TransactionType = 'MaternityAllowance';
        }
        this.paymentModelObj.CreatedBy = this.securityService.loggedInUser.EmployeeId;
        this.paymentModelObj.IsActive = true;
        this.maternityBlService.AddMaternityPatientPayment(this.paymentModelObj)
            .subscribe((res) => {
                if (res.Status == "OK") {
                    this.loading = false;
                    this.paymentModelObj.MaternityPaymentDetailsValidator.reset();
                    this.msgBoxServ.showMessage('success', ['Payment done successfully.']);
                    this.paymentPatientId = res.Results.PatientPaymentId;
                    this.paymentModelObj.InOrOutAmount = null;
                    this.isPaymentReturn = false;
                    this.showPaymentReceipt = true;
                    //this.GetPatientPaymentDetails(this.paymentModelObj.PatientId);
                } else {
                    this.loading = false;
                    this.msgBoxServ.showMessage('failed', ['Failed to do payment. Please try again later.']);
                }
            },(err =>{
                this.loading = false;
                this.msgBoxServ.showMessage('failed', [err.error.ErrorMessage]);
            }))
    }

    Discard(){
        this.router.navigate(['/Maternity/Payments/PaymentPatientList']);
    }

    closePaymentPopup(event:any){
        if(event){
            this.showPaymentReceipt = false;
            this.paymentPatientId = 0;
            this.GetPatientPaymentDetails(this.patient.PatientId);
        }
    }
}