import { Component, ChangeDetectorRef, Input, EventEmitter, Output } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { PatientService } from "../../../patients/shared/patient.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabsBLService } from "../../shared/labs.bl.service";
import { LabMasterModel, Requisition } from "../../shared/labMasterData.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { LabPendingResultVM } from "../../shared/lab-view.models";
import * as moment from 'moment/moment';
import { LabPatientModel } from "../../shared/lab-patient.model";
import { LabSticker } from "../../shared/lab-sticker.model";
import { LabTestRequisition } from "../../shared/lab-requisition.model";
import { CoreService } from "../../../core/shared/core.service";


@Component({
    selector: 'undo-samplecode',
  templateUrl: "./undo-labsamplecode.html",
  styles: ['.tbl-max{max-height: 350px;}']
})

export class UndoLabSampleCode {
    @Input("showUndoOption")
    public showUndoOption: boolean;

    @Input("requisitionIdList")
    public requisitionIdList: Array<number>;

    @Input("PatientLabInfo")
    public patientinfos: LabSticker = new LabSticker();

    @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();

    public allLabRequisitions: Array<LabTestRequisition> = new Array<LabTestRequisition>();
    public loading: boolean = false;

    constructor(public msgBoxServ: MessageboxService, public coreService: CoreService, public labBLService: LabsBLService) {

    }

    ngOnInit() {
        if (this.requisitionIdList && this.requisitionIdList.length > 0) {
            this.GetAllRequisitionsFromIdList(this.requisitionIdList);
        }
    }

    public GetAllRequisitionsFromIdList(reqIdList: Array<number>) {
        //LabTestRequisition
        this.labBLService.GetLabRequisitionsFromReqIdList(this.requisitionIdList)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allLabRequisitions = res.Results;
                    this.allLabRequisitions.forEach(req => {
                        req["IsSelected"] = true;
                    });
                }
            });
    }

    public UndoSampleCode(allRequisitionList: Array<LabTestRequisition>) {
        var reqIdList: Array<number> = new Array<number>();
        allRequisitionList.forEach(val => {
            if (val["IsSelected"] == true) {
                reqIdList.push(val.RequisitionId);
            }
        });

        if (reqIdList && reqIdList.length > 0) {
            this.labBLService.UndoSampleCode(reqIdList)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.msgBoxServ.showMessage('Success', ["Sample Code Reset Successfully done"]);
                        this.loading = false;
                        this.sendDataBack.emit({ exit: 'exitonsuccess' });
                    }
              });
        }
        else
        {
            this.msgBoxServ.showMessage('Alert', ["Please select atleast one Test!"]);
            this.loading = false;
        }       
        
        
  }

  CloseUndoBox() {
    this.sendDataBack.emit({ exit: 'close' });
  }

}
