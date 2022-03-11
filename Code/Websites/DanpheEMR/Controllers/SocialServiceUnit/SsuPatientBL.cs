using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class SsuPatientBL
    {
        public static NewPatientUniqueNumbersVM GetPatNumberNCodeForNewPatient(string connString)
        {
            NewPatientUniqueNumbersVM retValue = new NewPatientUniqueNumbersVM();
            int newPatNo = 0;
            string newPatCode = "";

            PatientDbContext patientDbContext = new PatientDbContext(connString);
            var maxPatNo = patientDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
            newPatNo = maxPatNo.Value + 1;


            string patCodeFormat = "YYMM-PatNum";//this is default value.
            string hospitalCode = "";//default empty


            CoreDbContext coreDbContext = new CoreDbContext(connString);

            List<ParameterModel> allParams = coreDbContext.Parameters.ToList();


            ParameterModel patCodeFormatParam = allParams
               .Where(a => a.ParameterGroupName == "Patient" && a.ParameterName == "PatientCodeFormat")
               .FirstOrDefault<ParameterModel>();
            if (patCodeFormatParam != null)
            {
                patCodeFormat = patCodeFormatParam.ParameterValue;
            }


            ParameterModel hospCodeParam = allParams
                .Where(a => a.ParameterName == "HospitalCode")
                .FirstOrDefault<ParameterModel>();
            if (hospCodeParam != null)
            {
                hospitalCode = hospCodeParam.ParameterValue;
            }



            if (patCodeFormat == "YYMM-PatNum")
            {
                newPatCode = DateTime.Now.ToString("yy") + DateTime.Now.ToString("MM") + String.Format("{0:D6}", newPatNo);
            }
            else if (patCodeFormat == "HospCode-PatNum")
            {
                newPatCode = hospitalCode + newPatNo;
            }
            else if (patCodeFormat == "PatNum")
            {
                newPatCode = newPatNo.ToString();
            }


            retValue.PatientNo = newPatNo;
            retValue.PatientCode = newPatCode;

            return retValue;
        }
    }
}
