using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using System.Reflection;

namespace DanpheEMR.DalLayer
{
    public class DALFunctions
    {
        #region GetData From stored procedure
        public static DataSet GetDatasetFromStoredProc(string storedProcName, List<SqlParameter> ipParams, DbContext dbContext)
        {
            // creates resulting dataset
            var result = new DataSet();
            // creates a Command 
            var cmd = dbContext.Database.Connection.CreateCommand();
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
                dbContext.Database.Connection.Open();
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
                dbContext.Database.Connection.Close();
            }

        }
        ///// Get DataTable From SP with Input Parameters
        public static DataTable GetDataTableFromStoredProc(string storedProcName, List<SqlParameter> ipParams, DbContext dbContext)
        {
            try
            {
                DataSet ds = DALFunctions.GetDatasetFromStoredProc(storedProcName, ipParams, dbContext);
                return ds.Tables[0];
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        ///// Get DataTable From SP without Any Input Parameters
        public static DataTable GetDataTableFromStoredProc(string storedProcName, DbContext dbContext)
        {
            try
            {
                DataSet ds = DALFunctions.GetDatasetFromStoredProc(storedProcName, null, dbContext);
                return ds.Tables[0];
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        //Function to convert LINQ query result to Datatable
        public static DataTable LINQResultToDataTable<T>(IEnumerable<T> Linqlist)
        {
            DataTable dt = new DataTable();
            PropertyInfo[] columns = null;

            if (Linqlist == null) return dt;

            foreach (T Record in Linqlist)
            {

                if (columns == null)
                {
                    columns = ((Type)Record.GetType()).GetProperties();
                    foreach (PropertyInfo GetProperty in columns)
                    {
                        Type colType = GetProperty.PropertyType;

                        if ((colType.IsGenericType) && (colType.GetGenericTypeDefinition()
                        == typeof(Nullable<>)))
                        {
                            colType = colType.GetGenericArguments()[0];
                        }

                        dt.Columns.Add(new DataColumn(GetProperty.Name, colType));
                    }
                }

                DataRow dr = dt.NewRow();

                foreach (PropertyInfo pinfo in columns)
                {
                    dr[pinfo.Name] = pinfo.GetValue(Record, null) == null ? DBNull.Value : pinfo.GetValue
                    (Record, null);
                }

                dt.Rows.Add(dr);
            }
            return dt;
        }
    }
}
