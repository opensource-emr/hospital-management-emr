import { Component, ChangeDetectorRef } from "@angular/core";
import { VisitBLService } from '../../../appointments/shared/visit.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { FractionCalculationService } from "../../shared/fraction-calculation.service";
import { DesignationService } from '../../shared/Designation.service';
import { BillingTransactionItem } from "../../../billing/shared/billing-transaction-item.model";
import { Router } from "@angular/router";
import { FractionPercentModel } from "../../shared/fraction-percent.model";
import { FractionPercentService } from "../../shared/Fraction-Percent.service";
import { RouteFromService } from '../../../shared/routefrom.service';
import { Department } from "../../../settings-new/shared/department.model";
import { CoreService } from "../../../core/shared/core.service";
import { FractionCalculationModel } from "../../shared/fraction-calculation.model";
import { SecurityService } from "../../../security/shared/security.service";
import * as moment from 'moment/moment';

@Component({
    selector: 'fraction-applicable-list',
    templateUrl: './calculate.component.html',
})
export class CalculateComponent {
    public billTransactionItemId: number = 0;
    public billPriceItemId: number = 0;
    public fractionCalculationList: Array<FractionCalculationModel>= new Array<FractionCalculationModel>();
    public fractionPercent: FractionPercentModel = new FractionPercentModel();
    public billingTransactionItem: BillingTransactionItem = new BillingTransactionItem();
    public doctorAmount: number = 0;
    public hospitalAmount: number = 0;
    public departments: Array<Department>;
    public departmentId: number;
    public designationId: number;
    public IsValidSelProvider: boolean = true;  
    public IsChild: boolean = false;
    public filterList: Array<FractionCalculationModel> = new Array<FractionCalculationModel>();
    public docAlreadyAdded: boolean = false;
    public isValidDesignation = true;
    public designationList: any;
    public loading: boolean= false;
    public doctorList: any = [];
    constructor(
        public fractionCalculationService: FractionCalculationService,
        public securityService: SecurityService,
        public DesignationService: DesignationService,
        public fractionPercentService: FractionPercentService,
        public visitBLService: VisitBLService,
        public routeFromService: RouteFromService,
        public changeDetector: ChangeDetectorRef,
        public coreService: CoreService,
        public msgBoxServ: MessageboxService,
        public router: Router
    ) {
        if (!this.fractionCalculationService.BillTxnId) {
            this.msgBoxServ.showMessage("failed", ["Please select one bill item."]);
            this.router.navigate(['/Fraction/Calculation/ApplicableList']);  
        }
        this.billTransactionItemId = this.fractionCalculationService.BillTxnId;
        this.billPriceItemId = this.fractionCalculationService.BillItemPriceId;
        this.billingTransactionItem = this.fractionCalculationService.BillTransactionItem;
        this.getDesignationList();
        this.getFractionPercentage();
        this.GetDepartments();
        this.GetDoctors();
    }

     public getFractionPercentage() {
        this.fractionPercentService.GetFractionPercentByBillPriceId(this.billPriceItemId)
            .subscribe(res => {
                this.fractionPercent = res.Results;
                let billAmount = this.billingTransactionItem.TotalAmount;
                this.hospitalAmount = this.fractionPercent.HospitalPercent * billAmount / 100;
                this.doctorAmount = this.fractionPercent.DoctorPercent * billAmount / 100;
            });
    }
    Cancel() {
        this.router.navigate(['/Fraction/Calculation/ApplicableList']);
    }
    GetDepartments() {
        this.departments = this.coreService.Masters.Departments;

    }
    AssignSelectedDoctor() {

    }
    FilterDoctorList(index, departmentId) {

        this.fractionCalculationList[index].selectedDoctor = null;
        if (!departmentId) {
            return this.fractionCalculationList[index].filteredDocList = this.doctorList;
        }   
        let docList = this.doctorList.filter(doc => doc.DepartmentId == departmentId);

        this.fractionCalculationList[index].doctorList = (docList && docList.length) ? docList : this.doctorList;
    }


    myListFormatter(data: any): string {
        let html = data["ProviderName"];
        return html;
    }

    GetDoctors() {
        this.visitBLService.GetDoctorOpdPrices()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.doctorList = res.Results;
                    this.AddNewRow(-1);  
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Not able to load doctor's list."]);
                    console.log(res.ErrorMessage);
                }
            });
    }

    getDesignationList() {
        try {
            this.DesignationService.GetDesignationList()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.designationList = res.Results;
                    }
                    else {
                        alert("Failed ! " + res.ErrorMessage);
                        console.log(res.ErrorMessage)
                    }
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    filterBy() {
        //return this.fractionCalculationList.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
        //return this.fractionCalculationList.sort(function (a, b) { return a.IsParentId - b.IsParentId });
        return this.fractionCalculationList.sort((a, b) => {
            if (a.OrderId < b.OrderId) return -1;
            else if (a.OrderId > b.OrderId) return 1;
            else return 0;
        });
    }    

    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
        }
    }

    public AddNewRow(index) {

        let count = this.fractionCalculationList.length + 1;
        let CountForOrder = count;


        let prevParentId: number;
        if (index == -1) {
            index = index + 2;
        } else {
            index = index + 2;
        }


        let fractionCalculation: FractionCalculationModel = new FractionCalculationModel();
        fractionCalculation.doctorList = this.doctorList;
        fractionCalculation.IsParentId = 0;
        fractionCalculation.OrderId = count;
        fractionCalculation.ParentId = count;
        fractionCalculation.CountForOrder = count;
        fractionCalculation.IsChild = false;
        fractionCalculation.IsParent = true;
        this.fractionCalculationList.push(fractionCalculation);
        this.filterBy();
    }

    public AddChildRow(index) {

        
        let CountForOrder;
        let ParentId = this.fractionCalculationList.length + 1;  // to get a unique parent key so that child can get assigned to this key 

        let IsParentId = this.fractionCalculationList[index].ParentId;  // to assign parents for the child


        let fractionCalculation: FractionCalculationModel = new FractionCalculationModel();

        if (this.fractionCalculationList[index].IsChild == false) {
            fractionCalculation.IsChild = true;
            CountForOrder = Math.round((this.fractionCalculationList[index].CountForOrder + 0.1) * 100);
        }
        else {
            fractionCalculation.IsGrandChild = true;
            CountForOrder = Math.round((this.fractionCalculationList[index].CountForOrder + 0.01) * 100);
        }
        CountForOrder = CountForOrder / 100;
        this.fractionCalculationList[index].CountForOrder = CountForOrder;

        let prevParentId = this.fractionCalculationList[index].IsParentId;
        let parentId = this.fractionCalculationList[index].ParentId;

        fractionCalculation.IsParentId = IsParentId;
        fractionCalculation.ParentId = ParentId;
        fractionCalculation.CountForOrder = CountForOrder;
        fractionCalculation.OrderId = CountForOrder;
        fractionCalculation.ParentIndex = index;
        this.fractionCalculationList.push(fractionCalculation);
        this.filterBy();
    }

    getOrderId(index, count, parentId) {
        return String(index) + String(count) + String(parentId);
    }

    onChangeItem($event, index) {

        // to verify if doctor is already added 
        this.fractionCalculationList.forEach(frac => {
            if (frac.DoctorId == $event.ProviderId && $event.ProviderId != 0) {
               
                this.docAlreadyAdded = true;
            }
        });
        if (this.docAlreadyAdded) {
            this.msgBoxServ.showMessage("notice-message", ["Doctor already added."]);
            this.fractionCalculationList[index].selectedDoctor = null;
            //let docList = this.doctorList.filter(doc => doc.DepartmentId == $event.DepartmentId);
            //this.fractionCalculationList[index].doctorList = (docList && docList.length) ? docList : this.doctorList;

            this.docAlreadyAdded = false;
        }
        else {
                this.fractionCalculationList[index].DoctorId = $event.ProviderId;
                this.fractionCalculationList[index].DepartmentId = $event.DepartmentId;
                let docList = this.doctorList.filter(doc => doc.DepartmentId == $event.DepartmentId);
                this.fractionCalculationList[index].doctorList = (docList && docList.length) ? docList : this.doctorList;
            }
    }

    public Save() {

        if (this.fractionCalculationList != null) {
            let CheckIsValid = true;
            let dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

            this.fractionCalculationList.forEach(frac => {
                frac.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                frac.PercentSettingId = this.fractionPercent.PercentSettingId;
                frac.Hierarchy = frac.IsParent ? 1 : frac.IsChild ? 2 : 3;
                frac.CreatedOn = dateTime;
                frac.BillTxnItemId = this.billTransactionItemId;
      
                for (var i in frac.FractionCalculationValidator.controls) {
                    frac.FractionCalculationValidator.controls[i].markAsDirty();
                    frac.FractionCalculationValidator.controls[i].updateValueAndValidity();
                }
                if (frac.IsValid(undefined, undefined) == false) { CheckIsValid = false }
            });
            
            if (CheckIsValid) {
                if(!this.loading){
                    this.loading= true;
                    if (!this.vaildatePercentage()) {
                        this.loading= false;
                        return;
                    };
                    this.fractionCalculationService.AddFractionCalculation(this.fractionCalculationList).subscribe(res => {
                        this.fractionCalculationService.BillTxnId = res.Results;
                        this.router.navigate(['/Fraction/Calculation/CalculateDetails']);
                        this.loading= false;
                    });  
                }
                else{
                    this.loading= false;
                }
               
            }
            else {
                this.msgBoxServ.showMessage("error-message", ['Please enter all the required field']);
            }
        }
        else {
            this.msgBoxServ.showMessage("notice-message", ["Add Item ...Before Requesting"]);
        }        
    }

    public vaildatePercentage() {
        let finalPerSum = 0;

        this.fractionCalculationList.forEach(frac => {
            if (frac.IsParentId == 0) {
                finalPerSum += frac.InitialPercent;          
            }
        });

        if (finalPerSum != 100) {
            this.msgBoxServ.showMessage("notice-message", ["Invalid percentage.. Please check again"]);
            return false;
        }
        return true;
    }

    Calculation(index: number, ParentId: number) {

        if (index >= 0) {

            this.CalculateParentPercent(index);

            if (this.fractionCalculationList[index].IsParentId == 0) {

                let Child = this.fractionCalculationList.filter(x => x.IsParentId == ParentId);

                if (Child) {
                    Child.forEach(ch => {
                        let childIndex = this.fractionCalculationList.findIndex(i => i.ParentId == ch.ParentId);
                        if (childIndex && childIndex >= 0) {
                            this.CalculationForChild(childIndex, index);
                        }
                        //let childIndex = this.fractionCalculationList.findIndex(i => i.ParentId == ch.ParentId);
                        //if (childIndex && ch.IsChild) {
                        //    this.CalculationForChild(childIndex, index);
                        //}
                    });
                }
                this.calculateAmount();
            }
        }    
    }

    CalculateParentPercent(index: number) {
        if (index >= 0) {
            if (this.fractionCalculationList[index].InitialPercent && this.fractionPercent.DoctorPercent) {
                if (this.fractionPercent.HospitalPercent > 0 && this.fractionCalculationList[index].InitialPercent > 0) {
                    let iniPer = this.fractionCalculationList[index].InitialPercent;
                    let hospitalPer = this.fractionPercent.DoctorPercent;
                    var finalpercent = iniPer * hospitalPer / 100;
                    this.fractionCalculationList[index].FinalPercent = finalpercent;
                    var total = finalpercent / 100 * this.billingTransactionItem.TotalAmount;
                    this.fractionCalculationList[index].FinalAmount = total;
                }
            }
        }
    }


    CalculationForChild(index: number, parentIndex: number) {

        let parentDetail = this.fractionCalculationList[parentIndex];
        let childDetail = this.fractionCalculationList[index];
        let doctorPercent = this.fractionPercent.DoctorPercent;

        //alert(isGrandChild);


        let parentInitalPer = parentDetail.InitialPercent;
        let childInitalPer = childDetail.InitialPercent;

        
            var InitialPer = childInitalPer * parentInitalPer / 100;
            var FinalPer = InitialPer * doctorPercent / 100;
            this.fractionCalculationList[index].FinalPercent = FinalPer;
        
            let allChild = this.fractionCalculationList.filter(frac => frac.IsParentId == parentDetail.ParentId);
            let allchildFinalSum = 0;

            allChild.forEach(child => {
                if (child.InitialPercent > 0) {
                    let iniPer = child.InitialPercent * parentInitalPer / 100;
                    allchildFinalSum += iniPer * doctorPercent / 100;

                    let grandChild = this.fractionCalculationList.filter(x => x.IsParentId == childDetail.ParentId);
                    grandChild.forEach(gchild => {
                        let childIndex = this.fractionCalculationList.findIndex(i => i.ParentId == gchild.ParentId);
                        this.CalculationForGrandChild(childIndex, gchild.ParentIndex);                        
                    });
                }
            });

            this.fractionCalculationList[parentIndex].FinalPercent = (parentInitalPer * doctorPercent / 100) - allchildFinalSum;
            this.calculateAmount();
    }

    CalculationForGrandChild(index: number, parentIndex: number) {

        let parentDetail = this.fractionCalculationList[parentIndex];
        let childDetail = this.fractionCalculationList[index];
        let doctorPercent = this.fractionPercent.DoctorPercent;
        
        let parentInitalPer = parentDetail.InitialPercent;
        let childInitalPer = childDetail.InitialPercent;

            let grandParentIndex = parentDetail.ParentIndex;
            let grandParentPer = this.fractionCalculationList[grandParentIndex].InitialPercent;

            var InitialPer = childInitalPer * (parentInitalPer / 100) * (grandParentPer / 100);
            var FinalPer = InitialPer * doctorPercent / 100;

            this.fractionCalculationList[index].FinalPercent = FinalPer;
            let allChild = this.fractionCalculationList.filter(frac => frac.IsParentId == parentDetail.ParentId);

            let allchildFinalSum = 0;

            allChild.forEach(child => {
                if (child.InitialPercent > 0) {
                    let iniPer = child.InitialPercent * (parentInitalPer / 100) * (grandParentPer / 100);
                    allchildFinalSum += iniPer * doctorPercent / 100;
                }
            });

            this.fractionCalculationList[parentIndex].FinalPercent = (parentInitalPer * (grandParentPer / 100) * (doctorPercent / 100)) - allchildFinalSum;
            this.calculateAmount();

    }

    calculateAmount() {
        this.fractionCalculationList.forEach(frac => {
            let finalPer = frac.FinalPercent;
            frac.FinalAmount = Math.round((finalPer * this.billingTransactionItem.TotalAmount / 100) * 100) / 100;
        });
    }

    public DeleteRow(index) {

        let fracList = this.fractionCalculationList[index];
        let IsParentId = fracList.IsParentId;
        this.fractionCalculationList.splice(index, 1);

        let ParentIndex = fracList.ParentIndex;
        //let ParentId = fracList.ParentId;
        //this.fractionCalculationList.forEach(frac => {
        //    if (frac.IsParentId == ParentId) {
               

        //    }
        //});
        this.Calculation(ParentIndex, IsParentId);
    
    }
}

class DoctorParent {
    public isParentId: number;
    public doctorId: number;
}
