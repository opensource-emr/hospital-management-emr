import {
    Component, Input,
    ChangeDetectorRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabToLisComponentMap, LabToLisComponentMapTemp } from '../shared/lis-comp-mapping.model';
import { LabLISBLService } from '../shared/lis.bl.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
    selector: "lis-map-add",
    templateUrl: "./lis-mapping-add.html",
    styles: ['.inlie-block{display: inline-block} .bg-yell{background: #ffc749}']
})

export class LISMappingAddComponent {
    public allMasterData: Array<any>;
    public allMasterDataFiltered: Array<any>;
    public allMachineMasterData: Array<any>;
    public selectedMachineId: number = 0;
    public previousMachineId: number = 0;
    public isEdit: boolean;
    public loading: boolean;
    public showAddForm: boolean;
    public showMachineChangeAlert: boolean;
    public notMappedDataListRequest: any;
    public notMappedDataList: Array<any> = new Array<any>();

    @Input("selectedMapId") selectedMapId: number;

    @Output("callback-AddUpdate") sendDataBack: EventEmitter<object> = new EventEmitter<object>();

    public existingMapping: any;

    public compMappingArrayTemp: Array<LabToLisComponentMapTemp> = new Array<LabToLisComponentMapTemp>();

    constructor(public coreService: CoreService, public securityService: SecurityService, public labLISBlService: LabLISBLService,
        public messageService: MessageboxService, public changeDetector: ChangeDetectorRef) {

    }

    ngOnInit() {
        if (this.selectedMapId && (this.selectedMapId > 0)) {
            this.isEdit = true;
            this.showAddForm = false;
            this.GetExistingMappingById();
            //set showForm To true only after data is rendered
        }
        else {
            this.GetAllMasterData();
            this.isEdit = false;
            this.compMappingArrayTemp.push(new LabToLisComponentMapTemp());
        }
    }

    public GetExistingMappingById() {
        let GetAllMasterData = this.labLISBlService.GetLISMasterData();
        let GetExistingMapping = this.labLISBlService.GetExistingMappingById(this.selectedMapId);
        forkJoin([GetAllMasterData, GetExistingMapping]).subscribe(res => {
            if (res[1].Status == "OK") {
                this.existingMapping = res[1].Results;
                if (res[0].Status == "OK") {
                    this.InitializeLISMasterData(res[0].Results);
                }
            }
        }, (err) => { console.log(err.error.ErrorMessage); this.loading = false; this.messageService.showMessage('error', ['Could not get componen Data. Please try again later.']); });
    }

    public GetAllMasterData() {
        this.loading = true;
        this.labLISBlService.GetLISMasterData().subscribe(res => {
            if (res.Status == "OK") {
                this.InitializeLISMasterData(res.Results);
            }
        }, (err) => { console.log(err.error.ErrorMessage); this.loading = false; this.messageService.showMessage('error', ['Could not get component Data. Please try again later.']); });
    }

    public InitializeLISMasterData(result: any) {
        this.allMasterData = result.LISComponentList;
        this.allMachineMasterData = result.LISMachineMasterList;
        //if there is only 1 machine
        if ((this.allMachineMasterData && (this.allMachineMasterData.length == 1)) || this.isEdit) {
            if(this.isEdit){
               this.allMachineMasterData = this.allMachineMasterData.filter(a=>a.MachineId == this.existingMapping.MachineId);
            }
            this.selectedMachineId = this.allMachineMasterData[0].MachineId;
            this.previousMachineId = this.allMachineMasterData[0].MachineId;
            this.allMasterDataFiltered = this.allMasterData.filter(v => v.MachineId == this.selectedMachineId);
            this.coreService.FocusInputById("ddlDphComp0", 100);
            this.GetAllLISNotMappedDataByMachineId();
        }
        else {
            this.loading = false;
            this.coreService.FocusInputById("ddlMachineSelection", 100);
        }
    }

    public GetAllLISNotMappedDataByMachineId() {
        this.loading = true;
        this.showAddForm = false;
        this.notMappedDataListRequest = this.labLISBlService.GetAllLISNotMappedDataByMachineId(this.selectedMachineId, this.selectedMapId).subscribe(res => {
            if (res.Status == "OK") {
                this.notMappedDataList = res.Results;

                if (this.isEdit) {
                    this.compMappingArrayTemp = [];
                    let renderedData = new LabToLisComponentMapTemp();
                    renderedData.IsDuplicate = false;
                    renderedData.IsValidComponent = true;
                    renderedData.IsValidLISComponent = true;
                    renderedData.ConversionFactor = this.existingMapping.ConversionFactor;
                    renderedData.DanpheComponent = this.notMappedDataList.find(d => d.ComponentId == this.existingMapping.ComponentId);
                    renderedData.LISComponent = this.allMasterData.find(d => d.LISComponentMasterId == this.existingMapping.LISComponentId);
                    this.compMappingArrayTemp.push(renderedData);
                }

                this.showAddForm = true;
                this.loading = false;
            }
        }, (err) => { console.log(err.error.ErrorMessage); this.loading = false; this.messageService.showMessage('error', ['Could not load Components now']); });
    }


    Save() {
        let isDataValid = true;
        //get those rows that have either Danphe Component or LIS Component or both
        this.compMappingArrayTemp = this.compMappingArrayTemp.filter(d => (d.DanpheComponent && d.DanpheComponent.ComponentId) || (d.LISComponent && d.LISComponent.LISComponentMasterId));
        //if there is not such row i.e.all rows have empty field, then, remove all and add fresh new row
        if (!this.compMappingArrayTemp.length) {
            isDataValid = false;
            this.AddNewMappingRow();
        }

        this.compMappingArrayTemp.forEach(d => {
            if (d.ConversionFactor == 0) {
                this.loading = false;
                this.messageService.showMessage('error', ['Conversion factor can never be 0.']);
                isDataValid = false;
                return;
            }
            let validComp = d.DanpheComponent && (typeof d.DanpheComponent == "object") && d.DanpheComponent.ComponentId;
            let validLisComp = d.LISComponent && (typeof d.LISComponent == "object") && d.LISComponent.LISComponentMasterId;
            if (((!validComp && validLisComp) || (!validLisComp && validComp)) || ((this.compMappingArrayTemp.length == 1) && (!validComp && !validLisComp))) {
                isDataValid = false;
                d.IsValidComponent = validComp;
                d.IsValidLISComponent = validLisComp;
            }
        });

        if (isDataValid) {
            let data = this.compMappingArrayTemp.filter(d => d.IsValidComponent && d.IsValidLISComponent).map(dt => {
                let newObj = new LabToLisComponentMap();
                if (this.isEdit) { newObj.LISComponentMapId = this.selectedMapId; }
                newObj.ComponentId = dt.DanpheComponent.ComponentId;
                newObj.LISComponentId = dt.LISComponent.LISComponentMasterId;
                newObj.ConversionFactor = dt.ConversionFactor;
                newObj.MachineId = this.selectedMachineId;
                return newObj;
            });

            this.AddUpdateData(data);
        }
        else{
            this.loading = false;
        }
    }

    public AddUpdateData(data: any) {
        this.labLISBlService.AddUpdateLisMapping(data).subscribe(res => {
            if (res.Status == "OK") {
                this.sendDataBack.emit({ exit: true, dataUpdated: true });
                this.messageService.showMessage('success', ['Mapping Successfully Saved']);
                this.loading = false;
            }
        }, (err) => { console.log(err.error.ErrorMessage); this.loading = false; this.messageService.showMessage('error', ['Mapping could not be saved now']); });

    }

    public CheckDuplicationAndUpdateFlag() {
        //checking for duplicate entry and updating duplicate flag
        let mappedElem = {};
        let allDupIds = [];
        this.compMappingArrayTemp.forEach(v => {
            if (v.DanpheComponent && (typeof (v.DanpheComponent) == 'object') && v.DanpheComponent.ComponentId) {
                if (v.DanpheComponent.ComponentId in mappedElem) {
                    mappedElem[v.DanpheComponent.ComponentId]++;
                } else { mappedElem[v.DanpheComponent.ComponentId] = 1; }
            }
        });
        for (var prop in mappedElem) {
            if (mappedElem[prop] > 1) { allDupIds.push(+prop); }
        }
        this.compMappingArrayTemp.forEach(m => {
            m.IsDuplicate = false;
            if (m.DanpheComponent && allDupIds.includes(m.DanpheComponent.ComponentId)) {
                m.IsDuplicate = true;
            }
        });
    }


    public MachineChanged() {
        let allValidCompMap = this.compMappingArrayTemp.filter(c => c.DanpheComponent && c.LISComponent && c.DanpheComponent.ComponentId && c.LISComponent.LISComponentMasterId);
        //if any mapping is inserted
        if (this.compMappingArrayTemp && allValidCompMap && allValidCompMap.length > 1) {
            this.showMachineChangeAlert = true;
        } else {
            this.ProceedWithMachineChange();
        }
    }

    public ProceedWithMachineChange() {
        this.previousMachineId = this.selectedMachineId;
        if (this.notMappedDataListRequest) {
            this.notMappedDataListRequest.unsubscribe()
        }
        if (!this.isEdit) {
            this.GetAllLISNotMappedDataByMachineId();
        }
        this.allMasterDataFiltered = this.allMasterData.filter(v => v.MachineId == this.selectedMachineId);
        this.compMappingArrayTemp = [];
        this.compMappingArrayTemp.push(new LabToLisComponentMapTemp());
        this.showMachineChangeAlert = false;
    }

    CancelMachineChange() {
        this.selectedMachineId = this.previousMachineId;
        this.changeDetector.detectChanges();
        this.showMachineChangeAlert = false;
    }

    public ComponentSelected(ind: number, type: string) {
        if (type == 'dph') {
            this.compMappingArrayTemp[ind].IsValidComponent = true;
            this.CheckDuplicationAndUpdateFlag();
        } else if (type == 'lis') {
            this.compMappingArrayTemp[ind].IsValidLISComponent = true;
        }
    }

    public AddNewMappingRow() {
        this.compMappingArrayTemp.push(new LabToLisComponentMapTemp());
    }

    public RemoveCurrentMappingRow(ind: number) {
        this.compMappingArrayTemp.splice(ind, 1).slice();
        this.CheckDuplicationAndUpdateFlag();
    }

    public Cancel() {
        this.sendDataBack.emit({ exit: true, dataUpdated: false });
    }

    public moveCursorToFirstItemOfNextRow(i: number) {
        i++;
        //if last then add new row else move cursor to next
        if (this.compMappingArrayTemp.length == i) {
            this.AddNewMappingRow();
        }
        this.coreService.FocusInputById("ddlDphComp" + i, 100);
    }

    public ComponentListFormatter(data: any): string {
        let html = data["ComponentName"] + " / " + data["DisplayName"];
        return html;
    }

    public LisComponentListFormatter(data: any): string {
        let html = data["ComponentName"] + " / " + data["ComponentDisplayName"];
        return html;
    }

}
