import {
  Component,
  Directive,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { GridOptions } from "ag-grid-community";
import { GridEmitModel } from "./grid-emit.model";
import { CommonFunctions } from "../common.functions";
import * as moment from "moment/moment";
import { Subject, fromEvent } from "rxjs";
import { SearchService } from "../search.service";
import { MatTableDataSource } from "@angular/material";
import {
  map,
  filter,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { NepaliDateInGridParams } from "./NepaliColGridSettingsModel";
import { NepaliCalendarService } from "../calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service";
import { Router } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service";
import { MessageboxService } from "../messagebox/messagebox.service";
import {Base64} from 'js-base64';
// import { DateRangeOptions } from "../common-models";

@Component({
  selector: "danphe-grid",
  templateUrl: "./danphe-grid.html",
})
export class DanpheGridComponent implements OnInit, AfterViewInit {
  @Input("fixed-height-px")
  gridFixedHeight: string = "450px";

  public gridApi;
  public gridColumnApi;
  public gridOptions: GridOptions;
  public showGrid: boolean;

  public filterData: any;
  public PrintRowData: any;
  public dataSource: any;

  // public showSelector: boolean = false;
  // public fromDate: string = null;
  // public toDate: string = null;
  // public rangeType: string = "";
  public showLabel: boolean = false;
  public isOutOfFiscalYearDate: boolean = false;
  public paginationPageSize: number = 20;
  public apiUrl: string = "";
  public searchTerms = new Subject<any>();
  public searchMinTxtLeng: number = 0;
  public headerDetailParam = { "showPANNo": false, "showPhoneNumber": false };

  @Input("grid-showExport")
  public showExport: boolean = false;

  @Input("grid-showExportNew")
  public showExportNew: boolean = false;

  @Input("grid-showPrint")
  public showPrint: boolean = false;


  public rowData: any[];
  public headerDetail: any;

  @Input('report-for')
  public reportFor: string = "";

  @Input("grid-data")
  public set rowdata(val: any) {
    this.rowData = val;
    //this.PrintRowData = val;
  }

  @Input("grid-colDefaults")
  public columnDefs: any[];

  @Input("grid-column-filter")
  public gridColumnFilter: any[];

  public rowCount: string;

  @Output("grid-actions")
  gridCellClicked: EventEmitter<GridEmitModel> = new EventEmitter<GridEmitModel>();

  @Input("grid-exportOptions")
  public exportOptions: any;

  @Output("grid-onExport")
  onGridExport: EventEmitter<GridEmitModel> = new EventEmitter<GridEmitModel>();


  @Input("paginationPageSize")
  public set valueForPagination(val: number) {
    this.paginationPageSize = val ? val : 20;
  }

  //User can give what all ranges they want in this grid. default: all
  //Custom will be available all the time,  other are parameterized.
  @Input("date-range-options")
  public dateRangeOptionsStr: string = "1W,1M,3M";//available options are: 1D,1W,1M,3M,6M. 1D means Today.

  //sud:6June'20-this property is to replace 3 input properties that are used in grid.
  //we have used in lot of places, so we can't replace all at once.
  @Input("date-settings-name")
  dateRangeSettingsName: string = null;


  @Input("rangeType")
  public defaultDateRange: string = "";


  @Input("show-CustomDate")
  public showCustomDate: boolean = false;

  @Input("setFocusOnGridSearch")
  public setFocusOnGridSearch: boolean = false;

  @Input("show-ServerSideSearch")
  public showServerSideSearch: boolean = false;

  @Output("onDateChange")
  eventDate: EventEmitter<Object> = new EventEmitter<Object>();

  @Output("result-data")
  resultData: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("show-print-button")
  public showPrintButton: boolean = true;

  @Input("report-header")
  public reportHeader: string = "";

  @Input("api-type")
  public set apiurl(val: string) {
    this.apiUrl = val;
    this.loadRowData();
  }

  @Input("customServerSearch") showCustomSearch: boolean = false;
  @ViewChild("serverSearchInput") serverSearchIp: ElementRef;
  @Output("serverSearchText") ssTextEmitter = new EventEmitter<string>();

  @Input("NepaliDateInGridParams")
  public nepaliDateInGridColDetail: NepaliDateInGridParams = null;

  public showNepaliDateOption: boolean = false;
  public useGlobalRange: boolean = false;

  @Input("supressPagination")
  public supressPagination: boolean = false;

  @Input("resizeColumnToFit")
  public resizeColumnToFit: boolean = true;

  public headerContent = '';
  public headerTitle = '';
  public printTitle: string = "";

  @Input("grid-footer-content")
  public footerContent = '';

  public datePref: string = "";
  static colIdObj = {};
  public paramData = null;
  public paramExportToExcelData = null;
  public showAdBsButton: boolean = true;
  public printBy: string = '';

  @Input("grid-date-range")
  public dateRange: string = '';

  constructor(
    public searchService: SearchService,
    public changeDetector: ChangeDetectorRef,
    public coreservice: CoreService,
    public router: Router,
    public securityService: SecurityService, public coreService: CoreService,
    public msgBoxServ: MessageboxService, public nepaliCalendarService: NepaliCalendarService
  ) {
    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.showGrid = true;
    this.searchMinTxtLeng = +this.searchService.getSerachCharLength() + 1;
    this.showAdBsButton = this.coreservice.showCalendarADBSButton;
    // this.GetHeaderParameter(this.reportFor);
    // this.GetBillingHeaderParameter()
  }

  ngOnInit() {
    this.GetHeaderParameter(this.reportFor);
    if (!this.defaultDateRange) {
      this.defaultDateRange = "last1month";
    }
    else {
      //below is required since from-todate is newly implemented and grid already had these values.
      //mapping between new implementation and old implementation
      if (this.defaultDateRange == "last1Week") {
        this.defaultDateRange = "last1week";
      }
      else if (this.defaultDateRange == "last3Months") {
        this.defaultDateRange = "last3month";
      }
      else if (this.defaultDateRange == "last6month") {
        this.defaultDateRange = "last6month";
      }
      else if (this.defaultDateRange == "today") {
        this.defaultDateRange = "today";
      }
      else if (this.defaultDateRange == "None") {//this was used in most of the grids, so needed this mapping.
        this.defaultDateRange = "last1month";
      }
    }



    //this.PrintRowData = this.rowData && this.rowData.length ? this.rowData : null;

    if (
      this.nepaliDateInGridColDetail &&
      this.nepaliDateInGridColDetail.ShowNepaliDateInGrid
    ) {
      this.showNepaliDateOption = true;
      this.nepaliDateInGridColDetail.NepaliDateColumnList.forEach((col) => {
        let ind = this.columnDefs.findIndex(
          (cldf) => cldf.field == col.EnglishColumnName
        );
        this.columnDefs[ind].cellRenderer = col.ShowTime
          ? this.GetNepaliDateAndTime
          : this.GetNepaliDate;
      });
    }

    this.setFocusOnGridSearch && this.SetFocusOnPatientSearch('quickFilterInput');
  }


  private SetFocusOnPatientSearch(idToSelect: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(idToSelect);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

  public OnShowNepaliDateModelChange() {
    if (this.showNepaliDateOption) {
      this.nepaliDateInGridColDetail.NepaliDateColumnList.forEach((col) => {
        let ind = this.columnDefs.findIndex(
          (cldf) => cldf.field == col.EnglishColumnName
        );
        this.columnDefs[ind].cellRenderer = col.ShowTime
          ? this.GetNepaliDateAndTime
          : this.GetNepaliDate;
      });
    } else {
      this.nepaliDateInGridColDetail.NepaliDateColumnList.forEach((col) => {
        let ind = this.columnDefs.findIndex(
          (cldf) => cldf.field == col.EnglishColumnName
        );
        this.columnDefs[ind].cellRenderer = col.ShowTime
          ? this.GetNormalDateTimeData
          : this.GetNormalDateData;
      });
    }

    this.gridOptions.api.setColumnDefs([]);
    this.changeDetector.detectChanges();
    this.gridOptions.api.setColumnDefs(this.columnDefs);
    this.gridOptions.api.refreshCells();

    if (this.resizeColumnToFit) {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  // OnChangeGlobalRange() {
  //   if (this.useGlobalRange == true) {
  //     localStorage.setItem("Global_DateRange", JSON.stringify({ useGlobalRange: true, dateRangeName: this.rangeType, fromDate: this.fromDate, toDate: this.toDate }));
  //   }
  //   else {
  //     localStorage.removeItem("Global_DateRange");
  //   }
  // }


  ManagePrintDataList() {
    this.PrintRowData = [];
    //Go for date conversion only if ShowNepaliDate is true.
    if (this.showNepaliDateOption) {

      this.rowData.forEach((r) => {
        let fieldRow = Object.assign({}, r);
        //Perform Nepali Date conversion on each Columns having Nepali Date option.
        this.nepaliDateInGridColDetail.NepaliDateColumnList.forEach((col) => {
          let ind = this.columnDefs.findIndex(
            (cldf) => cldf.field == col.EnglishColumnName
          );
          if (ind > -1) {
            let fld = this.columnDefs[ind].field;
            //If current field is null or empty or space then don't try to convert that field.
            if (fieldRow[fld] && fieldRow[fld].trim() != "") {
              //Conversion function from EngToNep is same, just that We need to use different Formatting Strings if Based on ShowTime variable.
              fieldRow[fld] = col.ShowTime ? NepaliCalendarService.ConvertEngToNepaliFormatted_static(
                fieldRow[fld],
                "YYYY-MM-DD hh:mm"
              )
                : NepaliCalendarService.ConvertEngToNepaliFormatted_static(
                  fieldRow[fld],
                  "YYYY-MM-DD"
                );
            }
          }
        });

        this.PrintRowData.push(fieldRow);
      });

    } else {
      this.rowData.forEach((r) => {
        let fieldRow = Object.assign({}, r);
        this.PrintRowData.push(fieldRow);
      });
    }
  }



  ManagePrintDataList_OldForBackup() {
    this.PrintRowData = [];
    if (this.showNepaliDateOption) {
      this.nepaliDateInGridColDetail.NepaliDateColumnList.forEach((col) => {
        let ind = this.columnDefs.findIndex(
          (cldf) => cldf.field == col.EnglishColumnName
        );
        if (ind > -1) {
          let fld = this.columnDefs[ind].field;
          this.rowData.forEach((r) => {
            let fieldRow = Object.assign({}, r);
            fieldRow[fld] = col.ShowTime ? NepaliCalendarService.ConvertEngToNepaliFormatted_static(
              fieldRow[fld],
              "YYYY-MM-DD hh:mm"
            )
              : NepaliCalendarService.ConvertEngToNepaliFormatted_static(
                fieldRow[fld],
                "YYYY-MM-DD"
              );
            this.PrintRowData.push(fieldRow);
          });
        }
      });
    } else {
      this.rowData.forEach((r) => {
        let fieldRow = Object.assign({}, r);
        this.PrintRowData.push(fieldRow);
      });
    }
  }



  public GetNepaliDate(params) {
    let dateData = "";
    if (params.value && params.value.trim() != "") {
      dateData = NepaliCalendarService.ConvertEngToNepaliFormatted_static(
        params.value,
        "YYYY-MM-DD"
      );
    }
    return dateData;
  }

  public GetNepaliDateAndTime(params) {
    let dateData = "";
    if (params.value && params.value.trim() != "") {
      dateData = NepaliCalendarService.ConvertEngToNepaliFormatted_static(
        params.value,
        "YYYY-MM-DD hh:mm"
      );
    }
    return dateData;
  }

  public GetNormalDateData(params) {
    if (params.value && params.value.trim() != "") {
      return moment(params.value).format("YYYY-MM-DD");
    } else {
      return "";
    }
  }
  public GetNormalDateTimeData(params) {
    if (params.value && params.value.trim() != "") {
      return moment(params.value).format("YYYY-MM-DD hh:mm");
    } else {
      return "";
    }
  }

  ngAfterViewInit() {
    if (this.showCustomSearch) {
      fromEvent(this.serverSearchIp.nativeElement, "keyup")
        .pipe(
          // get value
          map((event: any) => {
            return event.target.value;
          }),
          // if character length greater then min.length
          filter(
            (res) => res.length >= this.searchMinTxtLeng || res.length == 0
          ),
          // Time in milliseconds between key events
          debounceTime(400),
          // If previous query is diffent from current
          distinctUntilChanged()
          // subscription for response
        )
        .subscribe((text: string) => {
          this.ssTextEmitter.emit(text);
        });
    }
    this.GridPrintAndExportSetting();
    // this.BillingHandoverGridPrintAndExportSetting();
  }

  // RangeTypeOnChange() {
  //   this.showSelector = false;
  //   this.showLabel = false;
  //   this.isOutOfFiscalYearDate = false;
  //   if (this.rangeType == "None") {
  //     var from = new Date();
  //     var to = new Date();
  //     to.setHours(23, 59, 59, 999);
  //     from.setHours(0, 0, 0, 0);
  //     from.setMonth(from.getMonth() - 1);
  //     this.fromDate = moment(from).format("YYYY-MM-DD");
  //     this.toDate = moment(to).format("YYYY-MM-DD");
  //     this.showLabel = true;
  //     this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
  //   } else if (this.rangeType == "last1Week") {
  //     var from = new Date();
  //     from.setHours(0, 0, 0, 0);
  //     from.setDate(from.getDate() - 7);
  //     this.fromDate = moment(from).format("YYYY-MM-DD");
  //     this.toDate = moment(to).format("YYYY-MM-DD");
  //     this.showLabel = true;
  //     this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
  //   } else if (this.rangeType == "last3Months") {
  //     //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
  //     var from = new Date();
  //     from.setHours(0, 0, 0, 0);
  //     from.setMonth(from.getMonth() - 3);
  //     this.fromDate = moment(from).format("YYYY-MM-DD");

  //     this.toDate = moment(to).format("YYYY-MM-DD");
  //     this.showLabel = true;
  //     this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
  //   } else if (this.rangeType == "last6Months") {
  //     //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
  //     var from = new Date();
  //     from.setHours(0, 0, 0, 0);
  //     from.setMonth(from.getMonth() - 6);
  //     this.fromDate = moment(from).format("YYYY-MM-DD");
  //     // }
  //     this.toDate = moment(to).format("YYYY-MM-DD");
  //     this.showLabel = true;
  //     this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
  //   } else {
  //     if (this.useGlobalRange == false) {
  //       this.fromDate = this.toDate = moment().format("YYYY-MM-DD");
  //     }
  //     else {
  //       this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate, type: "custom" });
  //     }
  //     this.showSelector = true;
  //     //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate, type: "custom" });
  //   }
  //   if (this.useGlobalRange) {
  //     localStorage.setItem("Global_DateRange", JSON.stringify({ useGlobalRange: true, dateRangeName: this.rangeType, fromDate: this.fromDate, toDate: this.toDate }));
  //   }
  // }

  // ChangeCustomDate() {
  //   var fDate = moment(this.fromDate).format("YYYY-MM-DD 00:00");
  //   var tDate = moment(this.toDate).format("YYYY-MM-DD 23:59");
  //   this.eventDate.emit({ fromDate: fDate, toDate: tDate });
  //   if (this.useGlobalRange) {
  //     localStorage.setItem("Global_DateRange", JSON.stringify({ useGlobalRange: true, dateRangeName: this.rangeType, fromDate: this.fromDate, toDate: this.toDate }));
  //   }
  // }

  ChangeDateFormat() { }

  onBtPrint() {
    var printDate = moment().format("YYYY-MM-DD HH:mm");//Take Current Date/Time for PrintedOn Value.
    // var np_PrintDate = this.nepaliCalendarService.ConvertEngToNepDateString(printDate);
    let popupWinindow;
    if (!this.reportHeader || this.reportHeader.trim() == "") {
      this.reportHeader = "Report Data";
    }
    if (this.paramData) {

      if (!this.printBy.includes("Printed")) {
        var currDate = moment().format("YYYY-MM-DD HH:mm");
        var nepCurrDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(currDate, "YYYY-MM-DD hh:mm");
        let printedBy = (this.paramData.ShowPrintBy) ? "<b>Printed By:</b>&nbsp;" + this.printBy : '';
        this.printBy = printedBy;
      }
      this.dateRange = (this.paramData.ShowDateRange) ? this.dateRange : this.dateRange = '';
    }
    else {
      this.printBy = "";
      this.dateRange = "";
    }
    //var printContents =this.reportHeader+this.headerLine;
    var printContents = `<div>
                          <p class='alignleft'>${this.reportHeader}</p>
                          <p class='aligncenter'>${this.dateRange}</p>
                          <p class='alignright'>
                            ${this.printBy}<br />
                            <b>Printed On:</b> (AD)${printDate}<br /> 
                          </p>
                        </div>`
    printContents += "<style> table { border-collapse: collapse; border-color: black;font-size: 11px; } th { color:black; background-color: #599be0;}"
    printContents += ".alignleft {float:left;width:33.33333%;text-align:left;}.aligncenter {float: left;width:33.33333%;text-align:center;}.alignright {float: left;width:33.33333%;text-align:right;}​</style>";
    this.ManagePrintDataList();
    var htmlTable = this.JsonDataToHTMLTable(
      this.PrintRowData,
      this.columnDefs
    );
    printContents += htmlTable.innerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    //documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default//DanphePrintStyle.css"/>';
    documentContent +=
      '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent +=
      '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default//DanpheStyle.css"/>';
    documentContent += "</head>";
    if (this.paramData) {
      this.printTitle = this.paramData.HeaderTitle;
      this.changeDetector.detectChanges();
      this.headerContent = '';
      this.headerContent = document.getElementById("headerForPrint").innerHTML;
      printContents = (this.paramData.ShowHeader) ? this.headerContent + printContents : printContents;
      printContents = (this.paramData.ShowFooter) ? printContents + this.footerContent : printContents;
    }
    documentContent +=
      '<body onload="window.print()">' + printContents + "</body></html>";
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  public JsonDataToHTMLTable(data, gridColList: any[]) {
    var newCol = [];
    for (i = 0; i < gridColList.length; i++) {
      if (gridColList[i].field) {
        newCol.push(gridColList[i].field);
      }
    }

    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");
    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
    var tr = table.insertRow(-1); // TABLE ROW.
    for (var i = 0; i < newCol.length; i++) {
      var th = document.createElement("th"); // TABLE HEADER.
      th.setAttribute("style", "font-weight:bold; border:1px solid black;");
      th.style.backgroundColor = "#ababad";
      th.innerHTML = CommonFunctions.GetKeyName(newCol[i], gridColList); //newCol[i];
      tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < data.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < newCol.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.setAttribute("style", "border:1px solid black;");
        tabCell.innerHTML = data[i][newCol[j]];
      }
    }
    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    table.setAttribute(
      "class",
      "table table-striped table-hover table-responsive tbl-grid-report"
    );
    var newdiv = document.createElement("div");
    newdiv.setAttribute("class", "table-responsive");
    newdiv.appendChild(table);
    return newdiv;
  }
  public calculateRowCount() {
    if (this.gridOptions.api && this.rowData) {
      var model = this.gridOptions.api.getModel();
      var totalRows = this.rowData.length;
      var processedRows = model.getRowCount();
      this.rowCount =
        processedRows.toLocaleString() + " / " + totalRows.toLocaleString();
    }
  }

  public onModelUpdated() {
    this.calculateRowCount();
  }

  public onReady() {
    // this.gridApi = this.gridOptions.api;
    // this.gridColumnApi = this.gridOptions.columnApi;

    // this.gridOptions.api.expandAll();
    // console.log('onReady');
    this.calculateRowCount();
    //-- add a property 'isResponsiveColumn:bool, set it as default true, pass false for DYNAMIC REPORTS.'


    if (this.resizeColumnToFit) {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  //we're emiting our custom gridemitobject from here.
  // NOTE: each custom item(eg, image, button, anchor, should have this attribute "danphe-grid-action" in its template, else it won't work..
  public onCellClicked($event) {
    if ($event.event.target !== undefined) {
      let data = $event.data;
      let actionType = $event.event.target.getAttribute("danphe-grid-action");
      let emitObj = new GridEmitModel();
      emitObj.Action = actionType;
      emitObj.Data = $event.data;
      emitObj.RowIndex = $event.rowIndex;
      this.gridCellClicked.emit(emitObj);
    }
  }

  public onCellValueChanged($event) {
    //console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
  }

  public onCellDoubleClicked($event) {
    //console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  public onCellContextMenu($event) {
    //console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  public onCellFocused($event) {
    //console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
  }

  public onRowSelected($event) {
    // taking out, as when we 'select all', it prints to much to the console!!
    // console.log('onRowSelected: ' + $event.node.data.name);
  }

  public onSelectionChanged() {
    //console.log('selectionChanged');
  }

  public onBeforeFilterChanged() {
    //console.log('beforeFilterChanged');
  }

  public onAfterFilterChanged() {
    //console.log('afterFilterChanged');
  }

  public onFilterModified() {
    //console.log('onFilterModified');
  }

  public onBeforeSortChanged() {
    //console.log('onBeforeSortChanged');
  }

  public onAfterSortChanged() {
    //console.log('onAfterSortChanged');
  }

  public onVirtualRowRemoved($event) {
    // because this event gets fired LOTS of times, we don't print it to the
    // console. if you want to see it, just uncomment out this line
    // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
  }

  public onRowClicked($event) {
    //console.log('onRowClicked: ' + $event.node.data.name);
  }

  public onQuickFilterChanged($event) {
    this.dataSource = new MatTableDataSource(this.rowData);
    this.gridOptions.api.setQuickFilter($event.target.value);
    this.applyFilter($event.target.value);
  }
  applyFilter(filterValue: any) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    //this.PrintRowData = this.dataSource.filteredData;
  }
  // Real time search data from api
  searchSeraverSide($event) {
    //  this.gridSearchTyped.emit($event.target.value);
    this.searchTerms.next($event.target.value);
  }
  loadRowData() {
    this.searchService
      .search(this.apiUrl, this.searchTerms)
      .subscribe((res) => {
        this.rowData = res.Results;
        //this.PrintRowData = res.Results;
        //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
        this.resultData.emit(this.rowData);
      });
  }
  // here we use one generic event to handle all the column type events.
  // the method just prints the event name
  public onColumnEvent($event) {
    //console.log('onColumnEvent: ' + $event);
  }

  public onRowDataChanged($event) {
    //console.log("start--row data change.");
    //console.log($event);
    //console.log("end--row data change.");
  }

  //We couldn't add HeaderFormatting feature in this function.
  //try to add dynamic headers, cell/header formatting, grouping, etc later on : sudarshan 5June'17
  public ExportToExcel($event) {
    //sud:22Sept'21--We need to always call the ExportGridToExcel function.
    //review and remove other code later..
    if (1) {
      this.ExportGridToExcel();
      return;
    }
    DanpheGridComponent.colIdObj = {};
    if (this.showNepaliDateOption) {
      this.nepaliDateInGridColDetail.NepaliDateColumnList.forEach((col) => {
        let ind = this.columnDefs.findIndex(
          (cldf) => cldf.field == col.EnglishColumnName
        );
        let fld = this.columnDefs[ind].field;
        DanpheGridComponent.colIdObj[fld] = true;
        DanpheGridComponent.colIdObj[fld + "showTime"] = col.ShowTime;
      });
    }

    function formattingFunction(params) {
      let colDef = params.column.colDef;

      //let TextBoldSty = colDef.TextBoldFormate("style: fontSize: 22, bold: true")
      //colDef.cellStyle = { color: 'red', 'background-color': 'green'};
      return colDef.headerName.replace("<b>", "").replace("</b>", "");
    }

    function cellFormattingFunction(params) {
      let colId = params.column.colId;
      if (DanpheGridComponent.colIdObj[colId]) {
        if (DanpheGridComponent.colIdObj[colId + "showTime"]) {
          return ((params.node.data[colId] && params.node.data[colId].trim() != "") ? NepaliCalendarService.ConvertEngToNepaliFormatted_static(
            params.node.data[colId],
            "YYYY-MM-DD hh:mm"
          ) : "");
        } else {
          return ((params.node.data[colId] && params.node.data[colId].trim() != "") ? NepaliCalendarService.ConvertEngToNepaliFormatted_static(
            params.node.data[colId],
            "YYYY-MM-DD"
          ) : "");
        }
      }
      return params.node.data[colId];
    }

    //exportOptions: { fileName:'' displayColumns:[] };

    // ['EMPI', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber'],
    var params = {
      processHeaderCallback: formattingFunction,
      processCellCallback: cellFormattingFunction,
      customHeader: this.exportOptions.customHeader,
      customFooter: this.exportOptions.customFooter,
      skipHeader: false,
      columnKeys: this.exportOptions.displayColumns,
      fileName: this.exportOptions.fileName,
    };

    this.gridOptions.api.exportDataAsCsv(params);
  }

  ExportToExcel_New($event) {
    let emitObj = new GridEmitModel();
    emitObj.Action = "Dharam";
    this.onGridExport.emit(this.headerDetail);
  }

  //START:Aniket-13-Aug-21 - This function will export grid data as excel file
  //We are providing header, report title, printby, daterange, and footer. All five things are dynamic.
  //We can show or hide in excel as per the core parameter value.
  //This function will export with color and style.
  ExportGridToExcel() {
    try {
      let Footer = JSON.parse(JSON.stringify(this.footerContent));
      let date = JSON.parse(JSON.stringify(this.dateRange));
      date = date.replace("To", " To:");
      this.printBy = this.securityService.loggedInUser.Employee.FullName;
      let printBy = JSON.parse(JSON.stringify(this.printBy));
      let printByMessage = '';
      // sanjit: to show print date on all the client side exports
      var printDate = moment().format("YYYY-MM-DD HH:mm");
      // var np_PrintDate = this.nepaliCalendarService.ConvertEngToNepDateString(printDate);

      let filename;
      let workSheetName;
      filename = workSheetName = this.exportOptions.fileName;
      if (!!this.paramExportToExcelData) {
        if (!this.paramExportToExcelData.HeaderTitle) {
          this.paramExportToExcelData.HeaderTitle = "";
        }
        if (this.paramExportToExcelData.ShowPrintBy) {
          if (!printBy.includes("PrintBy")) {
            printByMessage = 'Exported By:'
          }
          else {
            printByMessage = ''
          }
        }
        else {
          printBy = '';
        }
        if (!this.paramExportToExcelData.ShowDateRange) {
          date = ""
        }
        (!!this.headerDetail.hospitalName) ? this.headerDetail.hospitalName : "";
        (!!this.headerDetail.address) ? this.headerDetail.address : "";
        (!!this.headerDetail.PANno) ? this.headerDetail.PANno : "";
        (!!this.headerDetail.tel) ? this.headerDetail.tel : "";

        //check Header
        if (this.paramExportToExcelData.ShowHeader) {
          if (this.reportFor == "pharmacy") {
            var Header = `<tr><td></td><td></td><td colspan="4" style="text-align:center;font-size:large;"><strong>${this.headerDetail.hospitalName}</strong></td></tr><br/><tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>${this.headerDetail.address}</strong></td></tr><br/><tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;width:600px;"><strong>${this.paramExportToExcelData.HeaderTitle}</strong></td></tr><br/><tr> <td style="text-align:center;"><strong>${date}</strong></td><td></td><td></td><td></td><td></td><td></td><td></td><td style="text-align:center;"><strong>${printByMessage}${printBy}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`
          } else {
            var Header = '<tr><td></td><td></td><td colspan="4" style="text-align:center;font-size:large;"><strong>' + this.headerDetail.hospitalName + '</strong></td></tr><br/>' +
              '<tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>' + this.headerDetail.address + '</strong></td></tr><br/>';
            if (this.headerDetailParam.showPhoneNumber) {
              Header += '<tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;">' + ' Ph No: ' + this.headerDetail.tel + '</td></tr><br/>';
            }
            Header += '<tr> <td></td><td></td><td colspan="4" style="text-align:center;font-size:small;width:600px;"><strong>' + this.paramExportToExcelData.HeaderTitle + '</strong></td></tr><br/>' +
              '<tr> <td style="text-align:center;"><strong>' + date + '</strong></td><td></td><td></td><td></td><td style="text-align:center;"><strong>' + printByMessage + printBy + `</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`

          }
        }
        else {
          if (date == "") { //if showdate date is false
            Header = `<tr> <td style="text-align:center;"><strong> ${printByMessage} ${printBy} </strong></td><td><strong>Exported On: ${printDate}</strong></td></tr>`;
          }
          else if (printBy == "") { // if  printby is false. 
            Header = `<tr> <td style="text-align:center;"><strong>${date}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr>`;
          }
          else { //if both are true
            Header = `<tr> <td style="text-align:center;"><strong>${date}</strong></td><td></td><td></td><td></td><td style="text-align:center;"><strong>${printByMessage}${printBy}</strong></td><td><strong>Exported On: ${printDate}</strong></td></tr><br>`;
          }
        }
        //check Footer
        if (!this.paramExportToExcelData.ShowFooter) {
          Footer = "";
        }
      }
      else {
        Header = "Report Data";
        Footer = "";
        printBy = "";
        date = "";
        printByMessage = "";
      }
      this.ManagePrintDataList();
      //this is main report table
      var htmlTable = this.JsonDataToHTMLTable(
        this.PrintRowData,
        this.columnDefs
      );
      let uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{header}<br>{content}<br><table><tr><td></td><td></td><td>{footer}</td></tr></table></table></body></html>'
        //, base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
        , base64 = function (s) { return Base64.toBase64(decodeURIComponent(encodeURIComponent(s))) } //Base64 is coming from 'js-base64' package..
        ,format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
      var ctx = { worksheet: workSheetName, header: Header, content: htmlTable.innerHTML, footer: Footer }
      var link = document.createElement('a');
      link.href = uri + base64(format(template, ctx));
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (ex) {
      console.log(ex);
    }
  }
  //start: sud:6June'20-- Implementing FromDate-ToDate Reusable component in Grid.

  // public grid_fromDate: string = null;
  // public grid_toDate: string = null;
  // public showReloadButton: boolean = false;
  // public isInitialLoad: boolean = true;

  //This event is fired from onchange of from-to-select component.
  //if it's coming from Range (i.e: 1Week, 1Month, 3Month, etc) then we're emiting that range directly to parent component.
  //but if the date is changed individually then we're showing Reload button, otherwise the ParentComponent will be overloaded with network calls.
  //exception for FirstTimeLoading, where we're emiting this date so that the data is loaded in Parent Component on the FirstTime.
  OnFromToDateChange($event) {
    this.eventDate.emit({ fromDate: $event.fromDate, toDate: $event.toDate });

    // this.grid_fromDate = $event.fromDate;
    // this.grid_toDate = $event.toDate;
    // // console.log("from grid-date change-fromtocomponent");
    // // console.log($event);
    // if ($event && $event.eventType == "range" || this.isInitialLoad) {
    //   this.isInitialLoad = false; //after first time, this will be false.
    //   this.showReloadButton = false;
    //   this.eventDate.emit({ fromDate: this.grid_fromDate, toDate: this.grid_toDate });
    // }
    // else {
    //   //this will show reload button, user can click on it to emit the selected date range.
    //   this.showReloadButton = true;
    // }
  }

  //this is called from Reload-Data button, this button is only visible if user has choosen the from-todate manually.
  //this button doesn't appear if a fixed range(i.e: 1wee, 1month etc are selected)
  // ReloadDataBtnClick() {
  //   this.showReloadButton = false;//to avoid multiple-clicks we need to hide this button otherwise parent component will be overloaded with network calls.
  //   // console.log("from reload data of grid..");
  //   this.eventDate.emit({ fromDate: this.grid_fromDate, toDate: this.grid_toDate });
  // }


  //End: sud:6June'20-- Implementing FromDate-ToDate Reusable component in Grid.
  //START:swapnil-28-july-21 created function for show or hide content on grid print button
  // we are showing or hiding dynamic header,footer ,title,printby,daterange
  //this settting is dynamic aas per core parameter value
  // footer,daterange are inputs from component
  //printby,header ,title no need to provide from component
  //START:aniket-11-Aug-21 Modified below function for both print and export excel scenario

  private GridPrintAndExportSetting() {
    try {
      if (this.reportFor == "billing") {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "BillingReport" && p.ParameterName == "BillingReportPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "BillingReport" && p.ParameterName == "BillingReportGridExportToExcelSetting").ParameterValue);

      }
      else if (this.reportFor == "lab") {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "LabReport" && p.ParameterName == "LabReportGridPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "LabReport" && p.ParameterName == "LabReportGridExportToExcelSetting").ParameterValue);
      }
      else if (this.reportFor == "MRReport") {
        var printParam = this.coreservice.Parameters.find(p => p.ParameterGroupName == "MaternityReport" && p.ParameterName == "MaternityReportGridPrintSetting");
        if(printParam){
          var printSettingParameter=JSON.parse(printParam.ParameterValue);
        }
        var exportParam = this.coreservice.Parameters.find(p => p.ParameterGroupName == "MaternityReport" && p.ParameterName == "MaternityReportGridExportToExcelSetting");
        if(exportParam){
          var exportToExcelSettingParameter=JSON.parse(exportParam.ParameterValue);
        }
      }
      else if(this.reportFor == "accounting") {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "AccReport" && p.ParameterName == "AccReportPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "AccReport" && p.ParameterName == "AccExportToExcelSetting").ParameterValue);
      }
      else if (this.reportFor == "systemadmin") {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "SystemAdminReport" && p.ParameterName == "SystemAdminReportPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "SystemAdminReport" && p.ParameterName == "SystemAdminReportExportToExcelSetting").ParameterValue);
      }
      else if (this.reportFor == "admission") {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "AdmissionReport" && p.ParameterName == "AdmissionReportGridPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "AdmissionReport" && p.ParameterName == "AdmissionReportGridExportToExcelSetting").ParameterValue);
      }
      else if (this.reportFor == "appointment") {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "AppointmentReport" && p.ParameterName == "AppointmentReportGridPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "AppointmentReport" && p.ParameterName == "AppointmentReportGridExportToExcelSetting").ParameterValue);
      }
      else {
        var printSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "ReportSetting" && p.ParameterName == "PharmacyGridPrintSetting").ParameterValue);
        var exportToExcelSettingParameter = JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "ReportSetting" && p.ParameterName == "PharmacyGridExportToExcelSetting").ParameterValue);
      }
      if (!!printSettingParameter || !!exportToExcelSettingParameter) {
        this.paramData = null;
        this.paramExportToExcelData = null;
        switch (this.router.url) {

          case "/Reports/LabMain/LabTypeWiseTestCountReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["LabTypeWiseTotalTestCountReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["LabTypeWiseTotalTestCountReport"];
            break;
          }
          case "/Reports/LabMain/CategoryWiseLabReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["CategoryWiseLabReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["CategoryWiseLabReport"];
            break;
          }
          case "/Reports/LabMain/TotalRevenueFromLab": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["TotalRevenueFromLab"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["TotalRevenueFromLab"];
            break;
          }
          case "/Reports/LabMain/ItemWiseLabReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["ItemWiseLabReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["ItemWiseLabReport"];
            break;
          }
          case "/Reports/LabMain/LabTestStatusDetailReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["LabTestStatusDetailReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["LabTestStatusDetailReport"];
            break;
          }
          case "/Reports/LabMain/HIVTestDetailsReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["HIVTestDetailsReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["HIVTestDetailsReport"];
            break;
          }
          case "/Reports/LabMain/LabCultureDetailsReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["LabCultureDetailsReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["LabCultureDetailsReport"];
            break;
          }
          case "/Reports/LabMain/CatAndItemWiseCountLabReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["CatAndItemWiseCountLabReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["CatAndItemWiseCountLabReport"];
            break;
          }
          case "/Reports/LabMain/DoctorWisePatientCountLabReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DoctorWisePatientCountLabReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["DoctorWisePatientCountLabReport"];
            break;
          }
          case "/Reports/LabMain/CovidTestsSummaryReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["CovidTestsSummaryReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["CovidTestsSummaryReport"];
            break;
          }
          case "/Reports/LabMain/CovidCasesDetailReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["CovidCasesDetailReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["CovidCasesDetailReport"];
            break;
          }
          case "/Reports/BillingMain/ItemSummaryReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["BillItemSummaryReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["BillItemSummaryReport"];
            break;
          }
          case "/Reports/BillingMain/PatientCreditSummary": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["BillPatientCreditSummaryReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["BillPatientCreditSummaryReport"];
            break;
          }
          case "/Reports/BillingMain/IncomeSegregation": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["IncomeSegregationReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["IncomeSegregationReport"];
            break;
          }
          case "/Reports/BillingMain/DepartmentWiseDiscountSchemeReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DepartmentWiseDiscountSchemeReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["DepartmentWiseDiscountSchemeReport"];
            break;
          }
          case "/Reports/BillingMain/TotalItemsBill": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["TotalItemsBillReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["TotalItemsBillReport"];
            break;
          }
          case "/Reports/BillingMain/UserCollectionReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["UserCollectionReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["UserCollectionReport"];
            break;
          }
          case "/Reports/BillingMain/SalesDaybook": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SalesDayBookReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["SalesDayBookReport"];
            break;
          }
          case "/Reports/BillingMain/DepositBalance": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DepositBalanceReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["DepositBalanceReport"];
            break;
          }
          case "/Reports/BillingMain/DepositTransaction": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DepositTransactionReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["DepositTransactionReport"];
            break;
          }
          case "/Reports/BillingMain/BillCancelSummary": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["BillCancelReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["BillCancelReport"];
            break;
          }
          case "/Reports/BillingMain/ReturnBillSummary": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["BillReturnReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["BillReturnReport"];
            break;
          }
          case "/Reports/BillingMain/DiscountReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DiscountReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["DiscountReport"];
            break;
          }
          case "/Reports/BillingMain/DialysisPatientDetails": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DialysisPatientReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["DialysisPatientReport"];
            break;
          }
          case "/Reports/BillingMain/EHSBillReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["EHSBillReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["EHSBillReport"]
            break;
          }
          case "/Reports/InsBillingReports/TotalItemsBill": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["InsuranceTotalItmesBillReport"];
            if (exportToExcelSettingParameter)
              this.paramExportToExcelData = exportToExcelSettingParameter["InsuranceTotalItmesBillReport"];
            break;
          }
          case "/Billing/BillingDenomination/DailyCollectionVsHandoverReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DailyCollectionVsHandoverReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DailyCollectionVsHandoverReport"]
            break;
          }
          case "/Billing/BillingDenomination/HandoverSummaryReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SummaryReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SummaryReport"]
            break;
          }
          case "/Billing/BillingDenomination/HandoverReceiveTransactionReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["ReceiveTransactionReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["ReceiveTransactionReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/PurchaseOrderReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PurchaseOrderReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PurchaseOrderReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/ReturnToSupplierReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["ReturnToSupplierReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["ReturnToSupplierReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/GoodsReceiptProductReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["GoodsReceiptProductReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["GoodsReceiptProductReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/ItemWisePurchaseReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["ItemWisePurchaseReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["ItemWisePurchaseReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/DateWisePurchaseReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DateWisePurchaseReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DateWisePurchaseReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/PurchaseSummary": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PurchaseSummary"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PurchaseSummary"]
            break;
          }
          case "/Pharmacy/Report/Sales/BillingReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["BillingReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["BillingReport"]
            break;
          }
          case "/Pharmacy/Report/Sales/PHRMDailySalesSummary": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PHRMDailySalesSummary"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PHRMDailySalesSummary"]
            break;
          }
          case ("/Pharmacy/Report/Sales/UserwiseCollectionReport"): {
            if (!!printSettingParameter) this.paramData = printSettingParameter["UserwiseCollectionReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["UserwiseCollectionReport"]
            break;
          }
          case "/Dispensary/Reports/UserWiseCollectionReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["UserwiseCollectionReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["UserwiseCollectionReport"]
            break;
          }
          case "/Pharmacy/Report/Sales/DepositBalanceReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DepositBalanceReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DepositBalanceReport"]
            break;
          }
          case "/Pharmacy/Report/Sales/PHRMNarcoticsDailySalesReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PHRMNarcoticsDailySalesReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PHRMNarcoticsDailySalesReport"]
            break;
          }
          case "/Pharmacy/Report/Sales/SalesStatement": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SalesStatement"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SalesStatement"]
            break;
          }
          case "/Pharmacy/Report/Sales/INSPatientBima": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["INSPatientBima"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["INSPatientBima"]
            break;
          }
          case "/Pharmacy/Report/Sales/SalesSummary": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SalesSummary"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SalesSummary"]
            break;
          }
          case "/Pharmacy/Report/Sales/PatientWiseSalesDetail": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PatientWiseSalesDetail"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PatientWiseSalesDetail"]
            break;
          }
          case "/Pharmacy/Report/Stock/StockItemsReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["StockItemsReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["StockItemsReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/SupplierStockReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SupplierStockReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SupplierStockReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/ExpiryReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["ExpiryReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["ExpiryReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/PHRMNarcoticsStockReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PHRMNarcoticsStockReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PHRMNarcoticsStockReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/StockSummaryReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["StockSummaryReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["StockSummaryReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/ReturnFromCustomerReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["ReturnFromCustomerReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["ReturnFromCustomerReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/StockSummarySecond": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["StockSummarySecond"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["StockSummarySecond"]
            break;
          }
          case "/Pharmacy/Report/Stock/StockTransfers": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["StockTransfers"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["StockTransfers"]
            break;
          }
          case "/Pharmacy/Report/Supplier/SupplierInfoReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SupplierInfoReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SupplierInfoReport"]
            break;
          }
          case "/Pharmacy/Report/Purchase/SupplierWisePurchaseReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["SupplierWisePurchaseReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SupplierWisePurchaseReport"]
            break;
          }
          case "/Pharmacy/Report/Stock/StockLedgerReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["StockLedgerReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["StockLedgerReport"]
            break;
          }
          case "/Maternity/Reports/MaternityAllowance": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["MaternityAllowanceReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["MaternityAllowanceReport"]
            break;
          }
          case "/Accounting/Reports/DailyTransactionReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DailyTransactionReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DailyTransactionReport"]
            break;
          }
          case "/SystemAdmin/InvoiceDetails": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["MaterializedSalesViewReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["MaterializedSalesViewReport"]
            break;
          }
          // START: Admission Report configuration
          case "/Reports/AdmissionMain/TotalAdmittedPatient": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["TotalAdmittedPatient"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["TotalAdmittedPatient"]
            break;
          }
          case "/Reports/AdmissionMain/DischargedPatient": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DischargedPatient"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DischargedPatient"]
            break;
          }
          case "/Reports/AdmissionMain/TransferredPatient": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["TransferredPatient"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["TransferredPatient"]
            break;
          }
          case "/Reports/AdmissionMain/DiagnosisWisePatientReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DiagnosisWisePatientReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DiagnosisWisePatientReport"]
            break;
          }
          case "/Reports/AdmissionMain/InpatientCensusReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["InpatientCensusReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["InpatientCensusReport"]
            break;
          }
          case "/Reports/AdmissionMain/AdmissionAndDischargeList": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["AdmissionAndDischargeList"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["AdmissionAndDischargeList"]
            break;
          }
          // END: Admission Report configuration

          // START: Appointment Report configuration
          case "/Reports/AppointmentMain/DailyAppointmentReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DailyAppointmentReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DailyAppointmentReport"]
            break;
          }
          case "/Reports/AppointmentMain/DistrictWiseAppointmentReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DistrictWiseAppointmentReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DistrictWiseAppointmentReport"]
            break;
          }
          case "/Reports/AppointmentMain/DepartmentWiseAppointmentReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DepartmentWiseAppointmentReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DepartmentWiseAppointmentReport"]
            break;
          }
          case "/Reports/AppointmentMain/DoctorwiseOutPatient": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["DoctorwiseOutPatient"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DoctorwiseOutPatient"]
            break;
          }  
          case "/Reports/AppointmentMain/PhoneBookAppointmentReport": {
            if (!!printSettingParameter) this.paramData = printSettingParameter["PhoneBookAppointmentReport"];
            if (!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["PhoneBookAppointmentReport"]
            break;
          }
          // END: Appointment Report configuration

          
          default:
            this.paramData = null;
            this.paramExportToExcelData = null;
            break;
        }
        if (!!this.paramData || !!this.paramExportToExcelData) { this.printBy = this.securityService.loggedInUser.Employee.FullName; }
      }
      else {
        return;
      }
    }
    catch (exception) {
      console.log(exception);
      this.msgBoxServ.showMessage('error', ['Please check console for error details'])
    }
  }

  // private BillingHandoverGridPrintAndExportSetting(){
  //   if(this.reportFor==""){
  //     try{

  //       let printSettingParameter=JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "BillingHandoverGridPrintSetting").ParameterValue);
  //       let exportToExcelSettingParameter=JSON.parse(this.coreservice.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "BillingHandoverGridExportToExcelSetting").ParameterValue);
  //       if(!!printSettingParameter || !!exportToExcelSettingParameter){
  //          this.paramData=null;
  //          this.paramExportToExcelData=null;
  //         switch (this.router.url) {

  //           case "/Billing/BillingDenomination/DailyCollectionVsHandoverReport": {
  //             if(!!printSettingParameter)this.paramData=printSettingParameter["DailyCollectionVsHandoverReport"];
  //             if(!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["DailyCollectionVsHandoverReport"]
  //             break;
  //           }
  //           case "/Billing/BillingDenomination/HandoverSummaryReport": {
  //             if(!!printSettingParameter)this.paramData=printSettingParameter["SummaryReport"];
  //             if(!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["SummaryReport"]
  //             break;
  //           }
  //           case "/Billing/BillingDenomination/HandoverReceiveTransactionReport": {
  //             if(!!printSettingParameter)this.paramData=printSettingParameter["ReceiveTransactionReport"];
  //             if(!!exportToExcelSettingParameter) this.paramExportToExcelData = exportToExcelSettingParameter["ReceiveTransactionReport"]
  //             break;
  //           }

  //           default:
  //             this.paramData=null;
  //             this.paramExportToExcelData = null;
  //               break;
  //       }
  //       if(!!this.paramData || !!this.paramExportToExcelData){this.printBy=this.securityService.loggedInUser.Employee.FullName;}
  //       }
  //       else{
  //         return;
  //       }
  //     }
  //     catch(exception){
  //       console.log(exception);
  //       this.msgBoxServ.showMessage('error',['Please check console for error details'])
  //     }

  //   }

  // }

  GetHeaderParameter(reportFor) {
    if (reportFor == 'pharmacy') {
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "Pharmacy Receipt Header").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
    else if (reportFor == 'billing') {
      var customerHeaderparam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (customerHeaderparam != null) {
        var customerHeaderParamValue = customerHeaderparam.ParameterValue;
        if (customerHeaderParamValue) {
          this.headerDetail = JSON.parse(customerHeaderParamValue);
          var headerParamValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "BillingReport" && a.ParameterName == "BillingReportHeader");
          if (headerParamValue != null) {
            var paramValue = headerParamValue.ParameterValue;
            if (paramValue) {
              var headerParams = JSON.parse(paramValue);
              this.headerDetailParam.showPANNo = headerParams.showPan;
              this.headerDetailParam.showPhoneNumber = headerParams.showPhoneNumber;
            }
          }
        }


      } else
        this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
    else if (reportFor == 'lab') {
      var customerHeaderparam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (customerHeaderparam != null) {
        var customerHeaderParamValue = customerHeaderparam.ParameterValue;
        if (customerHeaderParamValue) {
          this.headerDetail = JSON.parse(customerHeaderParamValue);
          var headerParamValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "LabReport" && a.ParameterName == "LabReportHeader");
          if (headerParamValue != null) {
            var paramValue = headerParamValue.ParameterValue;
            if (paramValue) {
              var headerParams = JSON.parse(paramValue);
              this.headerDetailParam.showPANNo = headerParams.showPan;
              this.headerDetailParam.showPhoneNumber = headerParams.showPhoneNumber;
            }
          }
        }
      } else
      this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
   
    else if (reportFor == 'accounting') {
      var customerHeaderparam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (customerHeaderparam != null) {
        var customerHeaderParamValue = customerHeaderparam.ParameterValue;
        if (customerHeaderParamValue) {
          this.headerDetail = JSON.parse(customerHeaderParamValue);
        }
      } else
        this.msgBoxServ.showMessage("error", ["Error getting parameters"]);

    }
    else if (reportFor == 'MRReport') {
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
      else
        this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
    else if (reportFor == 'systemadmin') {
      var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader").ParameterValue;
      if (paramValue)
        this.headerDetail = JSON.parse(paramValue);
        var headerParamValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "SystemAdminReport" && a.ParameterName == "SystemAdminReportHeader");
        if (headerParamValue != null) {
          var paramValue = headerParamValue.ParameterValue;
          if (paramValue) {
            var headerParams = JSON.parse(paramValue);
            this.headerDetailParam.showPANNo = headerParams.showPan;
            this.headerDetailParam.showPhoneNumber = headerParams.showPhoneNumber;
          }
        }
      else
        this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
    else if (reportFor == 'admission') {
      var customerHeaderparam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (customerHeaderparam != null) {
        var customerHeaderParamValue = customerHeaderparam.ParameterValue;
        if (customerHeaderParamValue) {
          this.headerDetail = JSON.parse(customerHeaderParamValue);
        }
      } else
      this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
    else if (reportFor == 'appointment') {
      var customerHeaderparam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (customerHeaderparam != null) {
        var customerHeaderParamValue = customerHeaderparam.ParameterValue;
        if (customerHeaderParamValue) {
          this.headerDetail = JSON.parse(customerHeaderParamValue);
        }
      } else
      this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
    else {
      this.headerDetail = '';
      // var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "Pharmacy BillingHeader").ParameterValue;
      // if (paramValue)
      //   this.headerDetail = JSON.parse(paramValue);
      // else
      //   this.msgBoxServ.showMessage("error", ["Error getting parameters"]);
    }
  }
}
