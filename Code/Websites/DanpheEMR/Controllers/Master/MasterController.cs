using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using DanpheEMR.DalLayer;

namespace DanpheEMR.Controllers
{

    public class MasterController : CommonController
    {

        // GET: api/values

        public MasterController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }

        // GET: api/values
        [HttpGet]
        public string Get(string type, string reqType, string inputValue, int employeeId, int countryId, int wardId, int bedTypeId, string departmentName)
        {
            string returnValue = string.Empty;
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            if (type == "department")
            {
                //get the value from danphecache
                List<DepartmentModel> deptList = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                //search in the departmentlist
                List<DepartmentModel> filteredList = new List<DepartmentModel>();

                if (string.IsNullOrEmpty(inputValue))
                {
                    //when the request is coming from appointment, we've to return only those values where IsAppointmentApplicable=true.
                    if (reqType == "appointment")
                    {
                        filteredList = (from d in deptList
                                        where d.IsAppointmentApplicable == true
                                        select d).ToList();
                    }
                    else
                    {
                        filteredList = deptList;
                    }
                }
                else
                {
                    filteredList = (from d in deptList
                                    where d.DepartmentName.ToLower().Contains(inputValue.ToLower())
                                    select d).ToList();
                }

                //add into DanpheHTTPResponse format.
                var formatedResult = new DanpheHTTPResponse<List<DepartmentModel>>() { Results = filteredList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
                return returnValue;

            }
            // this is used to get the CountrySubDivision to countryId 
            else if (type == "GetCountrySubDivision")
            {

                MasterDbContext dbMaster = new MasterDbContext(connString);
                List<CountrySubDivisionModel> CountrySubDivision = new List<CountrySubDivisionModel>();
                //if countryId == 0 then bring all the CountrySubDivision from the CountrySubDivision table 
                //else bring accroding to the countryId given
                if (countryId == 0)
                {
                    //filtering isactive records only--needs revision: sud 12apr'18
                    CountrySubDivision = (from s in dbMaster.CountrySubDivision
                                          where s.IsActive == true
                                          select s).ToList();
                }
                else
                {
                    //filtering isactive records only--needs revision: sud 12apr'18
                    CountrySubDivision = (from SubDivision in dbMaster.CountrySubDivision
                                          select SubDivision).Where(s => s.CountryId == countryId && s.IsActive == true).ToList();
                }
                var formatedResult = new DanpheHTTPResponse<List<CountrySubDivisionModel>>() { Results = CountrySubDivision, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);


            }
            else if (type == "get-countries")
            {

                MasterDbContext dbMaster = new MasterDbContext(connString);
                List<CountryModel> Country = new List<CountryModel>();
                Country = (from country in dbMaster.Country
                           where country.IsActive == true
                           select country).ToList();
                var formatedResult = new DanpheHTTPResponse<List<CountryModel>>() { Results = Country, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);


            }
            else if (type == "departmentByEmployeeId")
            {
                //get the value from danphecache
                List<DepartmentModel> deptList = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                DepartmentModel department = (from d in deptList
                                              join e in empListFromCache on d.DepartmentId equals e.DepartmentId
                                              where e.EmployeeId == employeeId
                                              select d).FirstOrDefault();
                //search in the departmentlist

                //add into DanpheHTTPResponse format.
                var formatedResult = new DanpheHTTPResponse<DepartmentModel>() { Results = department, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
                return returnValue;

            }
            else if (type == "departmentemployee")
            {

                List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                List<EmployeeModel> filteredList = new List<EmployeeModel>();
                string status = string.Empty;

                if (string.IsNullOrEmpty(inputValue) || inputValue == "0")
                {
                    //if request has come from appointment, only provide those employees where appointment is applicable .
                    //else return all employees.
                    if (reqType == "appointment")
                    {
                        // List<DepartmentModel> allDeptsFromCache = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                        //sud: 15Jun'18 -- removed departmentjoin as IsAppointmentApplicable field is now added in Employee Level as well.
                        //List<EmployeeModel> apptEmployees = (from e in empListFromCache
                        //                                     join d in allDeptsFromCache
                        //                                     on e.DepartmentId equals d.DepartmentId
                        //                                     where d.IsAppointmentApplicable == true
                        //                                     select e
                        //                     ).ToList();

                        List<EmployeeModel> apptEmployees = empListFromCache.Where(emp => emp.IsAppointmentApplicable.HasValue
                                                            && emp.IsAppointmentApplicable == emp.IsActive == true).ToList();

                        filteredList = apptEmployees;
                    }
                    else
                    {
                        filteredList = empListFromCache;
                    }


                    status = "OK";
                }
                else
                {
                    //inputValue should be integer, else it'll crash.

                    int deptId = 0;
                    if (int.TryParse(inputValue, out deptId))
                    {
                        filteredList = (from e in empListFromCache
                                        where e.DepartmentId == deptId
                                        select e).ToList<EmployeeModel>();
                        status = "OK";
                    }
                    else
                    {
                        status = "Failed";
                    }

                }

                var formattedList = new DanpheHTTPResponse<List<EmployeeModel>>() { Results = filteredList, Status = status };
                returnValue = DanpheJSONConvert.SerializeObject(formattedList, true);
                return returnValue;

            }

            //used in lab-signature component and radiology component and can be used wherever required in future [Reusable]
            else if (type == "signatories") //changed
            {
                List<DepartmentModel> deptList = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                List<EmployeeModel> empListFromCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);
                List<EmployeeModel> filteredList = new List<EmployeeModel>();

                MasterDbContext dbMaster = new MasterDbContext(connString);
                var doctorRoleId = (from master in dbMaster.EmployeeRole
                                    where master.EmployeeRoleName.ToLower() == "doctor"
                                    select master.EmployeeRoleId).FirstOrDefault();

                if (departmentName.ToLower() == "lab")
                {
                    filteredList = (from emp in empListFromCache
                                    join dept in deptList on emp.DepartmentId equals dept.DepartmentId
                                    where (dept.DepartmentName.ToLower() == "lab" || dept.DepartmentName.ToLower() == "pathology")
                                    && emp.IsActive == true
                                    select emp).OrderBy(e => e.DisplaySequence).ToList();
                }
                else if(departmentName.ToLower() == "radiology")
                {
                    filteredList = (from emp in empListFromCache
                                    join dept in deptList on emp.DepartmentId equals dept.DepartmentId
                                    where (dept.DepartmentName.ToLower() == departmentName.ToLower() || (!String.IsNullOrEmpty(emp.RadiologySignature)))
                                    && emp.EmployeeRoleId == doctorRoleId
                                    && emp.IsActive == true //sud:1Jun'19--take only active employees.
                                    select emp).OrderBy(e => e.DisplaySequence).ToList();
                } else
                {
                    filteredList = (from emp in empListFromCache
                                    join dept in deptList on emp.DepartmentId equals dept.DepartmentId
                                    where dept.DepartmentName.ToLower() == departmentName.ToLower() && emp.EmployeeRoleId == doctorRoleId
                                    && emp.IsActive == true //sud:1Jun'19--take only active employees.
                                    select emp).OrderBy(e => e.DisplaySequence).ToList();
                }
                var formattedList = new DanpheHTTPResponse<List<EmployeeModel>>() { Results = filteredList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formattedList, true);
                return returnValue;

            }
            else if (type == "icdcode")
            {
                //get the value from danphecache
                List<ICD10CodeModel> icdListFrmCache = (List<ICD10CodeModel>)DanpheCache.GetMasterData(MasterDataEnum.ICD10);

                //search in the departmentlist
                List<ICD10CodeModel> filteredList = new List<ICD10CodeModel>();
                if (string.IsNullOrEmpty(inputValue))
                {
                    filteredList = icdListFrmCache;
                }
                else
                {
                    filteredList = (from d in icdListFrmCache
                                        //add
                                    where d.ICD10Description.ToLower().Contains(inputValue.ToLower())
                                    || d.ICD10Code.ToLower().Contains(inputValue.ToLower())
                                    select d).ToList();
                }

                //add into DanpheHTTPResponse format.
                var formatedResult = new DanpheHTTPResponse<List<ICD10CodeModel>>() { Results = filteredList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
                return returnValue;
            }

            else if (type == "employee")
            {
                //get the value from danphecache
                List<EmployeeModel> employeeFrmCache = (List<EmployeeModel>)DanpheCache.GetMasterData(MasterDataEnum.Employee);

                //search in the departmentlist
                List<EmployeeModel> filteredList = new List<EmployeeModel>();
                if (string.IsNullOrEmpty(inputValue))
                {
                    filteredList = employeeFrmCache;
                }
                else
                {
                    filteredList = (from e in employeeFrmCache
                                        //add
                                    where (e.FirstName.ToLower().Contains(inputValue.ToLower()) ||
                                           e.LastName.ToLower().Contains(inputValue.ToLower()))
                                    select e).ToList();
                }

                //add into DanpheHTTPResponse format.
                var formatedResult = new DanpheHTTPResponse<List<EmployeeModel>>() { Results = filteredList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
            }

            else if (type == "medicine")
            {
                //get the value from danphecache
                List<PHRMItemMasterModel> medicineFrmCache = (List<PHRMItemMasterModel>)DanpheCache.GetMasterData(MasterDataEnum.Medicine);

                //search in the departmentlist
                List<PHRMItemMasterModel> filteredList = new List<PHRMItemMasterModel>();
                if (string.IsNullOrEmpty(inputValue))
                {
                    filteredList = medicineFrmCache;
                }
                else
                {
                    filteredList = (from m in medicineFrmCache
                                    where m.ItemName.ToLower().Contains(inputValue.ToLower())
                                    select m).ToList();
                }

                //add into DanpheHTTPResponse format.
                var formatedResult = new DanpheHTTPResponse<List<PHRMItemMasterModel>>() { Results = filteredList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
            }

            else if (type == "reaction")
            {
                //get the value from danphecache
                List<ReactionModel> reactionFrmCache = (List<ReactionModel>)DanpheCache.GetMasterData(MasterDataEnum.Reaction);

                //search in the departmentlist
                List<ReactionModel> filteredList = new List<ReactionModel>();
                if (string.IsNullOrEmpty(inputValue))
                {
                    filteredList = reactionFrmCache;
                }
                else
                {
                    //search in both reactinname as well as reactioncode.
                    filteredList = (from r in reactionFrmCache
                                    where r.ReactionName.ToLower().Contains(inputValue.ToLower())
                                    || r.ReactionCode.ToLower().Contains(inputValue.ToLower())
                                    select r).ToList();
                }

                //add into DanpheHTTPResponse format.
                var formatedResult = new DanpheHTTPResponse<List<ReactionModel>>() { Results = filteredList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
            }
            else if (type == "imagingitem")
            {
                //get the value from danphecache
                List<RadiologyImagingItemModel> imagingitemFrmCache = (List<RadiologyImagingItemModel>)DanpheCache.GetMasterData(MasterDataEnum.ImagingItems);

                //search in the departmentlist
                List<RadiologyImagingItemModel> filteredList = new List<RadiologyImagingItemModel>();
                string status = string.Empty;
                if (string.IsNullOrEmpty(inputValue) || inputValue == "0")
                {
                    filteredList = imagingitemFrmCache;
                }
                else
                {
                    int typeId = 0;
                    if (int.TryParse(inputValue, out typeId))
                    {
                        filteredList = (from i in imagingitemFrmCache
                                        where (i.ImagingTypeId == typeId)
                                        select i).ToList();
                        status = "OK";
                    }
                    else
                    {
                        status = "Failed";
                    }
                }
                var formattedList = new DanpheHTTPResponse<List<RadiologyImagingItemModel>>() { Results = filteredList, Status = status };
                returnValue = DanpheJSONConvert.SerializeObject(formattedList, true);
                return returnValue;
            }
            else if (type == "GetWards")
            {
                MasterDbContext dbMaster = new MasterDbContext(connString);
                List<WardModel> wardList = new List<WardModel>();

                wardList = (from ward in dbMaster.Ward
                            select ward).ToList();

                var formatedResult = new DanpheHTTPResponse<List<WardModel>>() { Results = wardList, Status = "OK" };
                returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
            }
            else if (type == "AllMasters")
            {
                List<ServiceDepartmentModel> srvDeptList = (List<ServiceDepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.ServiceDepartment);
                List<PriceCategoryModel> priceCategoryList = (List<PriceCategoryModel>)DanpheCache.GetMasterData(MasterDataEnum.PriceCategory);
                List<DepartmentModel> departments = (List<DepartmentModel>)DanpheCache.GetMasterData(MasterDataEnum.Department);
                List<TaxModel> taxes = (List<TaxModel>)DanpheCache.GetMasterData(MasterDataEnum.Taxes);
                UniquePastDataModel allPastPatUniqueData = (UniquePastDataModel)DanpheCache.GetMasterData(MasterDataEnum.PastUniqueData);
                List<ICD10CodeModel> icd10List = (List<ICD10CodeModel>)DanpheCache.GetMasterData(MasterDataEnum.ICD10);
                //Add other master tables if they need to be loaded at the beginning

                var srvDpts = FormatServiceDepts(srvDeptList, departments);

                var masters = new { ServiceDepartments = srvDpts, Departments = departments, Taxes = taxes, UniqueDataList = allPastPatUniqueData, PriceCategories = priceCategoryList , ICD10List = icd10List };
                responseData.Results = masters;
                responseData.Status = "OK";
                returnValue = DanpheJSONConvert.SerializeObject(responseData, true);
            }





            //else if (type == "GetBedFeatures")
            //{
            //    MasterDbContext dbMaster = new MasterDbContext(connString);
            //    List<BedTypeModel> bedTypeList = new List<BedTypeModel>();
            //    if (wardId != 0)
            //    {
            //        bedTypeList = (from bedType in dbMaster.BedType
            //                       join bed in dbMaster.Bed on bedType.BedTypeId equals bed.BedTypeId
            //                       where bed.WardId == wardId
            //                       select bedType).Distinct().ToList();
            //    }
            //    var formatedResult = new DanpheHTTPResponse<List<BedTypeModel>>() { Results = bedTypeList, Status = "OK" };
            //    returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
            //}
            //else if (type == "GetAvailableBeds")
            //{
            //    MasterDbContext dbMaster = new MasterDbContext(connString);
            //    List<BedModel> bedList = new List<BedModel>();
            //    if (wardId != 0 && bedTypeId != 0)
            //    {
            //        bedList = (from bed in dbMaster.Bed
            //                   where bed.BedTypeId == bedTypeId && bed.WardId == wardId && bed.IsOccupied == false
            //                   select bed).ToList();
            //    }
            //    var formatedResult = new DanpheHTTPResponse<List<BedModel>>() { Results = bedList, Status = "OK" };
            //    returnValue = DanpheJSONConvert.SerializeObject(formatedResult, true);
            //}

            return returnValue;
        }





        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        private object FormatServiceDepts(List<ServiceDepartmentModel> srvDpts, List<DepartmentModel> depts)
        {
            var srvDptFormatted = (from s in srvDpts
                                   join d in depts
                                  on s.DepartmentId equals d.DepartmentId
                                   select new
                                   {
                                       ServiceDepartmentName = s.ServiceDepartmentName,
                                       ServiceDepartmentId = s.ServiceDepartmentId,
                                       DepartmentName = d.DepartmentName,
                                       DepartmentId = d.DepartmentId,
                                       IntegrationName = s.IntegrationName,
                                       Isactive = s.IsActive
                                   }).Where(s => s.Isactive == true).ToList();
            return srvDptFormatted;
        }
    }
}
