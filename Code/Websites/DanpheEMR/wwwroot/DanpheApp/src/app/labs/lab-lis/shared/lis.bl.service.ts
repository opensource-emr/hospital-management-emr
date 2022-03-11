import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';
import { LabLISDLService } from './lis.dl.service';
//import { LabVendorsModel } from '../external-labs/vendors/lab-vendors.model';


@Injectable()
export class LabLISBLService {
    constructor(public labLISDlServ: LabLISDLService) {

    }

    //Get all Master Data
    GetLISMasterData() {
        return this.labLISDlServ.GetAllLISMasterData().
            map(res => { return res });
    }

    //Get all Mapped Data
    GetAllLISMappedData() {
        return this.labLISDlServ.GetAllLISMappedData().
            map(res => { return res });
    }

    //Get all Not Mapped Data by MachineId
    GetAllLISNotMappedDataByMachineId(id: number, selectedMapId: number) {
        return this.labLISDlServ.GetAllLISNotMappedDataByMachineId(id, selectedMapId).
            map(res => { return res });
    }

    GetAllMachinesMaster() {
        return this.labLISDlServ.GetAllMachinesMaster().
            map(res => { return res });
    }

    GetAllMachineResult(machineNumber: number) {
        return this.labLISDlServ.GetAllMachineResult(machineNumber).
            map(res => { return res });
    }

    GetExistingMappingById(id: number) {
        return this.labLISDlServ.GetExistingMappingById(id).
            map(res => { return res });
    }

    AddUpdateLisMapping(model: any) {
        let data = JSON.stringify(model);
        return this.labLISDlServ.AddUpdateLisMapping(data).map((res) => {
            return res;
        });
    }

    AddLisDataToResult(model: any) {
        let data = JSON.stringify(model);
        return this.labLISDlServ.AddLisDataToResult(data).map((res) => {
            return res;
        });
    }

    RemoveLisMapping(id: number) {
        return this.labLISDlServ.RemoveLisMapping(id).map((res) => {
            return res;
        });
    }
}