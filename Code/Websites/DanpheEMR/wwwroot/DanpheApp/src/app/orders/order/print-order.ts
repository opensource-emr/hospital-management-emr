import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { Patient } from '../../patients/shared/patient.model';

@Component({
    templateUrl: "../../view/order-view/PrintMedications.html" // "/OrderView/PrintMedications"
})

export class PrintMedicationsComponent {
    public currPat: Patient = new Patient();
    constructor(public router: Router, public patService: PatientService) {
        this.currPat = this.patService.getGlobal();
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

}