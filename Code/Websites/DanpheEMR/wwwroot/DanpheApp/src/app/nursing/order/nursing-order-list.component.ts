import { Component, Input, Output, EventEmitter } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { PatientService } from '../../patients/shared/patient.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { NursingBLService } from "../shared/nursing.bl.service"
import * as moment from 'moment/moment';


@Component({
    selector: 'nursing-order-list',
    templateUrl: "../../view/nursing-view/NursingOrderList.html" // "/NursingView/NursingOrderList"
})
export class NursingOrderListComponent {
    public nursingOrderItems: Array<any>;
    public shortName: string = null;
    constructor(_patientService: PatientService, public router: Router, public msgBoxServ: MessageboxService, public nursingBLService: NursingBLService) {
        
        if (!_patientService.globalPatient.PatientId) {
            this.msgBoxServ.showMessage("error", ['Please select patient first.']);
            this.router.navigate(['Nursing/InPatient']);
        }
        else {
            this.shortName = _patientService.globalPatient.ShortName;
            this.LoadNursingOrderDetail(_patientService.globalPatient.PatientId);
        }
    }
    //Get all Nursing order details from Bill Requisition
    public LoadNursingOrderDetail(patientId: number) {
        this.nursingBLService.GetNursingOrderListByPatientId(patientId)
            .subscribe(
            res => {
                if (res.Status == "OK") {                   
                    this.CallBack(res.Results);                                    
                }
                else {
                    this.msgBoxServ.showMessage("failed", ['Please try again.']);    
                    this.router.navigate(['Nursing/InPatient']);
                }
            });
    }
    public CallBack(res) {
        if (res) {           
            res.forEach(itm => {
                itm.CreatedOn = moment(itm.CreatedOn).format('DD-MM-YYYY hh:mm A');
            });            
            this.nursingOrderItems = res;
            
        }
      
    }
}