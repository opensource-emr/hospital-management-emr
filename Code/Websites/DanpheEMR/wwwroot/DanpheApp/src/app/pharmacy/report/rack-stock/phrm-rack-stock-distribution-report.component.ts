import { Component, OnInit } from '@angular/core';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_StockLocations } from "../../../shared/shared-enums";
import { PhrmRackModel } from '../../shared/rack/phrm-rack.model';
import { PhrmRackService } from '../../shared/rack/phrm-rack.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import * as moment from 'moment';
import PHRMReportsGridColumns from '../../shared/phrm-reports-grid-columns';
import { CoreService } from "../../../core/shared/core.service";
@Component({
    selector: 'phrm-rack-report1',
    templateUrl: './phrm-rack-stock-distribution-report.html'
})

export class PHRMRackStockDistributionReportComponent implements OnInit {
    public selectedRacks: Array<PhrmRackModel> = [];
    public rackIdsString: string; //will be updated only when the report is loaded, so that the export value wont be changed.
    public selectedLocationId: number; //will be updated only when the report is loaded, so that the export value wont be changed.

    public locationId: number = 0; //by default, select dispensary
    public locationList = [];

    public parentRackList: Array<PhrmRackModel> = [];
    public parentRackListFiltered: Array<PhrmRackModel> = [];
    public selectedParentRackId: number;
    public childRackList: Array<PhrmRackModel> = []
    public childRackListFiltered: Array<PhrmRackModel> = []
    public selectedChildRackId: number;
    public PHRMRackStockDistributionReportColumns: any;
    public PHRMRackStockDistributionReportData: any;
    public TotalEvaluation: any;

    constructor(private _pharmacyBLService: PharmacyBLService,
        private _rackService: PhrmRackService,
        private _dlService: DLService,
        private _messageBoxService: MessageboxService,
        public coreService: CoreService) {
        this.GetLocationList();
        this.GetRack();
    }

    ngOnInit() { }

    public GetLocationList() {
        this.locationList = Object.keys(ENUM_StockLocations).filter(p => isNaN(p as any));
    }
    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyRackStockDistributionReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    public GetRack() {
        try {
            this._rackService.GetRackList()
                .subscribe(res => {
                    //if (res.Status == "OK") {
                    var rackList = res;
                    this.parentRackList = rackList.filter(rack => rack.ParentId == null);
                    this.childRackList = rackList.filter(rack => rack.ParentId != null);
                    this.FilterRackBasedOnLocation();
                });
        }
        catch (exception) {
            this._messageBoxService.showMessage("Failed", [exception.split("exception")[0]]);
        }
    }
    public FilterRackBasedOnLocation() {
        this.parentRackListFiltered = this.parentRackList.filter(rack => rack.LocationId == (+this.locationId) + 1);
        this.childRackListFiltered = this.childRackList.filter(rack => rack.LocationId == (+this.locationId) + 1);
        this.selectedParentRackId = null;
        this.selectedChildRackId = null;
        this.selectedRacks = [];
    }
    public SelectAllChildRackByParentId() {
        this.childRackListFiltered.forEach(childRack => {
            if (childRack.ParentId == this.selectedParentRackId) {
                if (this.selectedRacks.every(rack => rack.RackId != this.selectedChildRackId)) {
                    this.selectedRacks.push(childRack);
                }
            }
        });
    }
    public SelectChildRack() {
        if (this.selectedRacks.every(rack => rack.RackId != this.selectedChildRackId)) {
            this.selectedRacks.push(this.childRackListFiltered.find(childRack => childRack.RackId == this.selectedChildRackId));
        }
    }
    public RemoveRack(rackId: number) {
        this.selectedRacks = this.selectedRacks.filter(rack => rack.RackId != rackId);
        this.selectedRacks = this.selectedRacks.slice();
    }

    public LoadRackReport() {
        if (this.selectedRacks) {
            this.TotalEvaluation = null;
            this.PHRMRackStockDistributionReportData = [];
            this.rackIdsString = "";
            this.selectedLocationId = (+this.locationId) + 1;
            var rackIds = this.selectedRacks.forEach(rack => { this.rackIdsString += rack.RackId.toString() + ";"; })
            this._pharmacyBLService.GetRackStockDistributionReport(this.rackIdsString, this.selectedLocationId)
                .subscribe(res => {
                    if (res.Status == 'OK' && res.Results.StockList.length > 0) {
                        ////Assign report Column from GridConstant to PHRMBillingReportColumns
                        this.PHRMRackStockDistributionReportColumns = PHRMReportsGridColumns.PHRMRackStockDistributionReport;
                        ////Assign  Result to PHRMBillingReportData
                        this.PHRMRackStockDistributionReportData = res.Results.StockList;
                        this.PHRMRackStockDistributionReportData = this.PHRMRackStockDistributionReportData.slice();
                        this.TotalEvaluation = res.Results.TotalEvaluation[0];
                        var loadReportToTop = window.setInterval(() => {
                            document.querySelector('#totalValuationCards').scrollIntoView({ behavior: 'smooth' });
                            clearInterval(loadReportToTop);
                        }, 500)
                    }
                    else if (res.Status == 'OK' && res.Results.StockList.length == 0) {
                        this._messageBoxService.showMessage("Failed", ["No Data is Available for Selected Record"]);
                        this.PHRMRackStockDistributionReportData = [];
                    }
                    else {
                        this._messageBoxService.showMessage("Failed", ["Something went wrong..."]);
                        this.PHRMRackStockDistributionReportData = [];
                    }

                }, err => {
                    this._messageBoxService.showMessage("Failed", [err.error.ErrorMessage]);
                    this.PHRMRackStockDistributionReportData = [];
                });
        }
        else {
            this._messageBoxService.showMessage("Notice-Message", ["Please select the rack to see the report."]);
        }
    }
    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        if (this.selectedRacks) {
            this._dlService.ReadExcel(`/PharmacyReport/ExportToExcelPHRMRackStockDistributionReport?RackIds=${this.rackIdsString}&LocationId=${this.selectedLocationId}`)
                .map(res => res)
                .subscribe(data => {
                    let blob = data;
                    let a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "Rack Stock Distribution Report" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                    document.body.appendChild(a);
                    a.click();
                });
        }
    }
    ClearSelectedRack() {
        this.selectedRacks = [];
        this.selectedParentRackId = 0;
        this.selectedChildRackId = 0;
        this.selectedRacks = this.selectedRacks.slice();
    }
}
