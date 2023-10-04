import { Component } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabsBLService } from "../../shared/labs.bl.service";

@Component({
    selector: 'imu-upload',
    templateUrl: 'imu-upload.html'
})
export class LabImuUploadComponent {
    public fromDate : any;
    public toDate : any;
    public IMUDataList : any;
    public FilteredIMUDataList : any;
    public searchString: string = null;
    public page: number = 1;
    public loading : boolean = false;
    public initialLoad : boolean = true;
    public selectedRequisition = [];
    public SelectAll : boolean = false;
    public RadioPedingList : boolean = true;
    constructor(public labBlService : LabsBLService,public msgBoxService : MessageboxService,
        public coreService : CoreService){

    }
    ngOnInit(){

    }

    GetAllIMUData(){
        this.IMUDataList = [];
        this.FilteredIMUDataList = [];
        this.labBlService.GetAllIMUData(this.fromDate,this.toDate)
        .subscribe((res) =>{
            if(res.Status == "OK" && res.Results){
                this.initialLoad = false;
                this.IMUDataList = res.Results;
                this.IMUDataList.forEach(element => {
                    element.IsSelected = false;
                });
                this.selectedRequisition = [];
                this.SelectAll = false;
                let selectedId = Array.from(document.getElementsByName("TestRadioFinding")).filter(x=>x['checked']);
                if(selectedId[0].id == "test_pending"){
                    this.FilteredIMUDataList = Object.assign([],this.IMUDataList.filter(a =>a.IsFileUploaded == false));
                }
                else if(selectedId[0].id == "test_completed"){
                    this.FilteredIMUDataList = Object.assign([],this.IMUDataList.filter(a =>a.IsFileUploaded == true));
                }
                else{
                    this.FilteredIMUDataList = Object.assign([],this.IMUDataList);
                }
            }
        },
        (err) =>{
            this.msgBoxService.showMessage("error",[err.ErrorMessage]);
        },
        () =>{
            this.loading = false;
        });
    }

    OnFromToDateChange($event){
        if($event){
            this.fromDate = $event.fromDate;
            this.toDate = $event.toDate;
            if(this.initialLoad && this.fromDate && this.toDate){
                this.GetAllIMUData();
            }
        }
    }

    OnTestFiltersChanged($event) {
        let ActiveFilteredList = [];
        this.selectedRequisition = [];
        this.SelectAll = false;
        this.IMUDataList.map(a => a.IsSelected = false);
        let value = $event.target.id;
        if (this.IMUDataList && this.IMUDataList.length > 0) {
            if(value == 'test_pending' ){
                ActiveFilteredList = this.IMUDataList.filter(a =>a.IsFileUploaded == false);
            }
            else if (value == 'test_completed'){
                ActiveFilteredList = this.IMUDataList.filter(a => a.IsFileUploaded == true);
            }
            else{
                ActiveFilteredList = this.IMUDataList;
            }
            this.FilteredIMUDataList = ActiveFilteredList;
        }
    }

    SelectAllData(){
        this.selectedRequisition = [];
        if(this.SelectAll){
            this.FilteredIMUDataList.slice(0, 10).forEach(element => {
                element.IsSelected = true;
                if(element.IsFileUploaded == false)
                this.selectedRequisition.push(element.RequisitionId);
            });
        }
        else{
            this.FilteredIMUDataList.slice(0, 10).forEach(element => {
                element.IsSelected = false;
            });
        }
    }

    TestSelected(data){
        let ind = this.selectedRequisition.findIndex(a => a == data.RequisitionId);
        if (ind >= 0){
            this.selectedRequisition.splice(ind, 1);
            this.SelectAll = false
        }
        if(data.IsSelected){
            if(data.IsFileUploaded == false)
            this.selectedRequisition.push(data.RequisitionId);
            if(this.FilteredIMUDataList.every(a => a.IsSelected == true)){
                this.SelectAll = true;
            }
        }
    }

    PostDataToIMU(){
        if(this.selectedRequisition.length <= 0){
            this.msgBoxService.showMessage("notice",["Please select at least one record to uplaod."]);
            return 0;
        }
        this.coreService.loading = true;
        this.labBlService.PostDataToIMU(this.selectedRequisition)
        .subscribe((res)=>{
            if(res.Status = "OK"){
                this.msgBoxService.showMessage("success",[res.Results]);
                this.GetAllIMUData();
            }
        },
        (err) =>{
            this.msgBoxService.showMessage("error",[err.error.ErrorMessage]);
        },
        ()=>{
            this.selectedRequisition = [];
            this.coreService.loading = false;
        });
    }
}