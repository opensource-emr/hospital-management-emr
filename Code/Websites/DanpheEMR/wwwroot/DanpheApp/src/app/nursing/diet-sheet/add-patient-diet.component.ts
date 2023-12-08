import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { DietType } from '../shared/diet-type.model';
import { DietTypeDTO } from '../shared/dto/diet-type.dto';
import { NursingBLService } from '../shared/nursing.bl.service';

@Component({
    selector: 'add-patient-diet',
    templateUrl: './add-patient-diet.component.html',
})
export class AddPatientDietComponent implements OnInit {
    public dietTypes: Array<DietTypeDTO> = [];
    public diet: DietType = new DietType();
    public selectedDietType: DietTypeDTO = new DietTypeDTO();
    @Input('selected-ipd') selectedIpd: any;

    @Output()
    public hideAddDietPage: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input('showAddDietPopUp')
    public showAddDietPopUp: boolean = false;

    // public showAddDietUpPage:boolean=false;

    constructor(
        private nursingBLService: NursingBLService,
        private securityService: SecurityService,
        private messageBoxService: MessageboxService
    ) {
        this.GetAllDietTypes();


    }
    ngOnInit() {
    }

    public CloseAddDietPopUp() {
        this.showAddDietPopUp = false;
        this.hideAddDietPage.emit();

    }
    public GetAllDietTypes() {
        this.nursingBLService.GetAllDietTypes().subscribe((res: DanpheHTTPResponse) => {

            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.dietTypes = res.Results
            }
        })
    }
    public DietTypeFormatter(data: any): string {
        let html = data["DietTypeName"]
        return html;
    }
    public SelectDietType() {
        this.diet.DietTypeId = this.selectedDietType.DietTypeId
    }
    public AddPatientDietType() {
        this.diet.PatientId = this.selectedIpd.PatientId;
        this.diet.PatientVisitId = this.selectedIpd.PatientVisitId;
        this.diet.CreatedOn = moment().format("YYYY-MM-DD HH:mm a");
        this.diet.RecordedOn = moment().format("YYYY-MM-DD HH:mm a");
        this.diet.IsActive = true;
        this.diet.WardId = this.selectedIpd.WardId;
        this.diet.CreatedBy = this.securityService.GetLoggedInUser().UserId;
        if (this.diet.DietTypeId !== null) {
            this.nursingBLService.AddPatientDietType(this.diet).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Patient new Diet Added Successfully"]);
                    this.CloseAddDietPopUp();
                }
            });
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Please Select DietTpe"]);
        }
    }
}
