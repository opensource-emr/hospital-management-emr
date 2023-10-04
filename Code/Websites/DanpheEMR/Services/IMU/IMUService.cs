using DanpheEMR.Core;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.IMUDTOs;
using DanpheEMR.Utilities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Services.IMU
{
    public class IMUService : IIMUService
    {
        public Task<DataTable> GetAllImuTestData(LabDbContext labDbContext, DateTime fromDate, DateTime toDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", fromDate),
                 new SqlParameter("@ToDate", toDate)
            };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable IMUData = DALFunctions.GetDataTableFromStoredProc("SP_LAB_GetAllIMUCaseData", paramList,labDbContext);
            return Task.FromResult(IMUData);
        }
        public Task<IMUResponseModel> PostDataToIMU(LabDbContext labDbContex, CoreDbContext coreDbContext, List<Int64> reqIdList, RbacUser currentUser)
        {
            IMUResponseModel res = new IMUResponseModel();
            IMUPostDataModel model = new IMUPostDataModel();
            reqIdList.ForEach(async a =>
            {
                model =  await GetIMUMapping(labDbContex,a);
                var userName = CommonFunctions.GetCoreParameterValueByKeyName_String(coreDbContext, "LAB-IMU", "DanpheConfigForIMU", "UserName");
                var password = CommonFunctions.GetCoreParameterValueByKeyName_String(coreDbContext, "LAB-IMU", "DanpheConfigForIMU", "Password");
                var url = CommonFunctions.GetCoreParameterValueByKeyName_String(coreDbContext, "LAB-IMU", "DanpheConfigForIMU", "FullUrl"); ;
                res = await PostToIMU(model, url, userName, password);
                if(res.status == 200 && res.message == "Data Successfully Sync")
                {
                    LabRequisitionModel reqModel = labDbContex.Requisitions.Where(req => req.RequisitionId == a).FirstOrDefault();
                    reqModel.IsUploadedToIMU = true;
                    reqModel.ModifiedBy = currentUser.UserId;
                    reqModel.ModifiedOn = DateTime.Now;
                    reqModel.IMUUploadedBy = currentUser.UserId;
                    reqModel.IMUUploadedOn = DateTime.Now;
                    labDbContex.Entry(reqModel).Property(ab => ab.ModifiedBy).IsModified = true;
                    labDbContex.Entry(reqModel).Property(ab => ab.ModifiedOn).IsModified = true;
                    labDbContex.Entry(reqModel).Property(ab => ab.IsUploadedToIMU).IsModified = true;
                    labDbContex.Entry(reqModel).Property(ab => ab.IMUUploadedBy).IsModified = true;
                    labDbContex.Entry(reqModel).Property(ab => ab.IMUUploadedOn).IsModified = true;
                    labDbContex.SaveChanges();                  
                }
            });
            return Task.FromResult(res);
        }

        public Task<IMUPostDataModel>GetIMUMapping(LabDbContext labDbContex,Int64 reqId)
        {
            IMUPostDataModel IMUmodel = new IMUPostDataModel();
            var result = (from req in labDbContex.Requisitions.Where(a => a.RequisitionId == reqId)
                          join value in labDbContex.LabTestComponentResults on req.RequisitionId equals value.RequisitionId
                          join pat in labDbContex.Patients on req.PatientId equals pat.PatientId
                          join district in labDbContex.CountrySubdivisions on pat.CountrySubDivisionId equals district.CountrySubDivisionId
                          join mun in labDbContex.Municipalities on pat.MunicipalityId equals mun.MunicipalityId into r
                          from muncipality in r.DefaultIfEmpty()
                          where value.Value == "positive" || value.Value == "negative"
                          select new
                          {
                              Name = pat.ShortName,
                              Age = pat.Age,
                              AgeUnit = pat.Age,
                              Sex = pat.Gender,
                              Caste = 1,
                              ProvicneId = district.IMU_ProvinceId,
                              DistrictId = district.IMU_CountrySubDivisonId,
                              MuncipalityId = muncipality == null ? 0 : muncipality.IMU_MuncipalityId,
                              Ward = 1,
                              Tole = pat.Address,
                              Occupation = 10,
                              Contact = pat.PhoneNumber,
                              RegisteredOn = req.SampleCreatedOn,
                              ServiceFor = req.LabTestName,
                              ServiceType = 1,
                              SampleType = req.LabTestSpecimenSource,
                              SampleCollectedDate = req.SampleCollectedOnDateTime,
                              InfectionType = 1,
                              LabId = req.RequisitionId,
                              LabReceivedDate = req.SampleCollectedOnDateTime,
                              LabTestDate = req.VerifiedOn,
                              LabTestTime = req.VerifiedOn,
                              LabResult = value.Value,
                              IMUSwabId = "",
                              IsInfectedBefore = false,
                              IsVaccineReceived = 1
                          }).ToList();

            IMUmodel.name = result.Select(a => a.Name).FirstOrDefault();
            IMUmodel.age = GetAge(true,result.Select(a => a.Age).FirstOrDefault().ToString());
            IMUmodel.age_unit = GetAge(false,result.Select(a => a.AgeUnit).FirstOrDefault().ToString());
            IMUmodel.sex = MapGender(result.Select(a => a.Sex).FirstOrDefault());
            IMUmodel.caste = result.Select(a => a.Caste).FirstOrDefault();
            IMUmodel.province_id = result.Select(a => a.ProvicneId).FirstOrDefault();
            IMUmodel.district_id = result.Select(a => a.DistrictId).FirstOrDefault();
            IMUmodel.municipality_id = result.Select(a => a.MuncipalityId).FirstOrDefault();
            IMUmodel.ward = result.Select(a => a.Ward).FirstOrDefault();
            IMUmodel.tole = result.Select(a => a.Tole).FirstOrDefault();
            IMUmodel.occupation = result.Select(a => a.Occupation).FirstOrDefault();
            IMUmodel.emergency_contact_one = result.Select(a => a.Contact).FirstOrDefault();
            IMUmodel.registered_at = GetDateTime((DateTime)result.Select(a => a.RegisteredOn).FirstOrDefault());
            IMUmodel.sample_collected_date = GetDateFromDateTime((DateTime)result.Select(a => a.SampleCollectedDate).FirstOrDefault());
            IMUmodel.service_for = MapService(result.Select(a => a.ServiceFor).FirstOrDefault());
            IMUmodel.service_type = result.Select(a => a.ServiceType).FirstOrDefault();
            IMUmodel.sample_type = MapSampleType(result.Select(a => a.SampleType).FirstOrDefault());
            IMUmodel.infection_type = result.Select(a => a.InfectionType).FirstOrDefault();
            IMUmodel.lab_id = result.Select(a => a.LabId).FirstOrDefault().ToString();
            IMUmodel.lab_received_date = GetDateFromDateTime((DateTime)result.Select(a => a.LabReceivedDate).FirstOrDefault());
            IMUmodel.lab_test_date = GetDateFromDateTime((DateTime)result.Select(a => a.LabTestDate).FirstOrDefault());
            IMUmodel.lab_test_time = GetTimeFromDate((DateTime)result.Select(a => a.LabTestTime).FirstOrDefault());
            IMUmodel.lab_result = result.Select(a => a.LabResult).FirstOrDefault().ToLower() == "positive" ? 3 : 4;
            IMUmodel.imu_swab_id = result.Select(a => a.IMUSwabId).FirstOrDefault();
            IMUmodel.is_infected_covid_before = result.Select(a => a.IsInfectedBefore).FirstOrDefault();
            IMUmodel.is_received_vaccine = result.Select(a => a.IsVaccineReceived).FirstOrDefault();
            return Task.FromResult(IMUmodel);
        }


        public Task<IMUResponseModel> PostToIMU(IMUPostDataModel IMUmodel, string url, string userName, string password)
        {
            IMUResponseModel res = new IMUResponseModel();
            using (var client = new HttpClient())
            {
                var jsonData = DanpheJSONConvert.SerializeObject(IMUmodel);
                //var stringContent = IMUmodel.ToString();
                var stringContent = "[" + jsonData + "]";
                //var stringContent = jsonData.Substring(1, jsonData.Length - 2);

                var data = new StringContent(stringContent, Encoding.UTF8, "application/json");
                var ISO_8859_1 = Encoding.GetEncoding("ISO-8859-1");
                var svcCredentials = Convert.ToBase64String(ISO_8859_1.GetBytes(userName + ":" + password));
                client.DefaultRequestHeaders.Add("Authorization", "Basic " + svcCredentials);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.BaseAddress = new Uri(url);
                var response = client.PostAsync(url,data).Result;
                if (response.IsSuccessStatusCode)
                {
                    var message = response.Content.ReadAsStringAsync();
                    res = DanpheJSONConvert.DeserializeObject<IMUResponseModel>(message.Result);                  
                }
                else
                {
                    res.message = "Internal Server Error";
                    res.status = 500;
                }
                return Task.FromResult(res);
            }
        }

        public String GetTimeFromDate(DateTime dateTime)
        {
            return dateTime.ToString("HH:mm:ss");
        }

        public String GetDateTime(DateTime dateTime)
        {
            return dateTime.ToString("yyyy-MM-dd HH:mm:ss");
        }
        public String GetDateFromDateTime(DateTime dateTime)
        {
            return dateTime.ToString("yyyy-MM-dd");
        }

        public int MapGender(String gender)
        {
            if (gender == "Male")
                return 0;
            else if (gender == "Female")
                return 1;
            else
                return 2;
        }

        public int MapService(String service)
        {
            if (service == "RT-PCR NCOV-2")
                return 1;
            else if (service == "Covid-19 Antigen Test")
                return 2;
            else
                return 1;
        }

        public int MapSampleType(String sampleType)
        {
            if (sampleType == "Nasopharyngeal swabs")
                return 1;
            else
                return 2;
        }
        
        public int MapAgeUnit(String ageUnit)
        {
            if(ageUnit == "Y")
            {
                return 0;
            }
            else if (ageUnit == "M")
            {
                return 1;
            }
            else
            {
                return  2;
            }
        }

        public int GetAge(Boolean getAge,String ageAndUnit)
        {
            char[] array = ageAndUnit.ToCharArray();
            int index = 0;
            for (int i = 0; i < array.Length; i++)
            {
                if (!Char.IsNumber(array[i])){
                    index = i;
                    break;
                }
            }
            if (getAge)
            {
                return int.Parse(ageAndUnit.Substring(0, index));
            }

            else
            {
                return MapAgeUnit(ageAndUnit.Substring(index));
            }
        }
    }
}
