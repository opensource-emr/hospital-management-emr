import { Component, Input, Output, EventEmitter } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from "@angular/router";
import * as moment from "moment/moment";
import { LabsBLService } from "../labs.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { Department } from "../../../settings-new/shared/department.model";
import { Employee } from "../../../employee/shared/employee.model";

@Component({
  selector: "danphe-signatories",
  templateUrl: "./signatories.html",
})
export class SignatoriesComponent {
  public allEmployees: Array<any> = []; //changed
  public allEmpsFormatted: Array<any> = [];

  public selEmployees: Array<any> = []; //this is binded as ngModel to ng2-multiselect component.
  public selEmployeesFormatted: Array<any> = [];

  public returnList = []; //not sure if we need this or not.

  @Input("displayMode")
  public displayMode = "edit"; //this will be either: view or edit.

  @Input("departmentName")
  public departmentName: string; //changed
  //ashim: 06Sep2018 displaying default signatoire in lab
  @Input("defaultEmployeeIdList")
  public defaultEmployeeIdList: Array<number>;

  @Input("showDefaultEmpSig")
  public showDefaultEmpSig: boolean = false;
  constructor(
    public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public http: HttpClient
  ) {
    this.defaultEmployeeIdList = null;
  }

  //move these to bl/dl services if required.
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };

  @Input()
  ngModel() {
    return this.returnList;
  }

  @Output()
  ngModelChange = new EventEmitter<any>();

  LoadEmployees() {
    this.http
      .get<any>(
        "/api/Master?type=signatories&departmentName=" + this.departmentName,
        this.options
      )
      .map((res) => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Results) {
          this.allEmployees = res.Results;
          this.allEmployees.sort(function (a, b) {
            return a.DisplaySequence - b.DisplaySequence;
          });
          this.allEmpsFormatted = this.allEmployees.map((emp) => {
            return {
              id: emp.EmployeeId,
              itemName: emp.FullName,
              SignatoryImageName: emp.SignatoryImageName,
              DisplaySequence: emp.DisplaySequence ? emp.DisplaySequence : 1000,
              Show: false,
            };
          });

          if (this.ngModel) {
            this.selEmployees = this.SetItems(this.ngModel);
          }
          //ashim: 06Sep2018 displaying default signatoire in lab
          else if (
            this.defaultEmployeeIdList &&
            this.defaultEmployeeIdList.length
          ) {
            this.selEmployees = [];
            this.defaultEmployeeIdList.forEach((empId) => {
              let emp = this.allEmpsFormatted.find((itm) => itm.id == empId);
              if (emp) {
                this.selEmployees.push(emp);
              }
            });
            this.onItemSelect(this.selEmployees);
          }
        }
      });
  }

  public dropdownSettings: any;
  ngOnInit() {
    //console.log("displaymode:" + this.displayMode);

    this.LoadEmployees();

    this.dropdownSettings = {
      //type- description - default value
      //Boolean-	To set the dropdown for single item selection only.-false
      singleSelection: false,
      text: "--select--",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: true,
      classes: "danaphe-multiselect-style",
      groupBy: "",
      enableCheckAll: false,
      badgeShowLimit: 1,
    };
  }

  onItemSelect(item: any) {
    //console.log(JSON.stringify(this.GetItems()));
    this.ngModelChange.emit(JSON.stringify(this.GetItems()));
  }
  OnItemDeSelect(item: any) {
    this.ngModelChange.emit(JSON.stringify(this.GetItems()));
  }
  onSelectAll(items: any) {
    this.ngModelChange.emit(JSON.stringify(this.GetItems()));
  }
  onDeSelectAll(items: any) {
    this.ngModelChange.emit(JSON.stringify(this.GetItems()));
  }

  cancel(employeeId: number) {
    let index: number = this.selEmployees.findIndex(
      (emp) => emp.id == employeeId
    );
    if (index >= 0) {
      this.selEmployees.splice(index, 1);
      // this.selEmployees = this.selEmployees.slice();
      this.ngModelChange.emit(JSON.stringify(this.GetItems()));
    }
  }

  GetItems(): Array<any> {
    this.selEmployees.sort(function (a, b) {
      return a.DisplaySequence - b.DisplaySequence;
    });
    let retList = this.selEmployees.map((emp) => {
      //changed
      let currEmpId = emp.id;
      if (this.departmentName == "lab" || this.departmentName == "laboratory") {
        let currEmp = this.allEmployees.find(
          (itm) => itm.EmployeeId == currEmpId
        );
        if (currEmp) {
          var showEmpSign = true;
          if (!emp.hasOwnProperty("Show")) {
            showEmpSign = false;
          } else {
            showEmpSign = emp.Show;
          }
          return {
            EmployeeId: currEmp.EmployeeId,
            EmployeeFullName: currEmp.FullName,
            Signature: currEmp.LabSignature,
            SignatoryImageName: emp.SignatoryImageName,
            DisplaySequence: currEmp.DisplaySequence
              ? currEmp.DisplaySequence
              : 1000,
            Show: showEmpSign,
          };
        }
      }
      //changed
      else if (this.departmentName == "radiology") {
        let currEmp = this.allEmployees.find(
          (itm) => itm.EmployeeId == currEmpId
        );
        return {
          EmployeeId: currEmp.EmployeeId,
          EmployeeFullName: currEmp.FullName,
          Signature: currEmp.RadiologySignature,
          SignatoryImageName: emp.SignatoryImageName,
          DisplaySequence: currEmp.DisplaySequence
            ? currEmp.DisplaySequence
            : 1000,
        };
      }
    });

    this.selEmployeesFormatted = this.selEmployees.map((emp) => {
      let currEmpId = emp.id;
      return this.allEmployees.find((itm) => itm.EmployeeId == currEmpId);
    });

    return retList;
  }

  SetItems(ipJson): Array<any> {
    let ipList = [];
    if (ipJson) {
      ipList = JSON.parse(ipJson);
    }

    var index = -1;

    ipList.forEach((item, ind) => {
      let currEmp = this.allEmployees.find(
        (itm) => itm.EmployeeId == item.EmployeeId
      );
      if (!currEmp) {
        ipList.splice(ind, 1);
      } else {
        ipList["DisplaySequence"] = currEmp.DisplaySequence;
      }
    });

    let retList = ipList.map((emp) => {
      let currEmpId = emp.EmployeeId;
      let currEmp = this.allEmployees.find(
        (itm) => itm.EmployeeId == currEmpId
      );
      index = index + 1;
      if (currEmp) {
        var showEmpSign = true;
        if (!emp.hasOwnProperty("Show")) {
          showEmpSign = false;
        } else {
          showEmpSign = emp.Show;
        }
        return {
          id: currEmp.EmployeeId,
          itemName: currEmp.FullName,
          SignatoryImageName: emp.SignatoryImageName,
          DisplaySequence: currEmp.DisplaySequence
            ? currEmp.DisplaySequence
            : 1000,
          Show: showEmpSign,
        };
      }
    });

    this.selEmployeesFormatted = retList.map((emp) => {
      let currEmpId = emp.id;
      return this.allEmployees.find((itm) => itm.EmployeeId == currEmpId);
    });

    return retList;
  }
}
