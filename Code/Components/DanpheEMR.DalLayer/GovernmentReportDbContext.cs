using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ReportingModels;
using System.Data.SqlClient;
using System.Data;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Data.Entity;

namespace DanpheEMR.DalLayer
{
    public class GovernmentReportDbContext : DbContext
    {
        private string connStr = null;

        public GovernmentReportDbContext(string Conn) : base(Conn)
        {
            connStr = Conn;
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        #region Outpatient Services
       

        public DynamicReport GovReportSummary(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsCtrUsrs = DALFunctions.GetDatasetFromStoredProc("SP_Report_Gov_Summary", paramsList, reportingDbContext);

            if (dsCtrUsrs != null && dsCtrUsrs.Tables.Count > 0)
            {
                DynamicReport dReport = new DynamicReport();

                //return an anonymous type with counter and user collection..
                var reports = new { OutNEmergServices = dsCtrUsrs.Tables[0], DiagnosticService = dsCtrUsrs.Tables[1] };
                dReport.JsonData = JsonConvert.SerializeObject(reports,
                                                 new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
                return dReport;


            }
            return null;
        }

        #endregion

       
        #region Laboratory Services

        #region Haematology
        public LaboratoryServices GetHaematology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));
            DataSet dsLabServicesHematology = GetDatasetFromStoredProc("SP_Report_Lab_Haematology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.HaematologyModel0 = JsonConvert.SerializeObject(dsLabServicesHematology.Tables[0]);
            obj.HaematologyModel1 = JsonConvert.SerializeObject(dsLabServicesHematology.Tables[1]);
            return obj;
        }

        #endregion
        #region Immunology

        public LaboratoryServices GetImmunology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesImmunology = GetDatasetFromStoredProc("SP_Report_Lab_Immunology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.ImmunologyModel0 = JsonConvert.SerializeObject(dsLabServicesImmunology.Tables[0]);
            obj.ImmunologyModel1 = JsonConvert.SerializeObject(dsLabServicesImmunology.Tables[1]);
            return obj;
        }

        #endregion

        #region Biochemistry
        public LaboratoryServices GetBiochemistry(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesBiochemistry = GetDatasetFromStoredProc("SP_Report_Lab_Biochemistry", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.BiochemistryModel0 = JsonConvert.SerializeObject(dsLabServicesBiochemistry.Tables[0]);
            obj.BiochemistryModel1 = JsonConvert.SerializeObject(dsLabServicesBiochemistry.Tables[1]);
            return obj;
        }
        #endregion

        #region Bacteriology

        public LaboratoryServices GetBacteriology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesBacteriology = GetDatasetFromStoredProc("SP_Report_Lab_Bacteriology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.BacteriologyModel0 = JsonConvert.SerializeObject(dsLabServicesBacteriology.Tables[0]);

            return obj;
        }
        #endregion

        #region Cytology
        public LaboratoryServices GetCytology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesCytology = GetDatasetFromStoredProc("SP_Report_Lab_Cytology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.CytologyModel0 = JsonConvert.SerializeObject(dsLabServicesCytology.Tables[0]);

            return obj;
        }
        #endregion

        #region Virology
        public LaboratoryServices GetVirology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesVirology = GetDatasetFromStoredProc("SP_Report_Lab_Virology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.VirologyModel0 = JsonConvert.SerializeObject(dsLabServicesVirology.Tables[0]);

            return obj;
        }
        #endregion

        #region Immunohistochemistry 
        public LaboratoryServices GetImmunohistochemistry(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesImmunohistochemistry = GetDatasetFromStoredProc("SP_Report_Lab_ImmunoHistoChemistry", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.ImmunohistochemistryModel0 = JsonConvert.SerializeObject(dsLabServicesImmunohistochemistry.Tables[0]);

            return obj;
        }
        #endregion

        #region Histology 
        public LaboratoryServices GetHistology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesHistology = GetDatasetFromStoredProc("SP_Report_Lab_Histology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.HistologyModel0 = JsonConvert.SerializeObject(dsLabServicesHistology.Tables[0]);

            return obj;
        }
        #endregion

        #region Parasitology 
        public LaboratoryServices GetParasitology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesParasitology = GetDatasetFromStoredProc("SP_Report_Lab_Parasitology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.ParasitologyModel0 = JsonConvert.SerializeObject(dsLabServicesParasitology.Tables[0]);

            return obj;
        }
        #endregion

        #region Parasitology 
        public LaboratoryServices GetCardiacenzymes(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesCardiacenzymes = GetDatasetFromStoredProc("SP_Report_Lab_CardiacEnzymes", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.CardiacenzymesModel0 = JsonConvert.SerializeObject(dsLabServicesCardiacenzymes.Tables[0]);

            return obj;
        }
        #endregion

        #region Hormonesendocrinology 
        public LaboratoryServices GetHormonesendocrinology(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));

            DataSet dsLabServicesHormonesendocrinology = GetDatasetFromStoredProc("SP_Report_Lab_Hormones_Endocrinology", paramsList, this.connStr);
            LaboratoryServices obj = new LaboratoryServices();

            obj.HormonesendocrinologyModel0 = JsonConvert.SerializeObject(dsLabServicesHormonesendocrinology.Tables[0]);

            return obj;
        }
        #endregion

        #endregion

        #region Inpatient Outcome
        public InpatientOutcome GetInpatientOutcome(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            paramsList.Add(new SqlParameter("@FromDate", FromDate));
            paramsList.Add(new SqlParameter("@ToDate", ToDate));
            DataSet dsInpatientOutcome = GetDatasetFromStoredProc("SP_Report_Gov_InpatientOutcome", paramsList, this.connStr);
            InpatientOutcome obj = new InpatientOutcome();
            obj.InpatientoutcomeModel = JsonConvert.SerializeObject(dsInpatientOutcome.Tables[0]);
            return obj;
        }
        #endregion








        private DataSet GetDatasetFromStoredProc(string storedProcName, List<SqlParameter> ipParams, string connString)
        {
            // creates resulting dataset
            var result = new DataSet();
            var context = new ReportingDbContext(connString);
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


    }
}
