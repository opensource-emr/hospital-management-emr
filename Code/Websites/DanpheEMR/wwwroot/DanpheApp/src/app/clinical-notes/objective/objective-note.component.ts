import { Component, Input, Output, ChangeDetectorRef, EventEmitter } from "@angular/core";
import { ObjectiveNotesModel } from "../shared/objective-notes.model";
import { IOAllergyVitalsBLService } from "../../clinical/shared/io-allergy-vitals.bl.service";
import { SecurityService } from "../../security/shared/security.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PatientService } from "../../patients/shared/patient.service";
import { Vitals } from "../../clinical/shared/vitals.model";
import { PatientClinicalDetail } from "../../clinical/shared/patient-clinical-details.vmodel";
import { NotesModel } from "../shared/notes.model";
import { Visit } from "../../appointments/shared/visit.model";
import { MedicationBLService } from "../../clinical/shared/medication.bl.service";

@Component({
    selector: "objective-note",
    templateUrl: "./objective-note.html"
})

export class ObjectiveNotesComponent {
    public loading: boolean = false;
    public patVisit: Visit = new Visit();
    public showVitalAddBox: boolean = true;
    public notes: NotesModel = new NotesModel();
    public vitalsList: Array<Vitals> = new Array<Vitals>();
    public painDataList: Array<any> = new Array<any>();
    public addVitalBox: boolean = false;
    public showMedicationAddBox: boolean = false; //@input-medication
    @Input("objective-note")
    public objectiveNote: ObjectiveNotesModel;

    @Input("clinical-detail")
  public clinicalDetail: PatientClinicalDetail = new PatientClinicalDetail();

  @Output("callback-objectivenote")
  public CallBackObjectiveNotes: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public ioAllergyVitalsBLService: IOAllergyVitalsBLService, public patientservice: PatientService,
     public visitService: VisitService , public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public medicationBLService: MedicationBLService,)
    {
      this.patVisit = this.visitService.getGlobal();
        this.GetPatientVitalsList();     
    }

    //gets the list of vitals of the selected patient.
    GetPatientVitalsList(): void {
        let patientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.ioAllergyVitalsBLService.GetPatientVitalsList(patientVisitId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.CallBackGetPatientVitalList(res.Results);
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);

                }
            },
                err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); });
    }

    CallBackGetPatientVitalList(_vitalsList) {
        //looping through the vitalsList to check if any object contains height unit as inch so that it can be converted to foot inch.
        for (var i = 0; i < _vitalsList.length; i++) {
            if (_vitalsList[i].HeightUnit && _vitalsList[i].HeightUnit == "inch") {
                //incase of footinch we're converting and storing as inch.
                //converting back for displaying in the format foot'inch''
                _vitalsList[i].Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(_vitalsList[i].Height);
            }
            var jsonData = JSON.parse(_vitalsList[i].BodyPart);
            this.painDataList.push(jsonData);
        }
        this.vitalsList = _vitalsList;
    }



    //AddObjectiveNotes() {        
    //    if (this.objectiveNote.HEENT || this.objectiveNote.Abdomen || this.objectiveNote.Chest || this.objectiveNote.CVS || this.objectiveNote.Extremity || this.objectiveNote.Neurological || this.objectiveNote.Skin) {
    //        this.loading = true;
    //        this.objectiveNote.VisitId = this.visitService.getGlobal().PatientVisitId;
    //        this.ioAllergyVitalsBLService.AddObjectiveNotes(this.objectiveNote)
    //            .subscribe(res => {
    //                if (res.Status == "OK")
    //                    this.CallBackAddNotes(res.Results);
    //                else {
    //                    this.msgBoxServ.showMessage("failed", ["Failed", "Please check log for details."], res.ErrorMessage);
    //                    this.loading = false;
    //                }
    //            });
    //    }
    //    else
    //    {
    //        this.msgBoxServ.showMessage("failed", ["Failed!! Please Enter atLeast One Field"]);  
    //        this.loading = false;
    //    }
        
    //}

    //CallBackAddNotes(result) {
    //    this.msgBoxServ.showMessage("success", ["Subjective Note of Patient Added"]);
    //    this.objectiveNote = new ObjectiveNote();
    //    this.loading = false;
    //}

    openAddVital() {
        this.addVitalBox = false;
        this.changeDetector.detectChanges();
        this.addVitalBox = true;
    }
    showHideFunc(data) {
        if (data.vitals) {          
            var jsonData = JSON.parse(data.vitals.BodyPart);
            this.painDataList.push(jsonData);
            if (data.vitals.HeightUnit == "inch") {
                //incase of footinch we're converting and storing as inch.
                //converting back for displaying in the format foot'inch''
                data.vitals.Height = this.ioAllergyVitalsBLService.ConvertInchToFootInch(data.vitals.Height);
            }
            this.vitalsList.push(data.vitals);
            this.vitalsList.slice();
        }
        this.addVitalBox = false;
    }

  Focusit() {
    this.objectiveNote.PatientId = this.patVisit.PatientId;
    this.objectiveNote.PatientVisitId = this.patVisit.PatientId;
    if (this.objectiveNote) {
      this.CallBackObjectiveNotes.emit({ objectivenote : this.objectiveNote });
    }
  }
  CallBackAddMedication($event) { //@output
    if ($event && $event.homeMedication) {
        this.clinicalDetail.Medications.push($event.homeMedication);
    }
    this.showMedicationAddBox = false;
    this.changeDetector.detectChanges();
}


AddMediactionPopUp() {
    this.showMedicationAddBox = false;
    this.changeDetector.detectChanges();
    this.showMedicationAddBox = true;
}

}

