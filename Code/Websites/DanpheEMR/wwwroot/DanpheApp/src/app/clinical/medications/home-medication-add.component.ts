import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { MedicationBLService } from '../shared/medication.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { HomeMedication } from "../shared/home-medication.model";
import { HttpClient,HttpHeaders} from '@angular/common/http';
import * as moment from 'moment/moment';

@Component({
    selector: "home-medication-add",
    templateUrl: "./home-medication-add.html"
})
export class HomeMedicationAddComponent {

    @Input("selected-homeMedication")
    public CurrentHomeMedication: HomeMedication = new HomeMedication();
    public allMedicineList: Array<{ MedicineId, MedicineName }> = [];

    //ng2-autocomplete binds the selected medicine to medicineSelected.
    public medicineSelected = { MedicineId: null, MedicineName: null };
    //used in ng2-autocomplete in the cshtml for data source.
    public medicineServerPath: string = "/api/Master?type=medicine&inputValue=:keywords";
    public loading: boolean = false;
    public showMedicationAddBox: boolean = false;

    @Output("callback-addupdate")
    public callbackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public patientService: PatientService,
        public medicationBLService: MedicationBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public http: HttpClient) {
        this.LoadAllMedications();

    }
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
  
    @Input("show-homemedication-add")
    public set ViewPage(_viewPage: boolean) {
        //edit
        if (_viewPage && this.CurrentHomeMedication) {
            if (this.CurrentHomeMedication.HomeMedicationId) {

                //map data that is suitable with the view.
                var medicineSelected = this.allMedicineList.find(a => a.MedicineId == this.CurrentHomeMedication.MedicationId);
                this.medicineSelected = medicineSelected;
                this.CurrentHomeMedication.LastTaken = moment(this.CurrentHomeMedication.LastTaken).format('YYYY-MM-DD');

                //assign data from list page to instance of HomeMedicationn class (Since list page object don't have validator property.)
                var homeMedication = new HomeMedication();
                homeMedication = Object.assign(homeMedication, this.CurrentHomeMedication);
                this.CurrentHomeMedication = homeMedication;
            }
            //add
            else {
                this.Initialize();
            }
            this.showMedicationAddBox = true;
        }
        else {
            this.showMedicationAddBox = false;
        }
    }

    Initialize() {
        this.medicineSelected = null;
        this.CurrentHomeMedication.PatientId = this.patientService.getGlobal().PatientId;
        this.CurrentHomeMedication.LastTaken = moment().format("YYYY-MM-DD");
    }

    //get the list of surgical history of the selected patient.
    LoadAllMedications(): void {
        //only for temporary purpose, call it using pharmacydl service.
    
        this.http.get<any>('/api/Pharmacy?reqType=item', this.options).map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allMedicineList = [];//empty the medicationlist after server call.
                    res.Results.forEach(itm => {
                        this.allMedicineList.push({
                            MedicineName: itm.ItemName,
                            MedicineId: itm.ItemId
                        });
                    });
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Failed to Load Medication List.'], res.ErrorMessage);
                }
            });
    }

    SaveHomeMedication() {
        if (!this.loading) {
            //ng2-autocomplete binds the selected medicine to medicineSelected object.
            //if medicine is selected, assinging the medication Id to CurrentHomeMedicaiton.MedicationId.
            if (this.medicineSelected) {
                this.CurrentHomeMedication.MedicationId = this.medicineSelected.MedicineId;
                this.CurrentHomeMedication.MedicationName = this.medicineSelected.MedicineName;
            }
            //marking every fields as dirty and checking validity
            for (var i in this.CurrentHomeMedication.HomeMedicationValidator.controls) {
                this.CurrentHomeMedication.HomeMedicationValidator.controls[i].markAsDirty();
                this.CurrentHomeMedication.HomeMedicationValidator.controls[i].updateValueAndValidity();
            }
            //if valid then call the BL service to do post request.
            if (this.CurrentHomeMedication.IsValidCheck(undefined, undefined) == true) {
                this.loading = true;
                if (this.CurrentHomeMedication.HomeMedicationId) {
                    this.Update();
                }
                else {
                    this.AddHomeMedication();
                }
            }
        }
    }

    //post new home-medication
    AddHomeMedication(): void {
        this.CurrentHomeMedication.PatientId = this.patientService.getGlobal().PatientId;
        this.loading = false;
        this.medicationBLService.PostHomeMedication(this.CurrentHomeMedication)
            .subscribe(
                res => {
                  
                    if (res.Status == "OK") {
                        this.CallBackAddUpdate(res.Results);
                        this.msgBoxServ.showMessage("success", ["Added successfully"]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ['Unable to add home medication.']);
                    }
                });

    }

    public Update() {
        this.medicationBLService.PutHomeMedication(this.CurrentHomeMedication)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CallBackAddUpdate(res.Results);
                        this.msgBoxServ.showMessage("success", ["Updated Successfully."]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ['Unable to update home medication.']);
                    }
                });
    }
    CallBackAddUpdate(_homeMedication) {

        this.CurrentHomeMedication = new HomeMedication();
        this.medicineSelected = null;
        this.callbackAddUpdate.emit({ "homeMedication": _homeMedication });
    }

    myListFormatter(data: any): string {
        let html = data["MedicineName"];
        return html;
    }
}
