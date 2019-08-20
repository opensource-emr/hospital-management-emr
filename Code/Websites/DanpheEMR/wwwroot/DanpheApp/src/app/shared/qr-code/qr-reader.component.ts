import { Component, Output, EventEmitter, Renderer2 } from "@angular/core";
import { QrService } from "./qr-service";
import { CommonFunctions } from "../common.functions";
import { PatientsDLService } from "../../patients/shared/patients.dl.service";
import { DLService } from "../dl.service";
import { DanpheHTTPResponse } from "../common-models";
import { Patient } from "../../patients/shared/patient.model";

@Component({
    selector: 'danphe-qr-reader',
    templateUrl: "./qr-reader.html",
})
export class QrReaderComponent {

    public patientCode: string = null;
    public selPatient: Patient = new Patient();
    public showPatientPanel: boolean = false;
    public invalidPatientCode: boolean = false;
    @Output("on-success")
    onReadSuccess = new EventEmitter();


    constructor(public qrService: QrService, public dlService: DLService, public renderer2: Renderer2) {
        this.qrService.openScanner = true;
    }

    ngAfterViewInit() {
        let hospNoTbx = this.renderer2.selectRootElement('#txtHosptlNum');
        if (hospNoTbx)
            hospNoTbx.focus();
    }


    LoadPatientInfo(patCode) {
        if (patCode) {
            this.dlService.Read("/api/Patient?reqType=getPatientByCode&patientCode=" + patCode)
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
                    } else {
                        this.invalidPatientCode = true;
                    }

                },
                    err => {
                        this.invalidPatientCode = true;
                    });

        }
        else {
            alert("Hospital Number is empty");
        }
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
        console.log($event);
        //comes here only when enter is pressed. for keydown event, we've to check the code of pressed key.
        //if ($event.code == "Enter") {
        let scannedText = this.patientCode;
        let patCode = CommonFunctions.GetTextBetnDelimiters(scannedText, "[", "]");
        this.patientCode = patCode;
        if (patCode) {
            this.invalidPatientCode = false;
            this.LoadPatientInfo(patCode);
        }
        else {
            this.invalidPatientCode = true;
        }
        this.CloseCamera();
        //console.log(patCode);
        // console.log("Enter Pressed");
        //}
    }

}