import { Component, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { Patient } from '../../patients/shared/patient.model';
import { MedicationBLService } from '../../clinical/shared/medication.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { HomeMedication } from '../../clinical/shared/home-medication.model';
import { EventEmitter } from 'events';
import { CoreService } from '../../core/shared/core.service';

@Component({
    templateUrl: "../../view/order-view/PrintMedications.html" // "/OrderView/PrintMedications"
})

export class PrintMedicationsComponent {
    public currPat: Patient = new Patient();
    public medicine: Array<HomeMedication> = new Array<HomeMedication>();
    public hospitalName :string = '';
    public address :string = '';
    public email :string = '';
    public tel :string = '';
    public pan :string = '';
    constructor(public patientService: PatientService,
        public router: Router, public patService: PatientService,
        public medicationBLService: MedicationBLService,
        public msgBoxServ: MessageboxService,
        public coreService : CoreService) {
        this.currPat = this.patService.getGlobal();
        this.GetCustomerHeaderParameter();
        this.GetMedication();
        
    }
GetMedication(){
    let patientId = this.patientService.getGlobal().PatientId;
    this.medicationBLService.GetHomeMedicationList(patientId)
        .subscribe(res => {
            if (res.Status == "OK") {
                this.medicine = res.Results;
            }
            else {
                this.msgBoxServ.showMessage("failed", ['Failed to Load Home Medication List for this Patient.'], res.ErrorMessage);
            }
        });
}

print() {
        let popupWinindow;
        var printContents = document.getElementById("medicinePrintpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.close();        
    }
Back(){
    this.router.navigate(['/Doctors/PatientOverviewMain/Clinical/HomeMedication']);
}
GetCustomerHeaderParameter() {
    try {
        let headerInfo = JSON.parse(this.coreService.Parameters.filter(a => a.ParameterName == 'CustomerHeader')[0]["ParameterValue"]);                                       
        this.hospitalName = headerInfo.hospitalName;
        this.address = headerInfo.address;
        this.email = headerInfo.email;
        this.tel = headerInfo.tel;
        this.pan = headerInfo.pan;
    } catch (ex) {

    }

}
}