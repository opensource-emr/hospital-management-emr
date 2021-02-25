using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.CommonTypes;
using DanpheEMR.Utilities;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using System.Data.SqlClient;
using System.Data;
using DanpheEMR.Core;
//using DanpheEMR.Core.Parameters;
using DanpheEMR.Security;
using System.IO;
using System.Drawing;
using iTextSharp.text;
using iTextSharp.text.pdf;
using DanpheEMR.ServerModel.SystemAdminModels;
using System.Data.Entity;


// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{


    public class SystemAdminController : CommonController
    {

        //private readonly string connString = null;
        //private new string connStringAdmin = null;
        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        public SystemAdminController(IOptions<MyConfiguration> _config) : base(_config)
        {

            //this.connStringAdmin = _config.Value.ConnectionStringAdmin;
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
        }
        // GET api/values/5
        [HttpGet]
        public string Get(string reqType, DateTime FromDate, DateTime ToDate, string LogType, string Table_Name,string UserName, string ActionName)
        {
            DanpheHTTPResponse<List<object>> responseData = new DanpheHTTPResponse<List<object>>();
            DanpheHTTPResponse<object> responseDataObj = new DanpheHTTPResponse<object>();
           
            try
            {
               
                RbacDbContext rbacDbContext = new RbacDbContext(connString);

                if (reqType == "getDBBakupLog")
                {
                    SystemAdminDbContext systemAdminDbContext = new SystemAdminDbContext(this.connStringAdmin);
                    var result = (from dbBackupLog in systemAdminDbContext.DatabaseLog
                                  orderby dbBackupLog.CreatedOn descending
                                  select new
                                  {
                                      CreatedOn = dbBackupLog.CreatedOn,
                                      FileName = dbBackupLog.FileName,
                                      DatabaseName = dbBackupLog.DatabaseName,
                                      DatabaseVersion = dbBackupLog.DatabaseVersion,
                                      Action = dbBackupLog.Action,
                                      Status = dbBackupLog.Status,
                                      MessageDetail = dbBackupLog.MessageDetail,
                                      FolderPath = dbBackupLog.FolderPath,
                                      IsActive = dbBackupLog.IsActive,
                                      IsDBRestorable = dbBackupLog.IsDBRestorable
                                  }
                                  ).ToList<object>();
                    responseData.Results = result;
                    responseData.Status = "OK";
                }
                    #region DanpheAuditTrail Details 
                else if (reqType == "get-audit-trail-details")
                {
                    ReportingDbContext dbContext = new ReportingDbContext(this.connStringAdmin);
                    //DanpheHTTPResponse<DataTable> resData = new DanpheHTTPResponse<DataTable>();
                     DataTable res = dbContext.AuditTrails(FromDate, ToDate, Table_Name, UserName, ActionName);

                    responseDataObj.Results = res;
                    responseDataObj.Status = "OK";
                    return DanpheJSONConvert.SerializeObject(responseDataObj, true);
                }
                #endregion
                #region DanpheAuditList Details 
                else if (reqType == "get-audit-list")
                {
                    ReportingDbContext dbContext = new ReportingDbContext(this.connStringAdmin);
                    SystemAdminDbContext systemAdminDbContext = new SystemAdminDbContext(this.connStringAdmin);

                    var userList = (from rbac in rbacDbContext.Users
                                    select new
                                    {
                                        UserName = rbac.UserName
                                    }).ToList<object>();
                  
                   var tableNameList = dbContext.AuditTrailList().Select(s=> new { Table_Name = s.Table_Name }).ToList();

                    var tableDisplayNameMappingList = systemAdminDbContext.AuditTableDisplayNames
                        .Where(t => t.IsActive == true)
                        .Select(t => new { TableDisplayName = t.DisplayName, Table_Name = t.TableName }).ToList();

                    responseDataObj.Results = new
                    {
                        UserList =userList,
                        TableNameList =tableNameList,
                        TableDisplayNameMap = tableDisplayNameMappingList
                    };
                                    
                    responseDataObj.Status = "OK";
                    return DanpheJSONConvert.SerializeObject(responseDataObj, true);
                }
                #endregion
                else if (reqType == "get-login-info")
                {
                    SystemAdminDbContext systemAdminDbContext = new SystemAdminDbContext(this.connStringAdmin);

                    var loginList = systemAdminDbContext.LoginInformation
                        .Where(log => DbFunctions.TruncateTime(log.CreatedOn) >= FromDate && DbFunctions.TruncateTime(log.CreatedOn) <= ToDate).ToList();

                    responseDataObj.Status = "OK";
                    responseDataObj.Results = loginList;
                    return DanpheJSONConvert.SerializeObject(responseDataObj, true);
                }
                else if (reqType == "getIRDInvoiceDetails")
                {
                    //We are calling from ReportingDbContext because of problem from admin db context
                    ReportingDbContext dbContext = new ReportingDbContext(this.connString);
                    List<InvoiceDetailsModel> res = dbContext.InvoiceDetails(FromDate, ToDate);        
                    DanpheHTTPResponse<List<InvoiceDetailsModel>> resData = new DanpheHTTPResponse<List<InvoiceDetailsModel>>();
                    resData.Results = res;
                    resData.Status = "OK";
                    return DanpheJSONConvert.SerializeObject(resData, true);
                }
                else if (reqType == "getPhrmIRDInvoiceDetails")
                {
                    ReportingDbContext dbContext = new ReportingDbContext(this.connString);
                    List<PhrmInvoiceDetails> res = dbContext.PhrmInvoiceDetails(FromDate, ToDate);
                    DanpheHTTPResponse<List<PhrmInvoiceDetails>> resData = new DanpheHTTPResponse<List<PhrmInvoiceDetails>>();
                    resData.Results = res;
                    resData.Status = "OK";
                    return DanpheJSONConvert.SerializeObject(resData, true);
                }
                else if (reqType == "getDbActivityLogDetails")
                {
                    //use admin-db's connection string to get db-activity log
                    ReportingDbContext dbContext = new ReportingDbContext(this.connStringAdmin);
                    DanpheHTTPResponse<List<SqlAuditModel>> resData = new DanpheHTTPResponse<List<SqlAuditModel>>();
                    List<SqlAuditModel> res = dbContext.SqlAuditDetails(FromDate, ToDate, LogType);
                    resData.Results = res;
                    resData.Status = "OK";
                    return DanpheJSONConvert.SerializeObject(resData, true);
                }
                else if (reqType != null && reqType == "get-system-admin")
                {
                    try
                    {
                        SystemAdminDbContext dbContext = new SystemAdminDbContext(connStringAdmin);
                        var results = (from parameters in dbContext.AdminParameters
                                          orderby parameters.ParameterId
                                          select new
                                          {
                                              ParameterId = parameters.ParameterId,
                                              ParameterGroupName = parameters.ParameterGroupName,
                                              ParameterName  = parameters.ParameterName,
                                              ParameterValue = parameters.ParameterValue,
                                              ValueDataType = parameters.ValueDataType,
                                              Description = parameters.Description
                                          }).ToList<object>();
                                          

                        responseData.Status = "OK";
                        responseData.Results = results;
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        // POST api/values
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";
            //string ipDataString = Request.Form.Keys.First<string>();

            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                string ExportType = this.ReadQueryStringData("ExportType");
                SystemAdminDbContext systemAdmindbContext = new SystemAdminDbContext(connStringAdmin);
                #region Database Backup functionality

                if (reqType == "databaseBackup")
                {
                    //Transaction Begin
                    using (var dbContextTransaction = systemAdmindbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //Check Backup Folder is present or not in local system
                            if (CheckBackupFolderPath())
                            {
                                int todayDBBackup = CheckTodaysBackup();
                                SystemAdminDbContext systemAdminDbContext = new SystemAdminDbContext(connStringAdmin);
                                int todaysDBBackupFrequency = Convert.ToInt32((from parameters in systemAdminDbContext.AdminParameters
                                                                               where parameters.ParameterName == "DaillyDBBackupLimit"
                                                                               select parameters.ParameterValue
                                                                   ).SingleOrDefault());
                                if (todayDBBackup >= todaysDBBackupFrequency)
                                {
                                    responseData.Status = "Failed";
                                    responseData.ErrorMessage = "Today You have already taken " + todaysDBBackupFrequency + "DB backup";
                                }
                                else
                                {
                                    //Backup Database with local directory                    
                                    if (BackupDatabase(connStringAdmin))
                                    {
                                        if (DeleteOldBackupFiles(connStringAdmin))
                                        {
                                            responseData.Status = "OK";
                                            responseData.Results = 1;
                                            dbContextTransaction.Commit();
                                        }
                                        else
                                        {
                                            responseData.Status = "Failed";
                                            responseData.ErrorMessage = "Backup Files deleting Error";
                                            dbContextTransaction.Rollback();
                                        }
                                    }
                                    else
                                    {
                                        responseData.Status = "Failed";
                                        responseData.ErrorMessage = "Database Backup failed, Please try again";
                                    }
                                }
                            }
                            else
                            {
                                responseData.Status = "Failed";
                                responseData.ErrorMessage = "Please create Directory(folder) first for Backup.";
                            }
                            //Commit Transaction
                            //dbContextTransaction.Commit();
                        }
                        catch (Exception ex)
                        {
                            //Rollback all transaction if exception occured
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
                }
                #endregion
                #region Database Restore Functionality 
                else if (reqType == "databaseRestore")
                {
                    string dataString = this.ReadPostData();
                    DatabaseLogModel dbBackupLogDataFromClient = DanpheJSONConvert.DeserializeObject<DatabaseLogModel>(dataString);
                    string backupDBFilePath = dbBackupLogDataFromClient.FolderPath + dbBackupLogDataFromClient.FileName;
                    string backupDBFileVersion = dbBackupLogDataFromClient.DatabaseVersion;
                    //Transaction Begin
                    using (var dbContextTransaction = systemAdmindbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //Boolean x = System.IO.File.Exists("");
                            //Check backup file is exist or not for restore                         
                            if (System.IO.File.Exists(backupDBFilePath))
                            {
                                //check Backup dbfile and current database version compatibility
                                if (CheckDBVersionForRestore(backupDBFileVersion))
                                {
                                    //first take backup of Database then restore
                                    BackupDatabase(connStringAdmin);
                                    //Restore database
                                    if (RestoreDatabase(connStringAdmin, dbBackupLogDataFromClient))
                                    {
                                        responseData.Status = "OK";
                                        responseData.Results = 1;
                                        dbContextTransaction.Commit();
                                    }
                                    else
                                    {
                                        responseData.Status = "Failed";
                                        responseData.ErrorMessage = "Database restore failed, Please try again";
                                        dbContextTransaction.Rollback();
                                    }
                                }
                                else
                                {

                                    responseData.Status = "Failed";
                                    responseData.ErrorMessage = "Version is not compatible for Restore.";
                                }
                            }
                            else
                            {
                                responseData.Status = "Failed";
                                responseData.ErrorMessage = "There is no backup file for restore, Please Try again.";
                            }
                        }
                        catch (Exception ex)
                        {
                            //Rollback all transaction if exception occured
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }
                }
                #endregion
                #region Database Export as CSV/XML/pdf files
                else if (reqType != null && reqType == "exportDBToCSVOrXMLOrPDF")
                {
                    try
                    {
                        if (!String.IsNullOrEmpty(ExportType))
                        {
                            CoreDbContext coreDBContext = new CoreDbContext(connString);
                            //get local export file path for export files and send to user also
                            string ExportedFilePath = (from parameter in coreDBContext.Parameters
                                                       where parameter.ParameterName == "DBExportCSVXMLDirPath"
                                                       select parameter.ParameterValue
                                                 ).SingleOrDefault();
                            //Call function to complete Export database functionality                                               
                            if (ExportDatabaseToCSVOrXMLOrPDF(connString, ExportType, ExportedFilePath))
                            {
                                responseData.Status = "OK";
                                responseData.Results = ExportedFilePath;
                            }
                            else
                            {
                                responseData.Status = "Failed";
                                responseData.ErrorMessage = "Failed to Export Database as " + ExportType;
                            }
                        }
                        else
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = "Please select export file type as  " + ExportType;
                        }
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
                #endregion
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "request type is incorrect.";
                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            return "value";
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        #region Check Backup directory is Exist or Not        
        private Boolean CheckBackupFolderPath()
        {
            try
            {
                SystemAdminDbContext systemAdminDbContext = new SystemAdminDbContext(connStringAdmin);
                string databaseBackupFolderPath = (from parameters in systemAdminDbContext.AdminParameters
                                                   where parameters.ParameterName == "DbBackupFolderPath"
                                                   select parameters.ParameterValue
                                                   ).SingleOrDefault();
                if (!Directory.Exists(databaseBackupFolderPath))//check directory is existed or not if not then create one
                {
                    System.IO.Directory.CreateDirectory(databaseBackupFolderPath);
                }
                return System.IO.Directory.Exists(databaseBackupFolderPath) == true ? true : false;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Check File is exist or not for restore     
        private Boolean CheckDBBackupFileExist(string filePath)
        {
            try
            {
                return System.IO.Directory.Exists(filePath) == true ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Check Backup file database version and current database versin is compatible or not for restore
        private Boolean CheckDBVersionForRestore(string backupFileVersion)
        {
            try
            {
                SystemAdminDbContext systemAdminDbContext = new SystemAdminDbContext(connStringAdmin);
                string dbCurrentVersion = (from parameters in systemAdminDbContext.AdminParameters
                                           where parameters.ParameterName == "DatabaseCurrentVersion"
                                           select parameters.ParameterValue
                                                   ).SingleOrDefault();

                return dbCurrentVersion == backupFileVersion ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Take Database Backup
        //This method used for fire stored procedure and do database backup
        private Boolean BackupDatabase(string connStringAdmin)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(connStringAdmin))
                {
                    
                    using (SqlCommand cmd = new SqlCommand("SP_SysADM_Backup_Database", con))
                    {
                        cmd.CommandTimeout = 300;// 5 minute for this command to copy the patientfiles while doing DB backup 
                        //Get Current Loggedin user via session                      
                        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        int CreatedBy = currentUser.EmployeeId;
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add("@CreatedBy", SqlDbType.Int).Value = CreatedBy;
                        cmd.Parameters.Add("@ActionType", SqlDbType.VarChar).Value = "manual";
                        con.Open();
                        string result = (string)cmd.ExecuteScalar();
                        return result == "success" ? true : false;
                    }
                }
                //return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Restore database file 
        private Boolean RestoreDatabase(string connStringAdmin, DatabaseLogModel dbBackupLogDataFromClient)
        {
            try
            {
                using (SqlConnection conAdmin = new SqlConnection(connStringAdmin))
                {
                    conAdmin.Open();
                    using (SqlConnection conDanpheEMRLive = new SqlConnection(connString))
                    {
                        string backupFilePath = dbBackupLogDataFromClient.FolderPath + dbBackupLogDataFromClient.FileName;
                        conDanpheEMRLive.Open();

                        //set db single user mode
                        string sqlSetSingleUserModeQuery = string.Format("ALTER DATABASE [" + dbBackupLogDataFromClient.DatabaseName + "] SET SINGLE_USER WITH ROLLBACK IMMEDIATE");
                        SqlCommand sqlCmdSingleUserMode = new SqlCommand(sqlSetSingleUserModeQuery, conDanpheEMRLive);
                        sqlCmdSingleUserMode.ExecuteNonQuery();

                        //Restore Database
                        string sqlRestoreDBQuery = "USE MASTER RESTORE DATABASE [" + dbBackupLogDataFromClient.DatabaseName + "] FROM DISK='" + backupFilePath + "'WITH REPLACE;";
                        SqlCommand sqlCmdRestoreDB = new SqlCommand(sqlRestoreDBQuery, conDanpheEMRLive);
                        sqlCmdRestoreDB.ExecuteNonQuery();

                        //set db multi user mode
                        string sqlSetMultiUserModeQuery = string.Format("ALTER DATABASE [" + dbBackupLogDataFromClient.DatabaseName + "] SET MULTI_USER");
                        SqlCommand sqlCmdMultiUserMode = new SqlCommand(sqlSetMultiUserModeQuery, conDanpheEMRLive);
                        sqlCmdMultiUserMode.ExecuteNonQuery();

                        //updating client dbLog info for insert as restore database type                     
                        dbBackupLogDataFromClient.IsDBRestorable = false;
                        dbBackupLogDataFromClient.Action = "restore";
                        dbBackupLogDataFromClient.ActionType = "manual";
                        dbBackupLogDataFromClient.Status = "success";
                        dbBackupLogDataFromClient.MessageDetail = "Database restore successfully";
                        dbBackupLogDataFromClient.IsActive = false;
                        //Insert restore successfully log 
                        Boolean dbLogResult = PostDBLog(connStringAdmin, dbBackupLogDataFromClient);
                        return dbLogResult == true ? true : false;

                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;

            }
        }
        #endregion
        #region Delete all old Database Backup file and Update Status of DatabaseBackup log
        private Boolean DeleteOldBackupFiles(string connStringAdmin)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(connStringAdmin))
                {
                    using (SqlCommand cmd = new SqlCommand("SP_SysADM_Delete_DatabaseBackup", con))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        con.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Check Todays Number of Backup
        private int CheckTodaysBackup()
        {
            try
            {
                SystemAdminDbContext systemAdmindbContext = new SystemAdminDbContext(connStringAdmin);
                var dbBackupLog = (from dblog in systemAdmindbContext.DatabaseLog
                                   where dblog.CreatedOn.Value.Year == System.DateTime.Now.Year
                                         && dblog.CreatedOn.Value.Month == System.DateTime.Now.Month
                                          && dblog.CreatedOn.Value.Day == System.DateTime.Now.Day && dblog.Action == "backup" && dblog.Status == "success"
                                   select dblog
                                          ).ToList();
                int count = dbBackupLog.Count();
                //We are taking only 3 backup for day
                return count;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region This method for insert SystemAdmin Dtabase Log related -Database backup, restore, delete and also error handling
        private Boolean PostDBLog(string connStringAdmin, DatabaseLogModel databaseLogModel)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(connStringAdmin))
                {
                    using (SqlCommand cmd = new SqlCommand("SP_SysADM_Insert_DBLog", con))
                    {
                        //Get Current Loggedin user via session                      
                        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                        databaseLogModel.CreatedBy = currentUser.EmployeeId;
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.Add("@FileName", SqlDbType.VarChar).Value = databaseLogModel.FileName;
                        cmd.Parameters.Add("@FolderPath", SqlDbType.VarChar).Value = databaseLogModel.FolderPath;
                        cmd.Parameters.Add("@DatabaseName", SqlDbType.VarChar).Value = databaseLogModel.DatabaseName;
                        cmd.Parameters.Add("@DatabaseVersion", SqlDbType.VarChar).Value = databaseLogModel.DatabaseVersion;
                        cmd.Parameters.Add("@IsDBRestorable", SqlDbType.Bit).Value = databaseLogModel.IsDBRestorable;
                        cmd.Parameters.Add("@Action", SqlDbType.VarChar).Value = databaseLogModel.Action;
                        cmd.Parameters.Add("@ActionType", SqlDbType.VarChar).Value = databaseLogModel.ActionType;
                        cmd.Parameters.Add("@Status", SqlDbType.VarChar).Value = databaseLogModel.Status;
                        cmd.Parameters.Add("@MessageDetail", SqlDbType.VarChar).Value = databaseLogModel.MessageDetail;
                        cmd.Parameters.Add("@Remarks", SqlDbType.VarChar).Value = databaseLogModel.Remarks;
                        cmd.Parameters.Add("@CreatedBy", SqlDbType.Int).Value = databaseLogModel.CreatedBy;
                        cmd.Parameters.Add("@IsActive", SqlDbType.Bit).Value = databaseLogModel.IsActive;
                        con.Open();
                        cmd.ExecuteNonQuery();
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Export Database to CSV / XML /pdf file format
        private Boolean ExportDatabaseToCSVOrXMLOrPDF(string connString, string ExportType, string exportedFilePath)
        {
            try
            {
                string directoryPath = exportedFilePath + "\\" + ExportType + "\\";
                //check directory is exists or not- if not then create directory
                if (!Directory.Exists(directoryPath))
                {
                    System.IO.Directory.CreateDirectory(directoryPath);
                }
                else if (ExportType == "PDF")//Only delete old files if export is pdf, no need to delete csv, xml file 
                {
                    //delete all files if directory is there
                    DirectoryInfo directory = new DirectoryInfo(directoryPath);
                    directory.GetFiles().ToList().ForEach(f => f.Delete());
                }


                if (ExportType == "PDF")//export to pdf
                {
                    SaveTablesToPdf(connString, exportedFilePath);
                }
                else
                {
                    using (SqlConnection con = new SqlConnection(connString))
                    {
                        string SPName = (ExportType == "CSV") ? "SP_ExportDBToCSV" : "SP_ExportDBToXML";//else it's xml export type
                        using (SqlCommand cmd = new SqlCommand(SPName, con))
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            con.Open();
                            int result = cmd.ExecuteNonQuery();
                        }
                    }

                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region iTextSharp library used for- Save every database table as seperate pdf file 
        private void SaveTablesToPdf(string connString, string exportedFilePath)
        {
            try
            {
                //Create font for Page Heading - Now we are using table name as page heading
                iTextSharp.text.Font fntTableFontHeading = FontFactory.GetFont(BaseFont.TIMES_ROMAN, 8, iTextSharp.text.Font.BOLD, BaseColor.BLUE);
                //Create font for table header
                iTextSharp.text.Font fntTableFontHdr = FontFactory.GetFont(BaseFont.TIMES_ROMAN, 6, iTextSharp.text.Font.BOLD, BaseColor.WHITE);
                //create font for data
                iTextSharp.text.Font fntTableFont = FontFactory.GetFont(BaseFont.TIMES_ROMAN, 4, iTextSharp.text.Font.NORMAL, BaseColor.BLACK);
                //border color for table- light gray
                var borderColor = iTextSharp.text.BaseColor.LIGHT_GRAY;

                string directoryPath = exportedFilePath + "\\PDF\\";

                SqlConnection con = new SqlConnection(connString);
                //get all table name from database
                SqlDataAdapter TbNameListda = new SqlDataAdapter("SELECT  name FROM sys.tables ", con);
                DataTable TableNameList = new DataTable();
                TbNameListda.Fill(TableNameList);

                if (TableNameList.Rows.Count > 0)
                {
                    foreach (DataRow row in TableNameList.Rows)
                    {
                        var tname = row["name"].ToString();//getting table name
                        SqlDataAdapter da = new SqlDataAdapter("select *from  " + tname, con);
                        DataTable dt = new DataTable();
                        da.Fill(dt);

                        string filename = tname + ".pdf";  //file name same as table name
                        var rowsize = dt.Rows.Count;
                        var columnsize = dt.Columns.Count;
                        int width = 500;//near about 500 is A4 page standard size   
                                        //if 9 columns size will be 500
                        width = (columnsize <= 9) ? width : (columnsize > 9 && columnsize <= 18) ? 1000 : (columnsize > 18 && columnsize <= 27) ? 1500 : (columnsize > 27 && columnsize <= 36) ? 2000 : (columnsize > 36 && columnsize <= 45) ? 2500 : (columnsize > 45) ? 3000 : 3000;
                        var pgSize = new iTextSharp.text.Rectangle(width, 500);  //fix height of page is 500          
                        iTextSharp.text.Document doc = new iTextSharp.text.Document(pgSize, 7, 7, 15, 15);//pagesize(width,height),margin-left,margin-right,margin-top,margin-bottom         
                        PdfWriter wri = PdfWriter.GetInstance(doc, new FileStream(directoryPath + filename, FileMode.Create));
                        doc.Open();
                        PdfPTable myTable = new PdfPTable(columnsize);
                        // Table size is set to 100% of the page
                        myTable.WidthPercentage = 100;
                        myTable.HorizontalAlignment = 0;
                        myTable.SpacingAfter = 0;
                        float[] sglTblHdWidths = new float[columnsize];
                        for (int t = 0; t < columnsize; t++)
                        {
                            sglTblHdWidths[t] = 40f;
                        }

                        // Set the column widths on table creation. Unlike HTML cells cannot be sized.
                        myTable.SetWidths(sglTblHdWidths);

                        //Heading:-adding table name as top row here                   
                        PdfPCell heading = new PdfPCell(new Phrase(tname, fntTableFontHeading));
                        heading.Colspan = columnsize;
                        heading.BorderWidth = iTextSharp.text.Rectangle.NO_BORDER;
                        heading.HorizontalAlignment = Element.ALIGN_LEFT;
                        myTable.AddCell(heading);

                        //Header:-adding all headers here  
                        foreach (DataColumn column in dt.Columns)
                        {
                            PdfPCell headerCell = new PdfPCell(new Phrase(column.ColumnName, fntTableFontHdr));
                            headerCell.BackgroundColor = iTextSharp.text.BaseColor.GRAY;
                            headerCell.HorizontalAlignment = Element.ALIGN_CENTER;
                            headerCell.BorderColor = borderColor;
                            headerCell.BorderWidth =
                            headerCell.Rotation = 0;
                            myTable.AddCell(headerCell);
                        }

                        //adding all rows here dynamically
                        foreach (DataRow r in dt.Rows)
                        {
                            foreach (DataColumn col in dt.Columns)
                            {
                                //var colName = col.ColumnName;
                                //var data = r[colName].ToString();
                                PdfPCell Cell = new PdfPCell(new Phrase(r[col.ColumnName].ToString(), fntTableFont));
                                Cell.Rotation = 0;
                                Cell.BorderColor = borderColor;
                                myTable.AddCell(Cell);
                            }
                        }
                        doc.Add(myTable);
                        doc.Close();

                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
    }
}
