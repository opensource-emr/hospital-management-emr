import { Component, ChangeDetectorRef } from "@angular/core";
import { VisitService } from '../../appointments/shared/visit.service';
import { IOAllergyVitalsBLService } from '../shared/io-allergy-vitals.bl.service';
import { InputOutput } from "../shared/input-output.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';


@Component({

    templateUrl: "../../view/clinical-view/InputOutputList.html" //"/ClinicalView/InputOutputList"
})
export class InputOutputListComponent {


    public CurrentInputOutput: InputOutput = new InputOutput();
    public inputoutputLists: Array<InputOutput> = new Array<InputOutput>();
    //last balance is used to calculate the new IO balance.
    public lastBalance: number = 0;
    public updateButton: boolean = false;
    public showIOAddBox: boolean = false;
    public selectedIO: InputOutput = null;
    public selectedIndex: number = null;
    public loading: boolean = false;
    constructor(public visitService: VisitService,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef
    ) {
        this.GetPatientInputOutputList();
    }

    //gets the list of IO of selected patient.
    GetPatientInputOutputList(): void {
        let patientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.ioAllergyVitalsBLService.GetPatientInputOutputList(patientVisitId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.inputoutputLists = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Failed. please check log for details."], res.ErrorMessage);

                }
            });
    }


    Edit(showInputoutput: InputOutput, index: number) {
        this.showIOAddBox = false;
        this.changeDetector.detectChanges();
        this.showIOAddBox = true;
        this.selectedIndex = index;
        this.selectedIO = showInputoutput;
    }

    callbackIoUpdate($event) {
        //this is for Edit.
        if (this.selectedIndex || this.selectedIndex == 0) {
            this.inputoutputLists[this.selectedIndex] = $event.InputOutput;
            this.inputoutputLists = this.inputoutputLists.slice();
        }
        else {//this is for ADD.
            this.inputoutputLists.push($event.InputOutput);
        }
        //   this.UpdateGlobalAllergy()
    }


    AddNewIO() {
        this.selectedIndex = null;//reset value of selected index.
        this.CurrentInputOutput = new InputOutput();
        this.selectedIO = this.CurrentInputOutput;
        this.showIOAddBox = false;
        this.changeDetector.detectChanges();
        this.showIOAddBox = true;
    }


}
