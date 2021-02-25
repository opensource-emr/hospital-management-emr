import { Component, Directive, ViewChild } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';
import { DatabaseLogModel } from '../shared/database-log.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DLService } from "../../shared/dl.service";

@Component({
  templateUrl: "../../view/system-admin-view/DatabaseBackup.html" // "/SystemAdminView/DatabaseBackup"
})

export class DatabaseBackupComponent {

  //All variable declaration and defination;
  public model: DatabaseLogModel = new DatabaseLogModel();       //local variable of DatabaseLog class (model)
  public lastDBBackupDetail: DatabaseLogModel = new DatabaseLogModel();
  public exportFileFolderPath: string = null;
  public showDBRestoreWaitMsg: boolean = false;
  public showHideDBLogGrid: boolean = false;
  public databaseBackupGridColumns: Array<any> = null;           //public array variable for log grid column
  public showRestoreConfirmationPopup: boolean = false;          //public flab variable for show and hide database backup restore confirmation popup windows
  public showRestoreDBReason: boolean = false;                   //public flag variable for show and hide restore database reason textbox
  public databaseBackupList: Array<DatabaseLogModel> = new Array<DatabaseLogModel>();
  public loading: boolean = false;                           //public variable (any type) for database log details binding
  public IsContinueRestore: boolean = false;
  public SysAdmin: Array<any> = new Array<any>();

  //Constructor of class       
  constructor(public dlService: DLService, public systemAdminBLService: SystemAdminBLService, public msgBoxServ: MessageboxService) {
    this.databaseBackupGridColumns = GridColumnSettings.DataBaseBakupLog;
    this.GetDBBakupLog();
    this.showRestoreConfirmationPopup = false;
    this.showRestoreDBReason = false
    this.loading = false;
    this.showHideDBLogGrid = false;
    this.showDBRestoreWaitMsg = false;
    this.SystemAdmin();
  }


  // method to get SysAdmin_Parameters table data
  SystemAdmin() {
    this.systemAdminBLService.GetSystemAdmin().subscribe(res => {
      if (res.Status == 'OK') {
        this.SysAdmin = res.Results;
      }
    });
  }
  //Method call for take Database backup in locally directory
  Backup(): void {
    this.loading = true;
    this.showDBRestoreWaitMsg = true;
    this.systemAdminBLService.TakeDatabaseBackup().
      subscribe(res => {
        if (res.Status == 'OK') {
          this.msgBoxServ.showMessage("success", ['Database backup is done successfully.']);
          this.GetDBBakupLog();
          this.loading = false;
          this.showDBRestoreWaitMsg = false;
        }
        else if (res.Status == 'Failed') {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          this.loading = false;
          this.showDBRestoreWaitMsg = false;
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to take database backup.']);
          this.loading = false;
          this.showDBRestoreWaitMsg = false;
        });

  }

  //Get all Database backup and restore log details
  GetDBBakupLog(): void {
    this.systemAdminBLService.GetDBBakupLog().
      subscribe(res1 => {
        let res = res1;

        if (res.Status == 'OK') {
          this.databaseBackupList = res.Results;
          if (res.Results != null && res.Results.length > 0) {
            this.LastDBBackupDetailsBind(this.databaseBackupList);
          }
        }
        else if (res.Status == 'Failed') {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to take database backup Log.']);
        });
  }


  //Action for restore database
  PostRestoreDatabase(): void {
    if (this.lastDBBackupDetail != null && this.lastDBBackupDetail.IsDBRestorable == true) {
      this.loading = true;
      this.showRestoreConfirmationPopup = true;
    }
    else {
      this.msgBoxServ.showMessage("notification", ['There is not any backup to restore.']);
    }
  }
  //Close Restore Database Confirmation popup
  Close(): void {
    this.showRestoreConfirmationPopup = false;
    this.showRestoreDBReason = false;
    this.loading = false;
  }
  //Continue restore database
  ContinueRestore(): void {
    this.showRestoreDBReason = true;
  }
  //This method for restore database
  RestoreDatabase(): void {
    //check validation
    for (var i in this.model.DBLogValidator.controls) {
      this.model.DBLogValidator.controls[i].markAsDirty();
      this.model.DBLogValidator.controls[i].updateValueAndValidity();
    }
    if (this.model.IsValidCheck(undefined, undefined)) {
      this.showDBRestoreWaitMsg = true;
      //here is all logic code fro restore database
      this.lastDBBackupDetail.Remarks = this.model.Remarks;
      this.systemAdminBLService.RestoreDatabase(this.lastDBBackupDetail).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.msgBoxServ.showMessage("success", ['Database restore successfully.']);
            this.GetDBBakupLog();
            this.Close();
            this.loading = false;
            this.showDBRestoreWaitMsg = false;
          }
          else if (res.Status == 'Failed') {
            this.loading = false;
            this.showDBRestoreWaitMsg = false;
            this.Close();
            this.GetDBBakupLog();
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          }
        },
          err => {

            this.loading = false;
            this.showDBRestoreWaitMsg = false;
            this.Close();
            this.GetDBBakupLog();
            this.msgBoxServ.showMessage("error", ['Failed to restore database, Please try again.']);
          });
      this.GetDBBakupLog();
    }

  }
  //This method usefull for show or hide Database log details
  ToggleDBLogDetails(action: any): void {
    this.showHideDBLogGrid = action == 'show' ? true : false;
  }
  //this method get last db backup details and bind it
  LastDBBackupDetailsBind(databaseBackupList: Array<DatabaseLogModel>): void {
    if (databaseBackupList != null && databaseBackupList.length > 0) {
      this.lastDBBackupDetail = databaseBackupList.find(a => a.IsDBRestorable == true);
      if (this.lastDBBackupDetail) {
        this.lastDBBackupDetail.CreatedOn = moment(this.lastDBBackupDetail.CreatedOn).format('DD-MMM-YYYY hh:mm A');
      }

    } else {
      this.msgBoxServ.showMessage("error", ['There is no backup found.']);
    }

  }
  //Export Database as CSV and XML file format 
  //Export XML or CSV as per click action 
  //we are using one method but there are two sp for export csv and xml
  ExportDBToCSVOrXmlOrPdf(exportType): void {
    if (exportType) {
      this.loading = true;
      this.showDBRestoreWaitMsg = true;
      //NBB - Export to PDF
      //SQL server directly export CSV, xml files but not pdf
      //so we are using FreeSpire.xls for csv to pdf conversion
      //Process
      ///-First export db to csv
      //-by using freespire.xls convert all csv files to pdf
      //conversion done at server side
      this.systemAdminBLService.ExportDBToCSVOrXmlOrPdf(exportType).
        subscribe(res => {
          if (res.Status == 'OK') {
            // this.exportFileFolderPath = 'Exported Directory => ' + res.Results;
            this.msgBoxServ.showMessage("success", [res.Results]);
            this.msgBoxServ.showMessage("success", ['Database export done successfully.']);
            this.loading = false;
            this.showDBRestoreWaitMsg = false;
          }
          else if (res.Status == 'Failed') {
            //uncomment below line
            // this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            //remove beow line when uncommented above line
            this.msgBoxServ.showMessage("success", ['Database export done successfully.']);
            this.loading = false;
            this.showDBRestoreWaitMsg = false;
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ['Failed to Export Database']);
            this.loading = false;
            this.showDBRestoreWaitMsg = false;
          });
    } else {
      this.msgBoxServ.showMessage("notice", ['Please select export type']);
    }
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'DatabaseBackupLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
  };

}
