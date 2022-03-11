import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Patient } from '../../../../patients/shared/patient.model';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMPrescriptionItem } from '../../../../pharmacy/shared/phrm-prescription-item.model';
import { PHRMPrescription } from '../../../../pharmacy/shared/phrm-prescription.model';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import DispensaryGridColumns from '../../../shared/dispensary-grid.column';

@Component({
  selector: 'app-prescription-list',
  templateUrl: './prescription-list.component.html',
  styleUrls: ['./prescription-list.component.css']
})
export class PrescriptionListComponent implements OnInit {

  //It save prescriptionid with prescription itmes details for local data access
  public prescriptionListData = new Array<{ PrescriptionId: number, PrescriptionItems: Array<PHRMPrescriptionItem> }>();
  public currentPrescription = new PHRMPrescription();
  patient: Patient = new Patient();
  public prescriptionGridColumns: Array<any> = null;
  public showPreItemsPopup: boolean = false;
  public isShowPrescriptionDetail: boolean = false;
  public blockDispatch: boolean = false;
  constructor(
    public pharmacyService: PharmacyService,
    public patientService: PatientService,
    public routeFromService: RouteFromService,
    public router: Router,
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.LoadPrescriptions();
    this.prescriptionGridColumns = DispensaryGridColumns.PHRMPrescriptionList;
  }
  ngOnInit() {
  }
  //Load prescription list
  LoadPrescriptions(): void {
    try {
      this.pharmacyBLService.GetPrescriptionList()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.prescriptionListData = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  logError(err: any) {
    this.msgBoxServ.showMessage("error", [err]);
    console.log(err);
  }
  //Grid actions fires this method
  PrescriptionGridActions($event: GridEmitModel) {
    try {
      switch ($event.Action) {
        case "view": {
          this.currentPrescription = $event.Data;
          this.pharmacyBLService.GetPrescriptionItems(this.currentPrescription.PatientId, this.currentPrescription.ProviderId)
            .subscribe(res => {
              if (res.Status == 'OK' && res.Results.length > 0) {
                this.currentPrescription.PHRMPrescriptionItems = res.Results;
                this.blockDispatch = this.currentPrescription.PHRMPrescriptionItems.every(a => a.IsAvailable == false);
              } else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
              }
            }, err => { });
          this.isShowPrescriptionDetail = true;
          break;
        }
        default:
          break;
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  Dispatch() {
    this.pharmacyService.PatientId = this.currentPrescription.PatientId;
    this.pharmacyService.ProviderId = this.currentPrescription.ProviderId;
    //get patient details by pat id and set to patient service for sale use
    this.pharmacyBLService.GetPatientByPatId(this.pharmacyService.PatientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.CallBackAfterPatGet(res.Results);
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

        });
  }
  ////Method to get patient details by Patient Id for set value to patient service
  public CallBackAfterPatGet(results) {
    try {
      this.SetPatServiceData(results);
      this.routeFromService.RouteFrom = "prescription";
      this.router.navigate(['/Dispensary/Sale/New']);
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //Method for assign value to patient service
  public SetPatServiceData(selectedPatientData) {
    try {
      if (selectedPatientData) {
        var globalPatient = this.patientService.getGlobal();
        globalPatient.PatientId = selectedPatientData.PatientId;
        globalPatient.PatientCode = selectedPatientData.PatientCode;
        globalPatient.ShortName = selectedPatientData.ShortName;
        globalPatient.DateOfBirth = selectedPatientData.DateOfBirth;
        globalPatient.Gender = selectedPatientData.Gender;
        globalPatient.IsOutdoorPat = selectedPatientData.IsOutdoorPat;
        globalPatient.PhoneNumber = selectedPatientData.PhoneNumber;
        globalPatient.FirstName = selectedPatientData.FirstName;
        globalPatient.MiddleName = selectedPatientData.MiddleName;
        globalPatient.LastName = selectedPatientData.LastName;
        globalPatient.Age = selectedPatientData.Age;
        globalPatient.Address = selectedPatientData.Address;
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    try {
      if (exception) {
        let ex: Error = exception;
        console.log("Error Messsage =>  " + ex.message);
        console.log("Stack Details =>   " + ex.stack);
      }
    } catch (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  Close() {
    this.currentPrescription = new PHRMPrescription();
    this.isShowPrescriptionDetail = false;
  }
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
    popupWinindow.document.close();
  }
}
