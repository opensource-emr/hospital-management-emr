using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.DalLayer
{
    public static class DataTableToList
    {
        public static List<dynamic> ToDynamic(this DataTable dt)
        {
            var dynamicDt = new List<dynamic>();
            foreach (DataRow row in dt.Rows)
            {
                dynamic dyn = new ExpandoObject();
                dynamicDt.Add(dyn);
                //--------- change from here
                foreach (DataColumn column in dt.Columns)
                {
                    var dic = (IDictionary<string, object>)dyn;
                    dic[column.ColumnName] = row[column];
                }
                //--------- change up to here
            }
            return dynamicDt;
        }
        public static List<T> ConvertToList<T>(DataTable dt)
        {
            var columnNames = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName.ToLower()).ToList();
            var properties = typeof(T).GetProperties();
            //return dt.AsEnumerable().Select(row =>
            //{
            //    var objT = Activator.CreateInstance<T>();
            //    foreach (var pro in properties)
            //    {
            //        if (columnNames.Contains(pro.Name.ToLower()))
            //        {
            //            try
            //            {
            //                pro.SetValue(objT, row[pro.Name]);
            //            }
            //            catch (Exception ex) 
            //            { 

            //            }
            //        }
            //    }
            //    return objT;
            //}).ToList();


            List<T> result = new List<T>();
            foreach (DataRow dataRow in dt.AsEnumerable())
            {
                var objT = Activator.CreateInstance<T>();
                foreach (var prop in properties)
                {
                    if (columnNames.Contains(prop.Name.ToLower()))
                    {
                        try
                        {
                            if(dataRow[prop.Name] != DBNull.Value)
                            {
                                prop.SetValue(objT, dataRow[prop.Name]);
                            }
                            else
                            {
                                prop.SetValue(objT, GetDefaultValue(prop.PropertyType));
                            }
                        }
                        catch (Exception)
                        {
                            throw;
                        }
                    }
                }
                result.Add(objT);
            }
            return result;
        }

        private static object GetDefaultValue(Type type)
        {
            return type.IsValueType ? Activator.CreateInstance(type) : null;
        }
    }
}