import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { EthnicGroup } from "../../../patients/shared/ethnic-group.model";
import { PatientsBLService } from "../../../patients/shared/patients.bl.service";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";


@Component({
    selector: "select-ethnic-group",
    templateUrl: "./select-ethnic-group.component.html",
})
export class SelectEthnicGroupComponent {

    @Input("lastName")
    public set lName(val) {
        let data = val;
        if (this.lastName !== data) {
            this.lastName = data;
            this.onLastNameChanged();
        }
    }
    public lastName: string = "";

    @Input("disable-select")
    public disableSelect = false;

    @Input("patient-ethnic-group")
    public set patEthnicGroup(val) {
        let data = val;
        if (this.patientEthnicGroup !== data) {
            this.patientEthnicGroup = data;
            this.selectedEthnicGroup = this.patientEthnicGroup;
            this.onEthnicGroupChanged(this.patientEthnicGroup);
        }
    }
    public patientEthnicGroup: string = "";

    public CastEthnicGroupList = new Array<EthnicGroup>();
    public selectedEthnicGroup: string = "";
    public defaultEthnicGroup: string = "Brahmin/Chettri";


    @Output("on-ethnic-group-change")
    public onEthnicGroupChangeCallback = new EventEmitter<object>();
    public GeneralFieldLabel = new GeneralFieldLabels();



    constructor(private patientBlService: PatientsBLService, private msgBoxServ: MessageboxService, public coreService: CoreService,) {
        this.LoadEthnicGroups();
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    }

    // ngOnInit(): void {

    // }

    LoadEthnicGroups(): void {
        this.patientBlService.GetCastEthnicGroupList().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                let temp = [];
                temp = res.Results;
                if (temp.length > 0) {
                    temp.forEach(a => {
                        if (a.CastKeyWords) {
                            a.CastKeyWords = JSON.parse(JSON.stringify(a.CastKeyWords)).split(',');
                        } else {
                            a.CastKeyWords = [];
                        }
                    });
                }
                this.CastEthnicGroupList = temp;
            }
        },
            (err: DanpheHTTPResponse) => {
                this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponses.Failed, ["Couldn't fetch Cast Ethnic Groups"]);
            });
    }

    onLastNameChanged(): void {
        const lastName = this.lastName;
        let tempEthnic: string;
        this.CastEthnicGroupList.forEach(a => {
            if (a.CastKeyWords.length > 0 && a.CastKeyWords.find(b => b.toLowerCase() === lastName.toLowerCase())) {
                tempEthnic = a.EthnicGroup;
                return;
            }
        });

        if (tempEthnic) {
            this.selectedEthnicGroup = tempEthnic;
            tempEthnic = "";
        } else {
            this.selectedEthnicGroup = this.defaultEthnicGroup;
        }
        this.onEthnicGroupChanged(this.selectedEthnicGroup);

    }

    manualChangeOfEthnicGroup($event) {
        if ($event) {
            const ethnicGroup = $event.target.value;
            this.onEthnicGroupChanged(ethnicGroup);
        }
    }

    onEthnicGroupChanged(ethnicGroup: string) {
        if (ethnicGroup) {
            this.onEthnicGroupChangeCallback.emit({ ethnicGroup: ethnicGroup });
        }
    }

}