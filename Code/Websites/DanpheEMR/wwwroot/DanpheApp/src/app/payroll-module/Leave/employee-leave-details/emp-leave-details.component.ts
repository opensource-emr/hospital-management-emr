import { Component } from "@angular/core";
import * as moment from 'moment';
import { CoreService } from "../../../core/shared/core.service";
import { PayrollBLService } from "../../Shared/payroll.bl.service";
import { Employee } from  '../../../employee/shared/employee.model'
import { SecurityService } from "../../../security/shared/security.service";
declare var require: any
const jsonToPivotjson = require("json-to-pivot-json"); 
@Component({
    templateUrl:'./emp-leave-details.html'
})
export class EmployeeLeaveComponent{

    public yyyy: number = null;
    public currentYear: any;
    public years: any = [];

    public leaves: Array<any>=new Array<any>();
    public leaveGridColumns:any;
    
    public finalDetails: Array<any>=new Array<any>();

    public leaveData:any;
    public columnDefinitions = [];

    public ShowEmployeeDetails:boolean=false;
    public employeeDetails: Employee = new Employee();
    public employeesyearWiseDetails:any;
    public selectedYear:any;

    public monthwiseData:Array<any>=new Array<any>();
    public CurrEmpId: any;
    public m =['','January','February','March','April','May','June','July','August','September','October','November','December'];
    constructor(public payrollBlServices:PayrollBLService,public _coreService:CoreService,
        public securityService: SecurityService){    
        this.CurrEmpId = this.securityService.GetLoggedInUser().EmployeeId;    
        this.currentYear = moment().startOf("year").format('YYYY');
        this.yyyy = this.currentYear;
        this.getDefaultYears();
        this.LoadLeaveList(this.CurrEmpId);
    }

    getDefaultYears() {
        let backYearToShow = this._coreService.Parameters.find(p => p.ParameterGroupName == "Payroll"
            && p.ParameterName == "PayrollLoadNoOfYears").ParameterValue;
                for (var i = this.currentYear - backYearToShow; i <= this.currentYear; i++) {
                    this.years.push(i);
                }
    }
    LoadLeaveList(currEmp) {    

        this.selectedYear = this.yyyy;
        this.getLeaveRules(this.selectedYear,currEmp)
    }

    getLeaveRules(year,currEmp){
        this.payrollBlServices.GetEmployeeLeaveDetails(year,currEmp)
        .subscribe(res=>{
                this.leaveData=res.Results;

                if(this.leaveData.length>0)
                {                                    
                  var options = {  row: "EmployeeName", column: "CategoryCode", value: "TotalLeave" };      // gives inputs for pivot array.
                  this.leaves = this.jsonToPivotjson(this.leaveData, options);                                   // pivot the results comes from the api.   
                  for(var i=0;i<this.leaveData.length;i++){                                                 // assign emplyeeId for employees for pivoted array.
                    this.leaves.forEach(e=>{
                        if(e.EmployeeName==this.leaveData[i].EmployeeName){
                            if (typeof e === "object" ){
                                e["EmployeeId"] = this.leaveData[i].EmployeeId;
                                }
                        }                       
                    });
                  }                                           
                  this.leaveGridColumns = this.generateColumns(this.leaves);                                // generates dnamic columns from api data and assign it to the grid headers.


                }
               else {
                this.leaveGridColumns = this.generateColumns(this.leaveData);
                this.leaves=new Array<any>();
               }
        });

    }

    ViewEmployeeDetails($event)
    {
        try {
            switch ($event.Action) {
                case "view": {
                    let empId=$event.Data.EmployeeId;
                    this.getEmployee(empId);
        
                }
                break;
                default:
                break;
            }
        }
        catch (exception) {
        
        }
    }

    getEmployee(empId){
        this.payrollBlServices.GetEmployeebyId(empId).subscribe(res=>{
            if(res.Status=="OK"){
                this.employeeDetails=res.Results;  
                this.getEmpwiseDetails(empId,this.selectedYear)          
            }
            })
    }

    getEmpwiseDetails(empId,year){

        this.payrollBlServices.GetEmpEmpwiseLeaveDetails(empId,year).subscribe(res=>{
            if(res.Status=="OK"){
                this.employeesyearWiseDetails=res.Results; 
                this.ShowEmployeeDetails=true;          
            }
            })
    }
    Close(){
        this.ShowEmployeeDetails=false;
        this.employeeDetails=new Employee();
        this.monthwiseData= new Array<any>();
    }

    // generate dynamic columns for grid.
    generateColumns(data: any[]) 
    {    
            data.map(object => {    
                Object.keys(object).map(key => {       
                    if(key!="EmployeeId")   {   
                        let mappedColumn = {
                        headerName: key.toUpperCase(),
                        field: key
                        }    
                        this.columnDefinitions.push(mappedColumn);   
                    }   
                })

            })
            let mappedColumn = {                        
                        headerName: "Actions",
                        field: "",
                        template:
                            `<a danphe-grid-action="view" class="grid-action"><i class="fa fa-eye"></i> View </a>`  
            }
            this.columnDefinitions.push(mappedColumn)  ;
            //Remove duplicate columns
            this.columnDefinitions = this.columnDefinitions.filter((column, index, self) =>
                index === self.findIndex((colAtIndex) => (
                colAtIndex.field === column.field
                ))
            )
            return this.columnDefinitions;
    }

    //pivot json array
    
    jsonToPivotjson1(data,options){

        var crossfilter = require("crossfilter"); 
                        
                var ndx = crossfilter(data); 

                var pivotCol = options.column
                var pivotVal = options.value;
                var pivotRow = options.row; 

                var out = []; 

                var pivotRowDimension = ndx.dimension(d=>{
                    return d[pivotRow]; 
                });

                var pivotColDimension = ndx.dimension(d=>{
                    // if(d[pivotCol]!=null){
                    //     return d[pivotCol];
                    // }
            
                    return (d[pivotCol]!=null) ? d[pivotCol] : (d[pivotCol]=0)
                });

                var totalByPivotRow = pivotRowDimension.group().reduceSum(d=>{ 	
                    if(d[pivotVal]!=null){

                        return d[pivotVal]
                    }	
                });

                var allRecs = totalByPivotRow.all();

                allRecs.forEach(rec=>{
                    
                    pivotRowDimension.filter();
                    pivotRowDimension.filter(rec.key);
                    
                    var totalByPivotCol = pivotColDimension.group().reduceSum(d=>{ 		
                        if(d[pivotVal]!=null){
                            return d[pivotVal]
                        }
                    });

                    var data = totalByPivotCol.all(); 
                    
                    var doc = {}; 
                    
                    doc[pivotRow] = rec.key; 
                    
                    data.forEach(d=>{
                        doc[d.key] = d.value; 
                    });
                    
                    out.push(doc);
                });

                return out;
    }

    jsonToPivotjson(data,options){

                        var crossfilter = require("crossfilter"); 
                        var ndx = crossfilter(data); 

                        var pivotCol = options.column
                        var pivotVal = options.value;
                        var pivotRow = options.row; 

                        var out = []; 

                        var pivotRowDimension = ndx.dimension(d=>{
                            return d[pivotRow];
                        });

                        var pivotColDimension = ndx.dimension(d=>{
                           // return d[pivotCol];
                           if(d[pivotCol] != null ){

                            return  d[pivotCol] 
                           }
                        });

                        var totalByPivotRow = pivotRowDimension.group().reduceSum(d=> { 		
                            return d[pivotVal]
                        });

                        var allRecs = totalByPivotRow.all();

                        allRecs.forEach(rec =>{
                            
                            pivotRowDimension.filter();
                            pivotRowDimension.filter(rec.key);
                            
                            var totalByPivotCol = pivotColDimension.group().reduceSum(d=> { 		
                                return d[pivotVal]
                            });

                            var data = totalByPivotCol.all(); 
                            
                            var doc = {}; 
                            
                            doc[pivotRow] = rec.key; 
                            
                            data.forEach(d=> {
                                doc[d.key] = d.value; 
                            });
                            
                            out.push(doc);
                        });

                        return out;

    }
}