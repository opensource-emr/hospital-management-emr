using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using System.Data;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Web.UI;

namespace DanpheEMR.Controllers.Reporting
{
    public class DynamicReportingController : Controller
    {
        private readonly string connString = null;
        public DynamicReportingController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
        }

        public IActionResult GetReportData([FromBody] QueryStringDTO queryStringDTO)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                if (!CheckQueryValidation(queryStringDTO.Query))
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Using this feature you can only read data.";
                }
                else
                {
                    DataTable dt = new DataTable();
                    using (SqlConnection connection = new SqlConnection(connString))
                    {
                        SqlDataAdapter da = new SqlDataAdapter(queryStringDTO.Query, connection);
                        da.Fill(dt);
                    }
                    var list = dt.AsEnumerable().Select(r => r.Table.Columns.Cast<DataColumn>().Select(c => new KeyValuePair<string, object>(c.ColumnName, r[c.Ordinal])).ToDictionary(z => z.Key, z => z.Value)).ToList();
                    responseData.Status = "OK";
                    responseData.Results = list;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }

        private bool CheckQueryValidation(string query)
        {
            var queryToValidate = query.ToLower();
            string[] keyWords = { "create", "drop", "update", "insert", "alter", "delete", "attach", "detach", "grant", "truncate", "revoke" };

            for (int i = 0; i < keyWords.Length; i++)
            {
                string keyword = keyWords[i];
                bool regex = Regex.IsMatch(queryToValidate, @"(^|\s)" + $"{keyword}" + "(^|\\s)");
                if (regex)
                {
                    return false;
                }
            }
            return true;
        }
    }

    public class QueryStringDTO
    {
        public string Query { get; set; }
    }

}
