using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using DanpheEMR.AccTransfer;
using DanpheEMR.ServerModel;
using System.Reflection;
using DanpheEMR.Core;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace DanpheEMR.AccTransfer
{
    public class TransferToACC
    {
        public static string accConn = ConfigurationManager.ConnectionStrings["accConnStr"].ConnectionString;
        public static string plainConnString;


        //check enabled automatic transfer to accounting
        public static bool EnabledData()
        {
            try
            {
                var con = TransferToACC.getConnection(accConn); // decrypted connectionstring;
                CoreDbContext coreDbContext = new CoreDbContext(con);
                var result = (from par in coreDbContext.Parameters
                              where (par.ParameterGroupName == "Accounting" && par.ParameterName == "AccountingTransfer")
                              select par.ParameterValue).FirstOrDefault();
                var data = (JObject)JsonConvert.DeserializeObject(result);
                var check = data["AutomaticTransfer"].Value<string>();
                if (check == "True")
                    return true;
                else return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return false;
            }
        }

      
        public static string getConnection(string encConnString)
        {
            string connString = "";
            string[] parts = encConnString.Split(';');
            string encUserId = "";
            string decUserId = "";
            string encPassword = "";
            string decPassword = "";
            for (int i = 0; i < parts.Length; i++)
            {
                string part = parts[i].Trim();
                if (part.StartsWith("user Id="))
                {
                    encUserId = part.Replace("User Id=", "");
                    decUserId = DanpheEMR.Security.RBAC.DecryptPassword(encUserId);
                    connString = encConnString.Replace(encUserId, decUserId);
                }
                else if (part.StartsWith("Password="))
                {
                    encPassword = part.Replace("Password=", "");
                    decPassword = DanpheEMR.Security.RBAC.DecryptPassword(encPassword);
                    connString = encConnString.Replace(encPassword, decPassword);
                }
            }
            plainConnString = (connString.Length > 0) ? connString : encConnString;
            return plainConnString;
        }

    }
}
