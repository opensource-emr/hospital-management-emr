import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { IOAllergyVitalsBLService } from '../shared/io-allergy-vitals.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { Allergy } from "../shared/allergy.model"
import { Router } from '@angular/router';
import { PharmacyBLService } from "../../pharmacy/shared/pharmacy.bl.service";
import { PHRMGenericModel } from "../../pharmacy/shared/phrm-generic.model";

@Component({
    selector: "allergy-list",
    templateUrl: "../../view/clinical-view/AllergyList.html" // "/ClinicalView/AllergyList"
})
export class AllergyListComponent {


    public allergieLists: Array<Allergy> = new Array<Allergy>();
    public showAllergyAddBox: boolean = false; //@input
    //ng2-autocomplete binds the selected reaction to reactionSelected.
    public selectedAllergy: Allergy = null; //@input
  public selectedIndex: number = null;


  @Input("returnAllergyList") public returnAllergyList: boolean = false;
  @Output("allergyEmitter") public allergyEmitter: EventEmitter<object> = new EventEmitter<object>();

    constructor(public patientServ: PatientService,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.GetPatientAllergyList();
    }

    //gets the list of allergy of the selected patient.
    GetPatientAllergyList(): void {
        let patientId = this.patientServ.getGlobal().PatientId;
        this.ioAllergyVitalsBLService.GetPatientAllergyList(patientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allergieLists = res.Results;
                    this.patientServ.globalPatient.Allergies = this.allergieLists;
                  this.patientServ.globalPatient.FormatPatientAllergies();
                  if (this.returnAllergyList) {
                    this.allergyEmitter.emit({ allergieLists: res.Results });
                  }
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Failed. please check log for details."], res.ErrorMessage);

                }
            });
    }

    Edit(selectedAllergy: Allergy, index: number) {
        this.ResetVariables();
        this.selectedIndex = index;
        this.selectedAllergy = selectedAllergy;
        this.showAllergyAddBox = true;
    }

    CallBackAddUpdate($event) {
        if ($event && $event.allergy) {
            //update
            if (this.selectedIndex != null) {
                //this.allergieLists[this.selectedIndex] = $event.allergy;
                this.allergieLists.splice(this.selectedIndex, 1, $event.allergy);
                this.allergieLists.slice();
            }
            //add
            else {
              this.allergieLists.push($event.allergy);
              if (this.returnAllergyList) {
                let arr = [];
                arr.push($event.allergy);
                this.allergyEmitter.emit({ allergieLists: arr });
              }
            }
            this.UpdateGlobalAllergy();
        }
        this.ResetVariables();
    }

    ShowAddAllergyBox() {
        this.ResetVariables();
        this.showAllergyAddBox = true;
    }

    public ResetVariables() {
        this.selectedAllergy = null;
        this.selectedIndex = null;
        this.showAllergyAddBox = false;
        this.changeDetector.detectChanges();
    }

    public UpdateGlobalAllergy() {
        this.patientServ.globalPatient.Allergies = this.allergieLists;
        this.patientServ.globalPatient.FormatPatientAllergies();
    }
}
