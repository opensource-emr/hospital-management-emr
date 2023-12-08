import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ENUM_DanpheHTTPResponses } from '../../shared/shared-enums';
import { DietSheetDTO } from '../shared/dto/diet-sheet.dto';
import { DietTypeDTO } from '../shared/dto/diet-type.dto';
import { NursingBLService } from '../shared/nursing.bl.service';

@Component({
    selector: 'diet-sheet',
    templateUrl: './diet-sheet.component.html',
    styleUrls: ['./diet-sheet.component.css']
})
export class DietSheetComponent implements OnInit {
    public ipdList: Array<DietSheetDTO> = [];
    public DietTypes: DietTypeDTO = new DietTypeDTO();
    public inDataLoaded: boolean = false;
    public showPatientDietHistory: boolean = false;
    public showAddDietPopUp: boolean = false;
    public selectedIpd: any;
    public searchData: string = '';
    public ipdListView: Array<DietSheetDTO> = [];
    public resultCount: number;
    public showDietSheetPrintPage: boolean = false;
    public IsLocalDate: boolean = true;
    public wardName: string = "";
    constructor(
        private nursingBLService: NursingBLService,
        private securityService: SecurityService,
    ) {
        this.GetAllDietTypes();
        this.GetAllInpatientListWithDietDetail();
    }
    ngOnInit() {

    }
    public GetAllDietTypes() {
        this.nursingBLService.GetAllDietTypes().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                res.Results
            }
        })
    }

    public PatientDietHistory(ipd) {
        this.selectedIpd = ipd;
        this.showPatientDietHistory = true;
    }

    public GetAllInpatientListWithDietDetail() {
        let wardId = this.securityService.getActiveWard().WardId;
        this.nursingBLService.GetAllInpatientListWithDietDetail(wardId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
                this.ipdList = res.Results;
                this.resultCount = res.Results.length;
                this.ipdListView = this.ipdList;
                if (this.ipdListView) {
                    this.inDataLoaded = true;
                }
                if (this.ipdList.length > 0) {
                    this.wardName = this.ipdList[0].WardName;
                }
            }
        })
    }

    public HidePatientDietHistory() {
        this.showPatientDietHistory = false;
    }
    public HideAddDietPopUp() {
        this.showAddDietPopUp = false;
        this.GetAllInpatientListWithDietDetail();
    }

    filterTable() {
        if (!this.searchData || this.searchData.trim() === '') {
            this.ipdListView = this.ipdList; // Show all data
        } else {
            const searchTerm = this.searchData.toLowerCase();
            this.ipdListView = this.ipdList.filter(item => {
                return (
                    (item.PatientCode && item.PatientCode.toLowerCase().includes(searchTerm)) ||
                    (item.ShortName && item.ShortName.toLowerCase().includes(searchTerm)) ||
                    (item.Rank && item.Rank.toLowerCase().includes(searchTerm))
                );
            });
        }
    }
    AddNewDietPlan(data) {
        this.selectedIpd = data;
        this.showAddDietPopUp = true;
    }
    ChangeDateFormate() {
        this.IsLocalDate = !this.IsLocalDate
    }

    PrintDietSheet() {
        this.showDietSheetPrintPage = true
    }
    public HidePrintDietSheet() {
        this.showDietSheetPrintPage = false;
        this.GetAllInpatientListWithDietDetail();
    }
}