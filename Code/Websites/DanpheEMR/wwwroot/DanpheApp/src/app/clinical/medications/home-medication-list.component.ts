import { Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { MedicationBLService } from '../shared/medication.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { HomeMedication } from "../shared/home-medication.model";
import { HttpClient} from '@angular/common/http';
import * as moment from 'moment/moment';
import { Router } from "@angular/router";
import { Patient } from "../../patients/shared/patient.model";
@Component({
    templateUrl: "../../view/clinical-view/HomeMedicationList.html"    // "/ClinicalView/HomeMedication"
})
export class HomeMedicationListComponent {

    public homemedications: Array<HomeMedication> = new Array<HomeMedication>();

    public showMedicationAddBox: boolean = false;
    public selectedIndex: number = null;
    public selectedHomeMedication;
    constructor(public patientService: PatientService,
        public medicationBLService: MedicationBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public http: HttpClient,public router: Router) {
        this.GetHomeMedicationList();
    }
    //get the list of surgical history of the selected patient.
    GetHomeMedicationList(): void {
        let patientId = this.patientService.getGlobal().PatientId;
        this.medicationBLService.GetHomeMedicationList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.homemedications = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed to Load Home Medication List for this Patient.'], res.ErrorMessage);
                }
            });
    }

    AddNewHomeMedication() {
        this.selectedIndex = null;
        this.showMedicationAddBox = false;
        this.changeDetector.detectChanges();
        this.selectedHomeMedication = new HomeMedication();
        this.showMedicationAddBox = true;
    }

    EditHomeMedication(_homeMedication, index) {
        this.selectedIndex = index;
        this.selectedHomeMedication = _homeMedication;
        this.showMedicationAddBox = false;
        this.changeDetector.detectChanges();
        this.showMedicationAddBox = true;
    }

    CallBackAddUpdate($event) {
        //update case
        if (this.selectedIndex != null) {
            this.homemedications[this.selectedIndex] = $event.homeMedication;
            this.homemedications = this.homemedications.slice(); // sends fresh copy of array so that angular detects changes;
        }
        //add case
        else {
            this.homemedications.push($event.homeMedication);
        }
    }
    public currPat: Patient = new Patient();
    printMedications() {
            this.router.navigate(['/Doctors/PatientOverviewMain/Orders/PrintMedication']);
      }
}