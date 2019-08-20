using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.HelpdeskModels;
using DanpheEMR.ServerModel.ReportingModels;
using System.Data.SqlClient;
using System.Data;
using Newtonsoft.Json;

namespace DanpheEMR.DalLayer
{
    public class HelpdeskDbContext : DbContext
    {
        private string connStr = null;
        public DbSet<EmployeeInfoModel> EmployeeInfo { get; set; }
        public DbSet<BedInformationModel> BedInfo { get; set; }
        public DbSet<WardInformationModel> WardInfo { get; set; }
        public HelpdeskDbContext(string conn) : base(conn)
        {
            connStr = conn;
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }
        public List<EmployeeInfoModel> GetEmployeeInfo()

        {
            var Data = Database.SqlQuery<EmployeeInfoModel>("SP_Report_HDSK_EmployeeInfo ");
            return Data.ToList<EmployeeInfoModel>();
        }
        //below two storedprocs needs to be changed, they're not updated after ADT module was updated.--sud:16Aug'17
        #region GetData From stored procedure
        private DataSet GetDatasetFromStoredProc(string storedProcName, List<SqlParameter> ipParams, string connString)
        {
            // creates resulting dataset
            var result = new DataSet();
            var context = new HelpdeskDbContext(connString);
            // creates a Command 
            var cmd = context.Database.Connection.CreateCommand();
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = storedProcName;

            if (ipParams != null && ipParams.Count > 0)
            {
                foreach (var param in ipParams)
                {
                    cmd.Parameters.Add(param);
                }
            }

            try
            {
                // executes
                context.Database.Connection.Open();
                var reader = cmd.ExecuteReader();

                // loop through all resultsets (considering that it's possible to have more than one)
                do
                {
                    // loads the DataTable (schema will be fetch automatically)
                    var tb = new DataTable();
                    tb.Load(reader);
                    result.Tables.Add(tb);

                } while (!reader.IsClosed);

                return result;
            }
            finally
            {
                // closes the connection
                context.Database.Connection.Close();
            }

        }

        #endregion

        public DynamicReport GetBedInformation()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();

            DataSet data = GetDatasetFromStoredProc("sp_BedInformation", paramsList, this.connStr);
            DynamicReport dReport = new DynamicReport();
            //return an anonymous type - when mutliple table are received
            var bedinfo = new
            {
                LabelData = data.Tables[0],
                BedList = data.Tables[1]
            };
            dReport.Schema = null;
            dReport.JsonData = JsonConvert.SerializeObject(bedinfo);
            return dReport;
        }
        public List<WardInformationModel> GetWardInformation()
        {
            var Data = Database.SqlQuery<WardInformationModel>("sp_WardInformation");
            return Data.ToList<WardInformationModel>();
        }

        #region Bed feature Report
        public DataTable BedFeatureReprot()
        {
           
            DataTable bedfeature = DALFunctions.GetDataTableFromStoredProc("ADT_BedFeature", this);
            return bedfeature;
        }
        #endregion

    }
}
