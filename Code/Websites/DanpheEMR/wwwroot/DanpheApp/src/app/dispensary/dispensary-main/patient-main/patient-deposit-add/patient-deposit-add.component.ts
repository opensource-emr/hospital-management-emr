import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Patient } from '../../../../patients/shared/patient.model';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMDepositModel } from './phrm-deposit.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { CallbackService } from '../../../../shared/callback.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import { DispensaryService } from '../../../shared/dispensary.service';
import { CoreService } from '../../../../core/shared/core.service';
@Component({
  selector: 'app-patient-deposit-add',
  templateUrl: './patient-deposit-add.component.html',
})
export class PatientDepositAddComponent implements OnInit {

  public ShowDepositAdd: boolean = false;
  public currentCounterId: number = null;
  public currentCounterName: string = null;
  loading: boolean = false;
  public Paymentdata: boolean = false;
  public ShowPrint: boolean = false;
  @Input("deposit-data")
  public selectedPatient: Patient = new Patient();
  @Input("isAddDepositTxn")
  public isAddDepositTxn: boolean = false;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public depositData: PHRMDepositModel = new PHRMDepositModel();
  public printDepositData: PHRMDepositModel = new PHRMDepositModel();
  public currentFiscalYear: any;
  public user = this.securityService.GetLoggedInUser().UserName;
  constructor(public securityService: SecurityService, private _dispensaryService: DispensaryService,
    public pharmacyService: PharmacyService,
    public pharmacyBLService: PharmacyBLService,
    public router: Router,
    public routeFromService: RouteFromService,
    public patientservice: PatientService,
    public callbackservice: CallbackService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {

    this.Initialize();
  }

  ngOnInit() {
  }
  @Input("showDepositAdd")
  public set ShowAdd(_showAdd) {
    this.ShowDepositAdd = _showAdd;

    if (this.ShowDepositAdd) {
      let temp = this.selectedPatient;
      this.Initialize();
      if (this.selectedPatient) {
        this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
        if (this.currentCounterId < 1) {
          this.router.navigate(['/Dispensary/ActivateCounter']);
          this.callbackservice.CallbackRoute = '/Dispensary/Patient/List'
        }
        this.GetPatientDeposit(this.selectedPatient.PatientId);
      }
    }
  }
  Initialize() {

    this.loading = false;
    this.depositData = new PHRMDepositModel();
    this.depositData.CounterId = this.securityService.getLoggedInCounter().CounterId;
    this.depositData.DepositType = "deposit";
    this.depositData.PaymentMode = "cash";
  }

  GetPatientDeposit(patientId: number): void {
    this.pharmacyBLService.GetDepositFromPatient(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          if (res.Results.length)
            this.CalculateDepositBalance(res);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get deposit detail"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  CalculateDepositBalance(res) {
    let depositAmount = 0;
    let returnDepositAmount = 0;
    let depositDeductAmount = 0;
    for (var i = 0; i < res.Results.length; i++) {
      if (res.Results[i].DepositType == "deposit") {
        depositAmount = res.Results[i].DepositAmount;
      }
      else if (res.Results[i].DepositType == "depositreturn") {
        returnDepositAmount = res.Results[i].DepositAmount;
      }
      else if (res.Results[i].DepositType == "depositdeduct") {
        depositDeductAmount = res.Results[i].DepositAmount;
      }
    }
    this.depositData.DepositBalance = CommonFunctions.parseAmount(depositAmount - depositDeductAmount - returnDepositAmount);
  }

  onPaymentModeChange() {
    if (this.depositData.PaymentMode != 'cash') {
      this.depositData.UpdateValidator('on', 'PaymentDetails', 'required');
    } else {
      this.depositData.UpdateValidator('off', 'PaymentDetails', 'required');
    }
  }

  SubmitDeposit(showReceipt: boolean) {
    this.loading = true;
    //to store counter Id
    this.depositData.CounterId = this.currentCounterId;
    if (this.depositData.DepositType) {

      if (this.depositData.DepositAmount > 0) {
        if (this.depositData.DepositType == "depositreturn" && this.depositData.DepositAmount > this.depositData.DepositBalance) {
          this.msgBoxServ.showMessage("failed", ["Return Amount should not be greater than deposit Amount"]);
          this.loading = false;
          return;
        }
        if (this.depositData.DepositType == "depositreturn" && this.depositData.Remark == '') {
          this.msgBoxServ.showMessage("failed", ["Remarks is mendatory for deposit return."]);
          this.loading = false;
          return;
        }

        for (var b in this.depositData.DepositValidator.controls) {
          this.depositData.DepositValidator.controls[b].markAsDirty();
          this.depositData.DepositValidator.controls[b].updateValueAndValidity();
        }
        if (this.depositData.IsValid(undefined, undefined)) {

          if (this.depositData.DepositType == "deposit") {
            this.depositData.DepositBalance = this.depositData.DepositBalance + this.depositData.DepositAmount;
          }
          else {
            this.depositData.DepositBalance = this.depositData.DepositBalance - this.depositData.DepositAmount;
          }

          this.loading = true;
          this.depositData.PatientId = this.selectedPatient.PatientId;
          this.depositData.StoreId = this._dispensaryService.activeDispensary.StoreId;
          this.pharmacyBLService.PostPharmacyDeposit(this.depositData)
            .subscribe(
              res => {
                if (res.Status == "OK") {
                  if (this.depositData.DepositType == "deposit") {
                    //deposit add 
                    this.msgBoxServ.showMessage("success", ["Deposit of " + this.depositData.DepositAmount + " added successfully."]);
                    this.Close();
                  }
                  else {
                    //deposit return
                    this.msgBoxServ.showMessage("success", [this.depositData.DepositAmount + " returned successfully."]);
                    this.Close();
                  }
                  this.depositData.DepositBalance = res.Results.DepositBalance;
                  if (showReceipt) {
                    this.printDepositData = res.Results;
                    this.ShowDepositAdd = false;
                    this.ShowPrint = true;
                  }
                  this.Initialize();
                  this.loading = false;
                }
                else {
                  this.msgBoxServ.showMessage("failed", ["Cannot complete the transaction."]);
                  this.loading = false;
                }
              });
        }
        else {
          this.msgBoxServ.showMessage("failed", ["* field are mandatory!"]);
          this.loading = false;
        }
      } else {
        this.msgBoxServ.showMessage("failed", [this.depositData.DepositType + " Amount must be greater than 0"]);
        this.loading = false;
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please Select Deposit Type"])
      this.loading = false;
    }
  }
  Print() {
    this.pharmacyBLService.UpdateDepositPrintCount(this.printDepositData).subscribe(
      res => {
        if (res.Status == "OK") {
          let popupWinindow;
          var printContents = document.getElementById("printpage").innerHTML;
          popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
          popupWinindow.document.open();
          let documentContent = "<html><head>";
          documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
          documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
          documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
          documentContent += '</head>';
          documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
          popupWinindow.document.write(documentContent);
          popupWinindow.document.close();
          this.Close();
        } else {
          this.msgBoxServ.showMessage("failed", ["Please try again"]);
          this.loading = false;
        }
      });

  }
  Close() {
    this.ShowDepositAdd = false;
    this.ShowPrint = false;
    this.callbackAdd.emit({ 'result': "Deposit added succesfully" });
  }

}
