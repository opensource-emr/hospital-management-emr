import { Input,Output,EventEmitter, Component, ChangeDetectorRef } from "@angular/core";
import { VisitService } from '../../appointments/shared/visit.service';
import { IOAllergyVitalsBLService } from '../shared/io-allergy-vitals.bl.service';
import { InputOutput } from "../shared/input-output.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';


@Component({
    selector: "InputOutput-add",
    templateUrl: "./input-output-add.html"
})
export class InputOutputAddComponent {

    @Input("selected-IO")
    public CurrentInputOutput: InputOutput = new InputOutput();
    //last balance is used to calculate the new IO balance.
    public lastBalance: number = 0;
    public updateButton: boolean = false;
    public showIOAddBox: boolean = false;
    public selectedIndex: number = null;
    public loading: boolean = false;


    @Output("callback-ioupdate")
    public callbackIoUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public visitService: VisitService,
        public changeDetector: ChangeDetectorRef,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public msgBoxServ: MessageboxService) {
    }

    @Input("showIOAddBox")
    public set viewpage(_viewpage: boolean) {
        if (_viewpage && this.CurrentInputOutput) {
            if (this.CurrentInputOutput.InputOutputId) {
                //var showinputoutput = new InputOutput();
                //showinputoutput = Object.assign(showinputoutput, this.CurrentInputOutput);
                this.CurrentInputOutput = Object.assign(new InputOutput(), this.CurrentInputOutput);

            }
            else {
                this.Initialize();
            }
        }

        this.showIOAddBox = _viewpage;
    }

    public Initialize() {
        this.CurrentInputOutput = new InputOutput();
    }

    public SubmitForm() {
        if (!this.loading) {
            //marking every fields as dirty and checking validity
            for (var i in this.CurrentInputOutput.InputOutputValidator.controls) {
                this.CurrentInputOutput.InputOutputValidator.controls[i].markAsDirty();
                this.CurrentInputOutput.InputOutputValidator.controls[i].updateValueAndValidity();
            }
            //if valid then call the BL service to do put request.
            if (this.CurrentInputOutput.IsValidCheck(undefined, undefined) == true) {
                //calling the BL service for calculating the balance.
                this.CurrentInputOutput.Balance = this.ioAllergyVitalsBLService.CalculateBalance(this.CurrentInputOutput.TotalIntake,
                    this.CurrentInputOutput.TotalOutput, this.lastBalance)
                    this.loading = true;


                if (this.CurrentInputOutput.InputOutputId) {
                    this.Update();

                }
                else {
                    this.AddInputOutput();
                }
            }
            else {
                this.msgBoxServ.showMessage("error",["please fill the form!"]);
            }
        }
    }


    AddInputOutput() {
        this.CurrentInputOutput.PatientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.ioAllergyVitalsBLService.PostInputOutput(this.CurrentInputOutput)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.loading = false;
                    this.CallBackAddInputOutput(res.Results);
                    this.msgBoxServ.showMessage("success", ["Added Successfully"]);
                    this.Initialize();
                }
                    },
                
                err => { this.msgBoxServ.showMessage("error", [err]); });
    }


    public Update() {
        this.ioAllergyVitalsBLService.PutInputOutput(this.CurrentInputOutput)
            .subscribe(
               res => {
                   if (res.Status == "OK") {
                       this.loading = false;
                       this.CallBackAddInputOutput(res.Results);
                       this.msgBoxServ.showMessage("success", ["updated successfully"]);
                       this.Initialize();


                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Failed. please check log for details."], res.ErrorMessage);

                    }
                });
    }



    //call back function of post IO.
    CallBackAddInputOutput(_inputoutput) {
            this.CurrentInputOutput = new InputOutput();
            this.callbackIoUpdate.emit({ "InputOutput": _inputoutput });
    }

    public close() {
        this.showIOAddBox = false;
    }
    
}
    


