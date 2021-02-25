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
  @Input("grid-showExport")
  public showExport: boolean = false;

  @Input("grid-showExportNew")
  public showExportNew: boolean = false;

  @Input("grid-showPrint")
  public showPrint: boolean = false;

  public rowData: any[];
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

  public datePref: string = "";
  static colIdObj = {};
  constructor(
    public searchService: SearchService,
    public changeDetector: ChangeDetectorRef,
    public coreservice: CoreService
  ) {
    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.showGrid = true;
    this.searchMinTxtLeng = +this.searchService.getSerachCharLength() + 1;
  }

  ngOnInit() {
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
    let popupWinindow;
    if (!this.reportHeader || this.reportHeader.trim() == "") {
      this.reportHeader = "Report Data";
    }
    var printContents =
      this.reportHeader +
      "<style> table { border-collapse: collapse; border-color: black;font-size: 11px; } th { color:black; background-color: #599be0; } </style>";
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
    console.log(this.resizeColumnToFit);

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
          ) : "" );
        } else {
          return ((params.node.data[colId] && params.node.data[colId].trim() != "") ? NepaliCalendarService.ConvertEngToNepaliFormatted_static(
            params.node.data[colId],
            "YYYY-MM-DD"
          ) : "" );
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
      skipHeader: false,
      columnKeys: this.exportOptions.displayColumns,
      fileName: this.exportOptions.fileName,
    };

    this.gridOptions.api.exportDataAsCsv(params);
  }

  ExportToExcel_New($event) {
    let emitObj = new GridEmitModel();
    emitObj.Action = "Dharam";
    this.onGridExport.emit(emitObj);
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

}
