import { Component, Output, EventEmitter, Renderer2, Input } from "@angular/core";
import { QrService } from "./qr-service";
import { CommonFunctions } from "../common.functions";
import { PatientsDLService } from "../../patients/shared/patients.dl.service";
import { DLService } from "../dl.service";
import { DanpheHTTPResponse } from "../common-models";
import { Patient } from "../../patients/shared/patient.model";
import { ReturnToVendorComponent } from "../../inventory/reports/return-to-vendor/return-to-vendor-report.component";

@Component({
  selector: 'danphe-qr-reader',
  templateUrl: "./qr-reader.html",
})
export class QrReaderComponent {

  public patientCode: string = null;
  public selPatient: Patient = new Patient();
  public showPatientPanel: boolean = false;
  public invalidPatientCode: boolean = false;

  @Input("department") public department: string = null;
  @Output("on-success")
  onReadSuccess = new EventEmitter();
  @Output("on-ReadFailed")
  onReadFailed = new EventEmitter();


  constructor(public qrService: QrService, public dlService: DLService, public renderer2: Renderer2) {
    this.qrService.openScanner = true;
  }

  ngAfterViewInit() {
    //console.log("after view init called..");
    this.setFocusToHospNoTextbox();
  }


  LoadPatientInfo(patCode) {
    let patCodeFormatted = this.GetPatientCodeFromInput(patCode);

    if (patCodeFormatted) {
      if (this.department == 'billing') {
        this.dlService.Read("/api/Patient?reqType=getPatientByCode&patientCode=" + patCodeFormatted)
          .map(res => res)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK" && res.Results && res.Results.PatientId) {
              this.invalidPatientCode = false;
              let pat: Patient = res.Results;
              console.log(pat);
              this.selPatient = pat;
              this.showPatientPanel = true;
              this.CloseCamera();
              this.onReadSuccess.emit(pat);
            }
            else {
              this.invalidPatientCode = true;
              this.onReadFailed.emit({ failed: true });
            }

          },
            err => {
              this.invalidPatientCode = true;
              this.onReadFailed.emit({ failed: true });
            });


      }
      else if (this.department == 'lab') {
        this.onReadSuccess.emit({ patientCode: patCode });
      }
      this.setFocusToHospNoTextbox();

    }
    else {
      alert("Hospital Number is empty");
    }


  }

  GetPatientCodeFromInput(patCode: string): string {
    let retVal = "";
    //if patient code was entered directly and pressed enter then square bracket "[" "]" won't be present, so we've to handle that accordingly.
    if (patCode && patCode.indexOf("[") > -1 && patCode.indexOf("]") > -1) {
      retVal = CommonFunctions.GetTextBetnDelimiters(patCode, "[", "]");
    }
    else {
      retVal = patCode;
    }
    return retVal;
  }


  Close() {
    this.qrService.show = false;
    this.qrService.openScanner = false;
  }

  OnScanSuccess($event) {
    let scannedText = $event;
    let patCode = CommonFunctions.GetTextBetnDelimiters(scannedText, "[", "]");
    this.patientCode = patCode;
    this.LoadPatientInfo(patCode);
    this.CloseCamera();
  }

  OpenScanner() {
    this.qrService.openScanner = true;
  }

  CloseCamera() {
    this.qrService.openScanner = false;
  }

  handleKeyDown($event) {
    this.invalidPatientCode = false;
    //console.log($event);
    //console.log(this.patientCode);
    //comes here only when enter is pressed. for keydown event, we've to check the code of pressed key.
    //if ($event.code == "Enter") {
    //let scannedText = this.patientCode;

    let patCode = this.GetPatientCodeFromInput(this.patientCode);

    //  "";
    ////if patient code was entered directly and pressed enter then square bracket "[" "]" won't be present, so we've to handle that accordingly.
    //if (scannedText && scannedText.indexOf("[") > -1 && scannedText.indexOf("]") > -1) {
    //  patCode = CommonFunctions.GetTextBetnDelimiters(scannedText, "[", "]");
    //}
    //else {
    //  patCode = scannedText;
    //}


    this.patientCode = patCode;
    if (patCode) {
      this.invalidPatientCode = false;
      this.LoadPatientInfo(patCode);
    }
    else {
      this.invalidPatientCode = true;
      this.onReadFailed.emit({ failed: true });
    }
    this.CloseCamera();
    //console.log(patCode);
    // console.log("Enter Pressed");
    //}
  }

  setFocusToHospNoTextbox() {
    let hospNoTbx = this.renderer2.selectRootElement('#txtHosptlNum');
    if (hospNoTbx) {
      hospNoTbx.focus();
      //hospNoTbx.select();
    }
  }

}
