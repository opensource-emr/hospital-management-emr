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


    public class PatientBL
    {
        //sud:10Apr'19--To centralize patient creation logic across the application.
        // we needed to generate PatientNumber and PatientCode based on parameters so..
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


        ////returns patientNumber for new patient (logic: maxPatientNo+1 )
        //public static int GetNewPatientNo(string connString)
        //{
        //    PatientDbContext patientDbContext = new PatientDbContext(connString);
        //    var maxPatNo = patientDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
        //    //DefaultIfEmpty().Max(p => p == null ? 0 : p.X)
        //    return maxPatNo.Value + 1;

        //}

        // Creates 16 Character UniqueCode based on EMPI logic
        public static string CreateEmpi(PatientModel obj, string connString)
        {
            /* EMPI: 16Characters
              1 -3: district  4-9 : DOB(DDMMYY)  10-12: Name Initials(FML) - X if no middle name 13-16 : Random Number
              for eg: Name=Khadka Prasad Oli, District=Kailali, DOB=01-Dec-1990, EMPI= KAI011290KPO8972int districtId = obj.District;*/
            MasterDbContext mstDB = new MasterDbContext(connString);


            string CountrySubDivisionName = (from d in mstDB.CountrySubDivision
                                             where d.CountrySubDivisionId == obj.CountrySubDivisionId
                                             select d.CountrySubDivisionName).First();

            string strCountrySubDivision = CountrySubDivisionName.Substring(0, 3);
            string strFirstName = obj.FirstName.Substring(0, 1);

            //Use 'X' if middlename is not there.
            string strMiddleName = string.IsNullOrEmpty(obj.MiddleName) ? "X" : obj.MiddleName.Substring(0, 1);
            string strLastName = obj.LastName.Substring(0, 1);
            string strdateofbrith = obj.DateOfBirth.Value.ToString("ddMMyy");
            int randomnos = (new Random()).Next(1000, 10000);
            var empi = strCountrySubDivision +
                       strdateofbrith +
                       strFirstName +
                       strMiddleName +
                       strLastName +
                       randomnos;
            obj.EMPI = empi.ToUpper();
            return obj.EMPI;
        }

        ////modified: ashim:25'July2018 Updated as per HAMS requirement YYMM000001 and incremental
        //public static string GetPatientCode(int patientNo, string connString)
        //{

        //    try
        //    {
        //        CoreDbContext coreDbContext = new CoreDbContext(connString);
        //        ParameterModel parameter = coreDbContext.Parameters
        //            .Where(a => a.ParameterName == "HospitalCode")
        //            .FirstOrDefault<ParameterModel>();
        //        if (parameter != null)
        //        {
        //            JObject paramValue = JObject.Parse(parameter.ParameterValue);
        //            return (string)paramValue["HospitalCode"] + DateTime.Now.ToString("yy") + DateTime.Now.ToString("MM") + String.Format("{0:D6}", patientNo);
        //        }
        //        else
        //        {
        //            throw new Exception("Invalid Paramenter Hospital Code");
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message);
        //    }
        //}


        public static PatientModel GetPatientModelFromPatientVM(GovInsurancePatientVM govPatientVM, string connString, PatientDbContext patDbContext)
        {

            //PatientModel retPat = new PatientModel();

            //GovInsurancePatientVM abc = new GovInsurancePatientVM()
            //{
            //    PatientId = 0,
            //    PatientNo = 0,
            //    PatientCode = null,
            //    FirstName = govPatientVM.FirstName,
            //    MiddleName = govPatientVM.MiddleName,
            //    LastName = govPatientVM.LastName,
            //    Age = govPatientVM.Age,
            //    Gender = govPatientVM.Gender,
            //    DateOfBirth = govPatientVM.DateOfBirth,
            //    Address = govPatientVM.Address,
            //    CountryId = govPatientVM.CountryId,
            //    CountrySubDivisionId = govPatientVM.CountrySubDivisionId,
            //    CountrySubDivisionName = govPatientVM.CountrySubDivisionName,
            //    MembershipTypeId = 0,
            //    PhoneNumber = govPatientVM.PhoneNumber
            //};


            PatientModel retPat = new PatientModel()
            {
                PatientId = 0,
                PatientNo = 0,
                PatientCode = null,
                FirstName = govPatientVM.FirstName,
                MiddleName = govPatientVM.MiddleName,
                LastName = govPatientVM.LastName,
                ShortName = govPatientVM.ShortName,
                PatientNameLocal = govPatientVM.PatientNameLocal,
                Age = govPatientVM.Age,
                Gender = govPatientVM.Gender,
                DateOfBirth = govPatientVM.DateOfBirth,
                Address = govPatientVM.Address,
                CountryId = govPatientVM.CountryId,
                CountrySubDivisionId = govPatientVM.CountrySubDivisionId,
                CountrySubDivisionName = govPatientVM.CountrySubDivisionName,
                MembershipTypeId = 0,
                PhoneNumber = govPatientVM.PhoneNumber,
                IsActive = govPatientVM.IsActive
            };



            NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);

            retPat.PatientNo = newPatientNumber.PatientNo;
            retPat.PatientCode = newPatientNumber.PatientCode;

            if (retPat.MembershipTypeId == null || retPat.MembershipTypeId == 0)
            {
                var membership = patDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                retPat.MembershipTypeId = membership.MembershipTypeId;
            }

            return retPat;
        }

        public static InsuranceModel GetInsuranceModelFromInsPatientVM(GovInsurancePatientVM govPatientVM)
        {
            InsuranceModel retInsInfo = new InsuranceModel()
            {
                InsuranceProviderId = govPatientVM.InsuranceProviderId,
                InsuranceName = govPatientVM.InsuranceName,
                IMISCode = govPatientVM.IMISCode,
                CreatedOn = DateTime.Now,
                InitialBalance = govPatientVM.InitialBalance,
                CurrentBalance = govPatientVM.CurrentBalance

            };

            return retInsInfo;
        }

        public static PatientModel GetPatientModelFromPatientVM(BillingOpPatientVM outPatientVM, string connString, PatientDbContext patDbContext)
        {

            PatientModel retPat = new PatientModel()
            {
                PatientId = 0,
                PatientNo = 0,
                PatientCode = null,
                FirstName = outPatientVM.FirstName,
                MiddleName = outPatientVM.MiddleName,
                ShortName = outPatientVM.ShortName,
                LastName = outPatientVM.LastName,
                PatientNameLocal = outPatientVM.PatientNameLocal,
                Age = outPatientVM.Age,
                Gender = outPatientVM.Gender,
                DateOfBirth = outPatientVM.DateOfBirth,
                Address = outPatientVM.Address,
                CountryId = outPatientVM.CountryId,
                CountrySubDivisionId = outPatientVM.CountrySubDivisionId,
                CountrySubDivisionName = outPatientVM.CountrySubDivisionName,
                MembershipTypeId = 0,
                PhoneNumber = outPatientVM.PhoneNumber,
                IsActive = outPatientVM.IsActive
            };



            NewPatientUniqueNumbersVM newPatientNumber = DanpheEMR.Controllers.PatientBL.GetPatNumberNCodeForNewPatient(connString);

            retPat.PatientNo = newPatientNumber.PatientNo;
            retPat.PatientCode = newPatientNumber.PatientCode;

            if (retPat.MembershipTypeId == null || retPat.MembershipTypeId == 0)
            {
                var membership = patDbContext.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                retPat.MembershipTypeId = membership.MembershipTypeId;
            }

            return retPat;
        }
    }
}
