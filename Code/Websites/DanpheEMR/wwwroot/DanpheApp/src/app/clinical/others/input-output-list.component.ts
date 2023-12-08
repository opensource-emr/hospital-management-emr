import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { VisitService } from '../../appointments/shared/visit.service';
import { SecurityService } from "../../security/shared/security.service";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_IntakeOutputType } from "../../shared/shared-enums";
import { InputOutput } from "../shared/input-output.model";
import { IOAllergyVitalsBLService } from '../shared/io-allergy-vitals.bl.service';


@Component({

    templateUrl: "../../view/clinical-view/InputOutputList.html" //"/ClinicalView/InputOutputList"
})
export class InputOutputListComponent implements OnInit {
    public CurrentInputOutput: InputOutput = new InputOutput();
    public inputoutputLists: Array<InputOutput> = new Array<InputOutput>();
    //last balance is used to calculate the new IO balance.
    public lastBalance: number = 0;
    public updateButton: boolean = false;
    public showIOAddBox: boolean = false;
    public selectedIO: InputOutput = null;
    public selectedIndex: number = null;
    public loading: boolean = false;
    public intakeOutputGridColumns: Array<any> = null;
    public fromDate: string = null;
    public toDate: string = null;
    public patientVisitId: number = null;
    public showInputOutput: boolean = false;

    constructor(public visitService: VisitService,
        public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        private securityService: SecurityService
    ) {
        this.patientVisitId = this.visitService.getGlobal().PatientVisitId;
        var colSettings = new GridColumnSettings(this.securityService);
        this.intakeOutputGridColumns = colSettings.IntakeOutput;
        this.GetPatientInputOutputList();
    }
    ngOnInit() {
        this.showInputOutput = false;
        this.GetPatientInputOutputList();
    }

    //gets the list of IO of selected patient.
    GetPatientInputOutputList(): void {
        let patientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.ioAllergyVitalsBLService.GetPatientInputOutputList(patientVisitId, this.fromDate, this.toDate)
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.inputoutputLists = res.Results.ioList;
                    const ioList = this.inputoutputLists;
                    let balance = 0;
                    ioList.forEach(item => {
                        if (item.IntakeOutputType === ENUM_IntakeOutputType.Intake) {
                            balance += item.IntakeOutputValue;
                            item.Balance = balance;
                        } else if (item.IntakeOutputType === ENUM_IntakeOutputType.Output) {
                            balance = balance - item.IntakeOutputValue;
                            item.Balance = balance;
                        }
                    });
                    balance = 0;
                    this.lastBalance = res.Results.lastBalance;
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

    callbackIoUpdate() {
        this.GetPatientInputOutputList();
    }


    AddNewIO() {
        this.selectedIndex = null;//reset value of selected index.
        this.CurrentInputOutput = new InputOutput();
        this.selectedIO = this.CurrentInputOutput;
        this.showIOAddBox = false;
        this.changeDetector.detectChanges();
        this.showIOAddBox = true;
    }

    // UpdateList() {
    //     this.inputoutputLists = this.inputoutputLists.map(obj => {
    //         if (obj.TotalIntake === 0) {
    //             obj.TotalIntake = null;
    //         }
    //         if (obj.TotalOutput === 0) {
    //             obj.TotalOutput = null;
    //         }
    //         return obj;
    //     });
    // }
    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
    }
}
