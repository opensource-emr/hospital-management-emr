import { Injectable } from '@angular/core';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { OperationTheatreDLService } from './ot.dl.service';
import * as _ from 'lodash';

@Injectable()
export class OperationTheatreBLService {
    constructor(public otDlService: OperationTheatreDLService,
        public patientDLService: PatientsDLService) {

    }

    public GetPatientsWithVisitsInfo(searchTxt) {
        return this.patientDLService.GetPatientsWithVisitsInfo(searchTxt).map(res => { return res; });
    }

    public GetEmployeeList() {
        return this.otDlService.GetEmployeeList().map(res => { return res; });
    }

    public GetICDList() {
        return this.otDlService.GetIcdList().map(res => { return res; });
    }

    public GetAllOTBookingDetails() {
        return this.otDlService.GetAllOTBookingDetails().map(res => { return res; });
    }

    //Post methods
    public PostNewBookingDetails(data) {
        var temp2 = _.omit(data, ['OperationTheatreValidator']);
        var temp1 = _.omit(temp2, ['OtSurgeonList']);
        var temp = _.omit(temp1, ['OtAssistantList']);
        return this.otDlService.PostNewBookingDetails(temp).map(res => { return res; });
    }

    public PutBookingDetails(data) {
        var temp2 = _.omit(data, ['OperationTheatreValidator']);
        var temp1 = _.omit(temp2, ['OtSurgeonList']);
        var temp = _.omit(temp1, ['OtAssistantList']);
        return this.otDlService.PutBookingDetails(temp).map(res => { return res; });
    }
}
