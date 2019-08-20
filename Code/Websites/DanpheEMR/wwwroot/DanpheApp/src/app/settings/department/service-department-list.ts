
import { Component, ChangeDetectorRef } from "@angular/core";

import { ServiceDepartment } from '../shared/service-department.model';
import { SettingsBLService } from '../shared/settings.bl.service';

import { SettingsService } from '../shared/settings-service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';

@Component({
    selector: 'service-department-list',
    templateUrl: './service-department-list.html',
})
    //testing 
export class ServiceDepartmentListComponent {
    public serviceDepartmentList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
    public showServDeptList: boolean = false;
    public servDeptGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedServDepartment: ServiceDepartment;
    public index: number;

    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef) {
        this.servDeptGridColumns = this.settingsServ.settingsGridCols.ServDeptList;
        this.getSrvDeptList();
    }
    public getSrvDeptList() {
        this.settingsBLService.GetServiceDepartments()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.serviceDepartmentList = res.Results;
                    this.showServDeptList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    ServDeptGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedServDepartment = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedServDepartment = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddServDepartment() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.serviceDepartmentList.push($event.servDepartment);
        if (this.index != null)
            this.serviceDepartmentList.splice(this.index, 1);
        this.serviceDepartmentList = this.serviceDepartmentList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedServDepartment = null;
        this.index = null;
        this.getSrvDeptList();
    }


}
