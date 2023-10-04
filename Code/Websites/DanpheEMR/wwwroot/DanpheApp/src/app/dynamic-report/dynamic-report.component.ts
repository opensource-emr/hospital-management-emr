import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { DLService } from '../shared/dl.service';

@Component({
  selector: 'app-dynamic-report',
  templateUrl: './dynamic-report.component.html',
  styleUrls: ['./dynamic-report.component.css']
})
export class DynamicReportComponent implements OnInit {

  public ReportData: Array<any> = new Array<any>();
  public Query: string = null;
  public loading: boolean = false;
  public ReportColumns: Array<any> = new Array<any>();

  constructor(public dlService: DLService, public messageBoxService: MessageboxService) { }

  ngOnInit() {
  }
  LoadReport() {
    if (this.Query == "" || this.Query == null) {
      this.messageBoxService.showMessage('Notice', ['Query missing! Please provide sql query.'])
      return;
    }
    if (this.ValidateQuery(this.Query)) {
      this.loading = true;
      this.dlService.LoadReportData(this.Query).finally(() => this.loading = false).subscribe(res => {
        if (res.Status == "OK") {
          this.ReportData = [];
          let ReportData = res.Results;
          var Columns = [];
          var ReportColumns = [];
          for (var key in ReportData[0]) {
            Columns.push(key);
          }
          for (var column of Columns) {
            var obj = null;
            if (column.toLowerCase().includes('date')) {
              obj = { headerName: column, field: column, width: 150, cellRenderer: DynamicReportComponent.DateFormatter }
            }
            else {
              obj = { headerName: column, field: column, width: 150 }
            }
            ReportColumns.push(obj);
          }
          this.ReportColumns = ReportColumns;
          this.ReportData = res.Results;
        }
        else {
          this.messageBoxService.showMessage('Failed', [res.ErrorMessage]);
          this.ReportData = [];
        }
      },
        err => {
          this.messageBoxService.showMessage('Error', ['Something is wrong with the query! see console log for details']);
          this.ReportData = [];
          console.log(err.error.message);
        });
    }
    else {
      this.messageBoxService.showMessage('Notice', ['Using this feature you can only read data']);
    }

  }
  ValidateQuery(query: string) {
    var keyWords = ["create", "drop", "update", "insert", "alter", "delete", "attach", "detach", "grant", "truncate", "revoke"];
    var queryString = query.toLowerCase();
    for (let keyword of keyWords) {
      var regex = new RegExp('\\b' + keyword + '\\b')
      var valid = regex.test(queryString);
      if (valid) {
        return false;
      }
    }
    return true;
  }

  static DateFormatter(params) {
    let date: string = params.value;
    return moment(date).format('YYYY-MM-DD');
  }
  gridExportOptions = {
    fileName: 'DynamicReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

}

