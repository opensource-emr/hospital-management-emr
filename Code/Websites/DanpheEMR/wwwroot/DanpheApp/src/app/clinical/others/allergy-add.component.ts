import { Input, Output, EventEmitter, Component, ChangeDetectorRef } from "@angular/core";
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { IOAllergyVitalsBLService } from '../shared/io-allergy-vitals.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { Allergy } from "../shared/allergy.model"
import { Router } from '@angular/router';
import { PharmacyBLService } from "../../pharmacy/shared/pharmacy.bl.service";
import { PHRMGenericModel } from "../../pharmacy/shared/phrm-generic.model";

@Component({
    selector: "allergy-add",
    templateUrl: "./allergy-add.html"
})

export class AllergyAddComponent {

    @Input("selected-allergy")
    public CurrentAllergy: Allergy = new Allergy();

    public showAllergyAddBox: boolean = false;
    //ng2-autocomplete binds the selected medicine to allergenSelected.
    public allergicGenList: Array<PHRMGenericModel> = new Array<PHRMGenericModel>();

    //allergenSelected: { MedicineId: number, MedicineName: string };

    public allergenSelected: PHRMGenericModel = null;
    //ng2-autocomplete binds the selected reaction to reactionSelected.
    reactionSelected: { ReactionId: number, ReactionCode: string, ReactionName: string };
    public reactionList = [];
    showValidationMsg: boolean = false;
    public selectedIndex: number = null;
    public loading: boolean = false;

    @Output("callback-addupdate")
    callbackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public patientServ: PatientService,
        public callbackServ: CallbackService,
        public router: Router,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.Initialize();
        this.GetReactionList();
        this.GetMedicineList();
    }

    @Input("showAllergyAddBox")
    public set viewpage(_viewpage: boolean) {
        if (_viewpage) {
            if (this.CurrentAllergy && this.CurrentAllergy.PatientAllergyId) {
                var currentallergy = new Allergy();
                currentallergy = Object.assign(currentallergy, this.CurrentAllergy);
                this.Initialize();
                this.CurrentAllergy = currentallergy;
                this.MapSelectedReaction();
                this.MapSelectedAllergen();
            }
            else {
                this.Initialize();
            }
        }
        this.showAllergyAddBox = _viewpage;
    }

    public Initialize() {
        this.CurrentAllergy = new Allergy();
        this.CurrentAllergy.PatientId = this.patientServ.getGlobal().PatientId;
        this.reactionSelected = null;
        this.allergenSelected = null;
        this.showValidationMsg = false;
    }

    GetMedicineList() {
        this.ioAllergyVitalsBLService.GetPhrmGenericList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allergicGenList = res.Results.filter(dt => dt.IsAllergen);
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage);
                }
            });
    }

    GetReactionList() {
        this.ioAllergyVitalsBLService.GetReactionList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.reactionList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Failed. please check log for details."], res.ErrorMessage);
                }
            });
    }

    ////Used to hide others or allergen/advreaciton as per required. 
    AllergyTypeOnChange() {
        if (this.CurrentAllergy.AllergyType == "Others") {
            this.allergenSelected = null;
            this.CurrentAllergy.AllergenAdvRecName = null;
            this.CurrentAllergy.AllergenAdvRecId = null;
        }
        else {
            //this.CurrentAllergy.AllergenAdvRecName = null;
        }
    }


    public ValidationCheck(): boolean {
        //marking every fields as dirty and checking validity
        for (var i in this.CurrentAllergy.AllergyValidator.controls) {
            this.CurrentAllergy.AllergyValidator.controls[i].markAsDirty();
            this.CurrentAllergy.AllergyValidator.controls[i].updateValueAndValidity();
        }
        this.IsDirtyAllergen();

        //return true if all cases are true. 
        if ((this.CurrentAllergy.AllergenAdvRecName || this.CurrentAllergy.AllergenAdvRecId)
            && this.CheckSelectedReaciton()
            && this.CurrentAllergy.IsValidCheck(undefined, undefined)) {
            return true;
        }
        else
            return false;

    }
    
    public SubmitForm() {
        if (!this.loading && this.ValidationCheck()) {
            this.loading = true;
            if (this.CurrentAllergy.PatientAllergyId) {
                this.Update();
            }
            else {
                this.AddAllergy();
            }
        }
    }

    //checks if either any medicine is selected or any other allergy is mentioned.
    //if not selected displays validation message.
    IsDirtyAllergen() {
        if (this.allergenSelected || this.CurrentAllergy.AllergenAdvRecName)
            this.showValidationMsg = false;
        else
            this.showValidationMsg = true;
    }

    //post new allergen or adv reaction or other type of allergy.
    AddAllergy() {
        this.ioAllergyVitalsBLService.PostAllergy(this.CurrentAllergy)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CloseAllergyAddBox(res.Results);
                        this.msgBoxServ.showMessage("success", ["added successfully"]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Failed. please check log for details."], res.ErrorMessage);

                    }
                },
                err => { this.msgBoxServ.showMessage("error", [err]); });

    }

    public Update() {
        this.ioAllergyVitalsBLService.PutAllergy(this.CurrentAllergy)
            .subscribe(
                res => {
                    this.loading = false;
                    if (res.Status == "OK") {
                        this.CloseAllergyAddBox(res.Results);
                        this.msgBoxServ.showMessage("success", ["updated successfully"]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Failed. please check log for details."], res.ErrorMessage);
                    }
                });
    }

    //call back function of post allergy
    CloseAllergyAddBox(_allergy = null) {
        this.showAllergyAddBox = false;
        this.callbackAddUpdate.emit({ "allergy": _allergy });
    }

    //used to format display of item in ng-autocomplete.
    reactionListFormatter(data: any): string {
        let html = data["ReactionCode"] + ' (' + data["ReactionName"] + ')';
        return html;
    }
    allergenListFormatter(data: any): string {
        let html = data["GenericName"];
        return html;
    }
    //validation check if the item is selected from the list
    public CheckSelectedReaciton(): boolean {
        if (typeof (this.reactionSelected) != 'object') {
            this.reactionSelected = undefined;
            this.msgBoxServ.showMessage("failed", ["Please select reaction from the list."]);
            return false;
        }
        return true;
    }
    public CheckAllergenSelected(): boolean {
        if (typeof (this.allergenSelected) != 'object') {
            this.allergenSelected = undefined;
            this.msgBoxServ.showMessage("failed", ["Please select allergen from the list."]);
            return false;
        }
        return true;
    }
    public AssignSelectedReaction() {
        if (typeof (this.reactionSelected) == 'object') {
            this.CurrentAllergy.Reaction = this.reactionSelected.ReactionName;
        }
    }
    public AssignSelectedAllergen() {
        if (typeof (this.allergenSelected) == 'object') {
            this.CurrentAllergy.AllergenAdvRecName = this.allergenSelected.GenericName;
            this.CurrentAllergy.AllergenAdvRecId = this.allergenSelected.GenericId;
            this.showValidationMsg = false;
        }
    }
    public MapSelectedReaction() {
        let reaction = this.reactionList.find(a => a.ReactionName == this.CurrentAllergy.Reaction);
        if (reaction)
            this.reactionSelected = reaction;
    }
    public MapSelectedAllergen() {
        let allergen = this.allergicGenList.find(a => a.GenericId == this.CurrentAllergy.AllergenAdvRecId);
        if (allergen)
            this.allergenSelected = allergen;
    }
}
