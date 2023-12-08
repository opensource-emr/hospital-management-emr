import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { VisitService } from '../../appointments/shared/visit.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_IntakeOutputType, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { InputOutput } from "../shared/input-output.model";
import { IntakeOutputParameterListModel } from "../shared/intake-output-parameterlist.model";
import { IOAllergyVitalsBLService } from '../shared/io-allergy-vitals.bl.service';


@Component({
    selector: "InputOutput-add",
    templateUrl: "./input-output-add.html"
})
export class InputOutputAddComponent {

    @Input("selected-IO")
    public CurrentInputOutput: InputOutput = new InputOutput();
    //last balance is used to calculate the new IO balance.
    @Input("last-balance")
    public lastBalance: number = 0;
    public updateButton: boolean = false;
    public showIOAddBox: boolean = false;
    public selectedIndex: number = null;
    public loading: boolean = false;
    public isInputOutput: boolean = true;


    @Output("callback-ioupdate")
    public callbackIoUpdate: EventEmitter<Object> = new EventEmitter<Object>();
    public ClinicalIntakeOutputParamList: IntakeOutputParameterListModel[] = [];
    public ClinicalIntakeListForParent: IntakeOutputParameterListModel[] = [];
    public ClinicalOutputListForParent: IntakeOutputParameterListModel[] = [];
    public ClinicalIntakeListForChild: IntakeOutputParameterListModel[] = [];
    public ClinicalOutputListForChild: IntakeOutputParameterListModel[] = [];
    public IsSubIntakeAvilable: boolean = false;
    public IsSubOutputAvilable: boolean = false;
    public SubOutputTypeExist: boolean = false;
    public SubInatkeTypeExist: boolean = false;

    constructor(public visitService: VisitService,
        public changeDetector: ChangeDetectorRef,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public msgBoxServ: MessageboxService) {
        this.GetClinicalIntakeOutputParameterList();
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

    public ClearOutput() {
        this.CurrentInputOutput.IntakeOutputType = null;
        this.CurrentInputOutput.IntakeOutputValue = null;
        this.ClearInputs();
    }

    public ClearIntake() {
        this.CurrentInputOutput.IntakeOutputType = null;
        this.CurrentInputOutput.IntakeOutputValue = null;
        this.ClearInputs();
    }

    public SubmitForm() {
        if (!this.loading) {
            //marking every fields as dirty and checking validity
            // for (var i in this.CurrentInputOutput.InputOutputValidator.controls) {
            //     this.CurrentInputOutput.InputOutputValidator.controls[i].markAsDirty();
            //     this.CurrentInputOutput.InputOutputValidator.controls[i].updateValueAndValidity();
            // }
            // Remove validation for OutputType if isInputOutput is true
            if (this.isInputOutput) {
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputType'].clearValidators();
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputType'].updateValueAndValidity();
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputValue'].clearValidators();
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputValue'].updateValueAndValidity();
            }

            // Remove validation for INtakeType if isInputOutput is false
            if (!this.isInputOutput) {
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputType'].clearValidators();
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputType'].updateValueAndValidity();
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputValue'].clearValidators();
                this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputValue'].updateValueAndValidity();
            }
            //if valid then call the BL service to do put request.
            if (this.CurrentInputOutput.IntakeOutputType && this.CurrentInputOutput.InputOutputParameterMainId && this.CurrentInputOutput.IntakeOutputValue) {
                //calling the BL service for calculating the balance.
                // this.CurrentInputOutput.Balance = this.ioAllergyVitalsBLService.CalculateBalance(this.CurrentInputOutput.TotalIntake,
                // this.CurrentInputOutput.TotalOutput, this.lastBalance)
                // this.loading = true;

                // if(this.isInputOutput){
                //     this.CurrentInputOutput.Balance = this.lastBalance + this.CurrentInputOutput.TotalIntake;
                //     this.loading = true;
                // }

                // if(!this.isInputOutput){
                //     this.CurrentInputOutput.Balance = this.lastBalance - this.CurrentInputOutput.TotalOutput;
                //     this.loading = true;
                // }

                if (this.CurrentInputOutput.InputOutputId) {
                    this.Update();

                }
                else {
                    // if (this.isInputOutput) {
                    //     this.CurrentInputOutput.IntakeOutputType = null;
                    //     this.CurrentInputOutput.IntakeOutputValue = 0;
                    // }
                    // else if (!this.isInputOutput) {
                    //     this.CurrentInputOutput.IntakeOutputType = null;
                    //     this.CurrentInputOutput.IntakeOutputValue = 0;
                    // }
                    this.CurrentInputOutput.Contents = `{"Color":"${this.CurrentInputOutput.Color}","Quality":"${this.CurrentInputOutput.Quality}"}`
                    this.AddInputOutput();
                }
                this.loading = false;
            }
            else {
                this.CurrentInputOutput = new InputOutput();
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["please fill the form!"]);
            }
        }
    }

    AddInputOutput() {
        if (this.SubInatkeTypeExist) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`Please Select Sub Intake Type`]);
            return;
        }
        else if (this.SubOutputTypeExist) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`Please Select Sub Output Type`]);
            return;
        }

        this.CurrentInputOutput.PatientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.ioAllergyVitalsBLService.PostInputOutput(this.CurrentInputOutput)
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.loading = false;
                    this.ClearInputs();
                    this.CallBackAddInputOutput(res.Results);
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Added Successfully"]);
                    this.Initialize();
                    this.lastBalance = res.Results.Balance;
                }
            },

                err => { this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err]); });
    }


    public Update() {
        this.ioAllergyVitalsBLService.PutInputOutput(this.CurrentInputOutput)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.loading = false;
                        this.CallBackAddInputOutput(res.Results);
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["updated successfully"]);
                        this.Initialize();


                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed. please check log for details."], res.ErrorMessage);

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


    GetClinicalIntakeOutputParameterList() {
        this.ioAllergyVitalsBLService.GetClinicalIntakeOutputParameterList()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.ClinicalIntakeOutputParamList = res.Results;
                    this.ClinicalIntakeListForParent = this.ClinicalIntakeOutputParamList.filter(a => a.ParameterMainId == -1 && a.ParameterType === ENUM_IntakeOutputType.Intake);
                    this.ClinicalIntakeListForChild = this.ClinicalIntakeOutputParamList.filter(a => a.ParameterMainId !== -1 && a.ParameterType === ENUM_IntakeOutputType.Intake);
                    this.ClinicalOutputListForParent = this.ClinicalIntakeOutputParamList.filter(a => a.ParameterMainId == -1 && a.ParameterType === ENUM_IntakeOutputType.Output);
                    this.ClinicalOutputListForChild = this.ClinicalIntakeOutputParamList.filter(a => a.ParameterMainId !== -1 && a.ParameterType === ENUM_IntakeOutputType.Output);
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Data"], res.ErrorMessage);
                }
            });
    }

    ClearInputs() //This method is used to clear IntakeType and OutputType while switching from IntakeType to OutputType and vice versa
    {
        this.IsSubIntakeAvilable = false;
        this.IsSubOutputAvilable = false;
        this.SubOutputTypeExist = false;
        this.SubInatkeTypeExist = false;
        this.CurrentInputOutput.InputOutputValidator.controls['IntakeOutputType'].setValue(null);
    }

    AssignSelectedIntakeType($event) {
        if ($event) {
            const intakeOutputId = +$event.target.value;
            this.CurrentInputOutput.InputOutputParameterMainId = intakeOutputId;
            const selectedIntakeType = this.ClinicalIntakeOutputParamList.find(a => a.IntakeOutputId === intakeOutputId);
            this.CurrentInputOutput.IntakeOutputType = selectedIntakeType.ParameterType;
            const filteredSubIntake = this.ClinicalIntakeOutputParamList.filter(a => a.ParameterMainId === intakeOutputId);
            if (filteredSubIntake && filteredSubIntake.length > 0) {
                this.IsSubIntakeAvilable = true;
                this.SubInatkeTypeExist = true;
                this.ClinicalIntakeListForChild = filteredSubIntake;
            }
            else {
                this.ClinicalIntakeListForChild = [];
                this.IsSubIntakeAvilable = false;
                this.SubInatkeTypeExist = false;
            }
        }
    }

    AssignSelectedSubIntakeType($event) {
        if ($event) {
            const intakeOutputId = +$event.target.value;
            this.CurrentInputOutput.InputOutputParameterChildId = intakeOutputId;
            const selectedSubIntakeType = this.ClinicalIntakeOutputParamList.find(a => a.IntakeOutputId === intakeOutputId);
            this.CurrentInputOutput.IntakeOutputType = selectedSubIntakeType.ParameterType;
            this.SubInatkeTypeExist = false;
        }
    }
    AssignSelectedOutputType($event) {
        if ($event) {
            const intakeOutputId = +$event.target.value;
            this.CurrentInputOutput.InputOutputParameterMainId = intakeOutputId;
            const selectedOutputType = this.ClinicalIntakeOutputParamList.find(a => a.IntakeOutputId === intakeOutputId);
            this.CurrentInputOutput.IntakeOutputType = selectedOutputType.ParameterType;
            const filteredSubOutput = this.ClinicalIntakeOutputParamList.filter(a => a.ParameterMainId === intakeOutputId);
            if (filteredSubOutput && filteredSubOutput.length > 0) {
                this.IsSubOutputAvilable = true;
                this.SubOutputTypeExist = true;
                this.ClinicalOutputListForChild = filteredSubOutput;
            }
            else {
                this.ClinicalOutputListForChild = [];
                this.IsSubOutputAvilable = false;
                this.SubOutputTypeExist = false;
            }
        }
    }
    AssignSelectedSubOutputType($event) {
        if ($event) {
            const intakeOutputId = +$event.target.value;
            this.CurrentInputOutput.InputOutputParameterChildId = intakeOutputId;
            const selectedSubOutPutType = this.ClinicalIntakeOutputParamList.find(a => a.IntakeOutputId === intakeOutputId);
            this.CurrentInputOutput.IntakeOutputType = selectedSubOutPutType.ParameterType;
            this.SubOutputTypeExist = false;
        }
    }
}
