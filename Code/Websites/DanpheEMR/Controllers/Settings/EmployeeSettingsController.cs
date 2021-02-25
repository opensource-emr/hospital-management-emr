using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using System.Globalization; //used for converting string to Titlecase i.e first letter capital
using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel.Helpers;//for appointmenthelpers
using DanpheEMR.Core.Configuration;
using DanpheEMR.Security;
using RefactorThis.GraphDiff;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using DanpheEMR.ServerModel.LabModels;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Drawing;
using Microsoft.AspNetCore.Hosting;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{

    public class EmployeeSettingsController : CommonController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public EmployeeSettingsController(IHostingEnvironment hostingEnvironment, IOptions<MyConfiguration> _config) : base(_config)
        {
            this._hostingEnvironment = hostingEnvironment;
        }
        [HttpGet]
        public string Get(string department,
            string servDeptName,
            string reqType,
            int providerId,
            int patientId,
            int employeeId,
            DateTime requestDate,
            int roleId,
            int userId,
            int bedId,
            int itemId,
            int serviceDeptId,
            string status,
            int templateId,
            bool ShowIsActive,
            bool showInactiveItems = false)
        {
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            try
            {
                if (reqType == "get-employee")
                {
                    //updated: Sud-16Aug'17-- to get the fullName of employee, we've to apply ToList() before selecting the properties.
                    // since FullName is 'NotMapped' property i.e: customized property made in server side.

                    //updated: sud-30Apr'20-- FullName is now a inbuilt property of Employee table, so we can take directly from EmpTable.
                    var employeeList = (from e in masterDbContext.Employees.Include("Department").Include("EmployeeRole").Include("EmployeeType")
                                        where e.IsExternal == false
                                        select new
                                        {
                                            EmployeeId = e.EmployeeId,
                                            Salutation = e.Salutation,
                                            FirstName = e.FirstName,
                                            MiddleName = e.MiddleName,
                                            LastName = e.LastName,
                                            FullName = e.FullName,
                                            DateOfBirth = e.DateOfBirth,
                                            DateOfJoining = e.DateOfJoining,
                                            ContactNumber = e.ContactNumber,
                                            ContactAddress = e.ContactAddress,
                                            Email = e.Email,
                                            Gender = e.Gender,
                                            Extension = e.Extension,
                                            SpeedDial = e.SpeedDial,
                                            OfficeHour = e.OfficeHour,
                                            RoomNo = e.RoomNo,
                                            IsActive = e.IsActive,
                                            MedCertificationNo = e.MedCertificationNo,
                                            Signature = e.Signature,
                                            LongSignature = e.LongSignature,
                                            DepartmentId = e.DepartmentId,
                                            DepartmentName = e.Department != null ? e.Department.DepartmentName : null,
                                            EmployeeRoleId = e.EmployeeRoleId,
                                            EmployeeRoleName = e.EmployeeRole != null ? e.EmployeeRole.EmployeeRoleName : null,
                                            EmployeeTypeId = e.EmployeeTypeId,
                                            EmployeeTypeName = e.EmployeeType != null ? e.EmployeeType.EmployeeTypeName : null,
                                            IsAppointmentApplicable = e.IsAppointmentApplicable,//sud:14June'18
                                            LabSignature = e.LabSignature,//sud:14June'18
                                            CreatedOn = e.CreatedOn,
                                            CreatedBy = e.CreatedBy,
                                            SignatoryImageName = e.SignatoryImageName,
                                            DisplaySequence = e.DisplaySequence,
                                            TDSPercent = e.TDSPercent,
                                            PANNumber = e.PANNumber,
                                            IsIncentiveApplicable = e.IsIncentiveApplicable,
                                            RadiologySignature = e.RadiologySignature,
                                            BloodGroup = e.BloodGroup,
                                            NursingCertificationNo = e.NursingCertificationNo,
                                            HealthProfessionalCertificationNo = e.HealthProfessionalCertificationNo,
                                            DriverLicenseNo = e.DriverLicenseNo
                                        }).OrderBy(e => e.FirstName)
                                            .ThenBy(e => e.LastName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = employeeList;
                }
                else if (reqType == "get-employee-role")
                {
                    var employeeRoleList = masterDbContext.EmployeeRole.OrderBy(e => e.EmployeeRoleName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = employeeRoleList;
                }
                else if (reqType == "get-employee-type")
                {
                    //Yubraj: -- modification --28th March 2019
                    //ShowIsActive has either true or null value
                    //ShowIsActive= true gets all the employeeType with IsActive true and false
                    List<EmployeeTypeModel> employeeTypeList = new List<EmployeeTypeModel>();
                    if (ShowIsActive)
                    {
                        //getting IsActive=true list
                        employeeTypeList = (from empType in masterDbContext.EmployeeType
                                            where empType.IsActive == ShowIsActive
                                            select empType).ToList();
                    }
                    else
                    {
                        //getting all list
                        employeeTypeList = masterDbContext.EmployeeType.ToList();
                    }
                    responseData.Status = "OK";
                    responseData.Results = employeeTypeList;
                }
                else if (reqType == "get-emp-signatory-image")
                {
                    var fileName = (from emp in masterDbContext.Employees
                                    where emp.EmployeeId == employeeId
                                    select emp.SignatoryImageName).FirstOrDefault();



                    if (fileName != null)
                    {
                        //var path = (from master in masterDbContext.CFGParameters
                        //            where master.ParameterGroupName.ToLower() == "common" && master.ParameterName == "SignatureLocationPath"
                        //            select master.ParameterValue).FirstOrDefault();

                        var path = this._hostingEnvironment.WebRootPath + "\\" + @"fileuploads\EmployeeSignatures\";

                        string signatoryImagePath = path + fileName;

                        using (Image image = Image.FromFile(signatoryImagePath))
                        {
                            using (MemoryStream m = new MemoryStream())
                            {
                                image.Save(m, image.RawFormat);
                                byte[] imageBytes = m.ToArray();

                                // Convert byte[] to Base64 String
                                string base64String = Convert.ToBase64String(imageBytes);
                                responseData.Results = base64String;
                            }
                        }

                    }
                    else
                    {
                        responseData.Results = null;
                    }
                    responseData.Status = "OK";
                    //responseData.Results = ;
                }

                else if (reqType == "get-ext-referrers")
                {
                    //updated: Sud-16Aug'17-- to get the fullName of employee, we've to apply ToList() before selecting the properties.
                    // since FullName is 'NotMapped' property i.e: customized property made in server side.
                    var extRefList = (from emp in masterDbContext.Employees
                                      where emp.IsExternal == true
                                      select new ExternalReferrerVM
                                      {
                                          ExternalReferrerId = emp.EmployeeId,
                                          ReferrerName = emp.FullName,
                                          ContactAddress = emp.ContactAddress,
                                          EmailAddress = emp.Email,
                                          ContactNumber = emp.ContactNumber,
                                          IsActive = emp.IsActive
                                      }).ToList();



                    responseData.Status = "OK";
                    responseData.Results = extRefList;
                }
                else if (reqType == "get-all-referrer-list")
                {

                    MasterDbContext mstDBContext = new MasterDbContext(connString);
                    var doctorList = (from e in mstDBContext.Employees
                                      where e.IsActive == true
                                      && (e.IsExternal ? true : (e.IsAppointmentApplicable.HasValue && e.IsAppointmentApplicable == true))
                                      select e).ToList();
                    responseData.Status = "OK";
                    responseData.Results = doctorList;
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        // POST api/values
        [HttpPost]
        public string Post()
        {
            //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            LabDbContext labDbContext = new LabDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);

            try
            {
                string serviceDepartment = this.ReadQueryStringData("serviceDepartment");
                int itemId = ToInt(this.ReadQueryStringData("itemId"));
                string reqType = this.ReadQueryStringData("reqType");
                string str = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

                if (reqType == "post-employee")
                {
                    EmployeeModel emp = DanpheJSONConvert.DeserializeObject<EmployeeModel>(str);

                    using (var dbTransaction = masterDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            emp.CreatedBy = currentUser.EmployeeId;
                            emp.CreatedOn = DateTime.Now;

                            masterDbContext.Employees.Add(emp);
                            masterDbContext.SaveChanges();



                            if (emp.ServiceItemsList != null && emp.ServiceItemsList.Count > 0)
                            {
                                UpdateBillItemsOfEmployee(emp, masterDbContext);
                            }



                            if (emp.SignatoryImageBase64 != null)
                            {
                                UploadEmployeeSignatoryImage(masterDbContext, emp);
                            }
                            dbTransaction.Commit();
                            responseData.Results = emp;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbTransaction.Rollback();
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                        }
                    }

                }
                else if (reqType == "post-employee-role")
                {
                    EmployeeRoleModel empRole = DanpheJSONConvert.DeserializeObject<EmployeeRoleModel>(str);
                    masterDbContext.EmployeeRole.Add(empRole);

                    masterDbContext.SaveChanges();
                    responseData.Results = empRole;
                    responseData.Status = "OK";
                }
                else if (reqType == "post-employee-type")
                {
                    EmployeeTypeModel empType = DanpheJSONConvert.DeserializeObject<EmployeeTypeModel>(str);
                    masterDbContext.EmployeeType.Add(empType);

                    masterDbContext.SaveChanges();
                    responseData.Results = empType;
                    responseData.Status = "OK";
                }
                else if (reqType == "post-ext-referrer")
                {
                    ExternalReferrerVM extRefVm = DanpheJSONConvert.DeserializeObject<ExternalReferrerVM>(str);
                    EmployeeModel emp = GetEmpModelFromExtReferrerModel(extRefVm);

                    if (emp != null)
                    {

                        emp.CreatedBy = currentUser.EmployeeId;
                        emp.CreatedOn = DateTime.Now;

                        masterDbContext.Employees.Add(emp);
                        masterDbContext.SaveChanges();


                        ExternalReferrerVM retExtRefObj = GetExtRefModelFromEmployeeModel(emp);

                        responseData.Results = retExtRefObj;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Input form data is incorrect.";

                    }


                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }


            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // PUT api/values/5
        [HttpPut]
        public string Put()
        {
            string reqType = this.ReadQueryStringData("reqType");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            string str = this.ReadPostData();
            MasterDbContext masterDBContext = new MasterDbContext(connString);
            AdmissionDbContext adtDbContext = new AdmissionDbContext(connString);
            RbacDbContext rbacDbContext = new RbacDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            RadiologyDbContext radioDbContext = new RadiologyDbContext(connString);
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            try
            {
                if (reqType == "put-employee")
                {
                    EmployeeModel clientEmployee = DanpheJSONConvert.DeserializeObject<EmployeeModel>(str);

                    using (var dbTransc = masterDBContext.Database.BeginTransaction())
                    {
                        try
                        {
                            masterDBContext.Employees.Attach(clientEmployee);
                            masterDBContext.Entry(clientEmployee).State = EntityState.Modified;
                            masterDBContext.Entry(clientEmployee).Property(x => x.CreatedOn).IsModified = false;
                            masterDBContext.Entry(clientEmployee).Property(x => x.CreatedBy).IsModified = false;
                            masterDBContext.SaveChanges();



                            if (clientEmployee.ServiceItemsList != null && clientEmployee.ServiceItemsList.Count > 0)
                            {
                                UpdateBillItemsOfEmployee(clientEmployee, masterDBContext);
                            }


                            if (clientEmployee.SignatoryImageBase64 != null && clientEmployee.SignatoryImageName == null)
                            {
                                UploadEmployeeSignatoryImage(masterDBContext, clientEmployee);
                            }
                            dbTransc.Commit();
                            responseData.Results = clientEmployee;
                            responseData.Status = "OK";

                        }
                        catch (Exception ex)
                        {
                            dbTransc.Rollback();
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
                        }
                    }


                }
                else if (reqType == "put-employee-role")
                {
                    EmployeeRoleModel employeeRole = DanpheJSONConvert.DeserializeObject<EmployeeRoleModel>(str);
                    masterDBContext.EmployeeRole.Attach(employeeRole);
                    masterDBContext.Entry(employeeRole).State = EntityState.Modified;
                    masterDBContext.Entry(employeeRole).Property(x => x.CreatedOn).IsModified = false;
                    masterDBContext.Entry(employeeRole).Property(x => x.CreatedBy).IsModified = false;
                    masterDBContext.SaveChanges();
                    responseData.Results = employeeRole;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-employee-type")
                {
                    EmployeeTypeModel employeeType = DanpheJSONConvert.DeserializeObject<EmployeeTypeModel>(str);
                    masterDBContext.EmployeeType.Attach(employeeType);
                    masterDBContext.Entry(employeeType).State = EntityState.Modified;
                    masterDBContext.Entry(employeeType).Property(x => x.CreatedOn).IsModified = false;
                    masterDBContext.Entry(employeeType).Property(x => x.CreatedBy).IsModified = false;
                    masterDBContext.SaveChanges();
                    responseData.Results = employeeType;
                    responseData.Status = "OK";
                }
                else if (reqType == "put-ext-referrer")
                {
                    ExternalReferrerVM extRefVm = DanpheJSONConvert.DeserializeObject<ExternalReferrerVM>(str);
                    EmployeeModel clientEmployee = GetEmpModelFromExtReferrerModel(extRefVm);

                    clientEmployee.ModifiedBy = currentUser.EmployeeId;
                    clientEmployee.ModifiedOn = DateTime.Now;

                    masterDBContext.Employees.Attach(clientEmployee);
                    //masterDBContext.Entry(clientEmployee).State = EntityState.Modified;
                    masterDBContext.Entry(clientEmployee).Property(x => x.FullName).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.ContactAddress).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.ContactNumber).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.Email).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.PANNumber).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.TDSPercent).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.IsIncentiveApplicable).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.IsActive).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.ModifiedBy).IsModified = true;
                    masterDBContext.Entry(clientEmployee).Property(x => x.ModifiedOn).IsModified = true;

                    masterDBContext.SaveChanges();
                    ExternalReferrerVM retExtRefObj = GetExtRefModelFromEmployeeModel(clientEmployee);

                    responseData.Results = retExtRefObj;
                    responseData.Status = "OK";

                }

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }



        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        public void UploadEmployeeSignatoryImage(MasterDbContext masterDbContext, EmployeeModel emp)
        {
            var fileName = "";
            //string signatoryImagePath = (from master in masterDbContext.CFGParameters
            //                             where master.ParameterGroupName.ToLower() == "common" && master.ParameterName == "SignatureLocationPath"
            //                             select master.ParameterValue).FirstOrDefault();

            string signatoryImagePath = this._hostingEnvironment.WebRootPath + "\\" + @"fileuploads\EmployeeSignatures\";

            var dateTimeToAppend = System.DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss");
            dateTimeToAppend = dateTimeToAppend.Replace("/", "");
            dateTimeToAppend = dateTimeToAppend.Replace(":", "");

            fileName = emp.FirstName + "_" + emp.EmployeeId + "_" + dateTimeToAppend;
            fileName = fileName.Replace(" ", "");
            fileName = fileName + ".png";

            signatoryImagePath = signatoryImagePath + fileName;
            emp.SignatoryImageName = fileName;

            byte[] imageBytes = Convert.FromBase64String(emp.SignatoryImageBase64);

            using (var stream = new FileStream(signatoryImagePath, FileMode.Create))
            {
                MemoryStream ms = new MemoryStream(imageBytes);
                ms.WriteTo(stream);

                // clean up
                ms.Close();
                stream.Close();
                stream.Dispose();
            }

            var employee = (from val in masterDbContext.Employees
                            where val.EmployeeId == emp.EmployeeId
                            select val).FirstOrDefault();

            if (employee != null)
            {
                employee.SignatoryImageName = emp.SignatoryImageName;
                masterDbContext.Entry(employee).Property(a => a.SignatoryImageName).IsModified = true;
                masterDbContext.SaveChanges();
            }
        }


        public EmployeeModel GetEmpModelFromExtReferrerModel(ExternalReferrerVM extRefObj)
        {
            EmployeeModel retEmpObj = null;
            if (extRefObj != null)
            {

                retEmpObj = new EmployeeModel();

                retEmpObj.EmployeeId = extRefObj.ExternalReferrerId;

                retEmpObj.FullName = extRefObj.ReferrerName;
                retEmpObj.ContactAddress = extRefObj.ContactAddress;
                retEmpObj.ContactNumber = extRefObj.ContactNumber;
                retEmpObj.Email = extRefObj.EmailAddress;
                retEmpObj.PANNumber = extRefObj.PANNumber;
                retEmpObj.TDSPercent = extRefObj.TDSPercent;
                retEmpObj.IsIncentiveApplicable = extRefObj.IsIncentiveApplicable;
                retEmpObj.IsActive = extRefObj.IsActive;
                retEmpObj.IsExternal = true;//this will be true by default since it's external referral. 
                //Since FName and LName are NOT-NULL in db, we're sending Hardcoded value in those fields.
                //Below value won't be shown anywhere. 
                retEmpObj.FirstName = "External";
                retEmpObj.LastName = "External";

            }
            return retEmpObj;
        }



        public ExternalReferrerVM GetExtRefModelFromEmployeeModel(EmployeeModel empObj)
        {
            ExternalReferrerVM retExtRefObj = null;

            if (empObj != null)
            {
                retExtRefObj = new ExternalReferrerVM();
                retExtRefObj.ExternalReferrerId = empObj.EmployeeId;
                retExtRefObj.ReferrerName = empObj.FullName;
                retExtRefObj.ContactAddress = empObj.ContactAddress;
                retExtRefObj.ContactNumber = empObj.ContactNumber;
                retExtRefObj.EmailAddress = empObj.Email;
                retExtRefObj.PANNumber = empObj.PANNumber;
                retExtRefObj.TDSPercent = empObj.TDSPercent;
                retExtRefObj.IsIncentiveApplicable = empObj.IsIncentiveApplicable;
                retExtRefObj.IsActive = empObj.IsActive;
            }
            return retExtRefObj;
        }


        public void UpdateBillItemsOfEmployee(EmployeeModel currEmployee, MasterDbContext masterDbContext)
        {

            List<BillItemPrice> itemList = currEmployee.ServiceItemsList;
            //BillingDbContext bilDbContext = new BillingDbContext(connString);


            itemList.ForEach(itm =>
            {
                //check if  current billingitem is already there.
                //add new if not exists, update if already exists.

                //case: 1 - Employee and Items are Fresh new, Employee is just added.
                //in this case: ItemId will always be Zero.
                if (itm.ItemId == 0)
                {
                    //Item Doesn't exist. add it.
                    itm.ItemId = currEmployee.EmployeeId;
                    itm.ProcedureCode = currEmployee.EmployeeId.ToString();
                    masterDbContext.BillItemPrices.Add(itm);
                    masterDbContext.SaveChanges();
                }
                else
                {
                    //Case:2 : Employee already existsm, search for the billItem.

                    BillItemPrice itmFromServer = masterDbContext.BillItemPrices
                                                .Where(b => b.ServiceDepartmentId == itm.ServiceDepartmentId && itm.ItemId == b.ItemId).FirstOrDefault();



                    //case: 2.1: Item is not adde in billitemprice table.
                    // add a new item.
                    if (itmFromServer == null)
                    {
                        itm.ItemId = currEmployee.EmployeeId;
                        itm.ProcedureCode = currEmployee.EmployeeId.ToString();
                        masterDbContext.BillItemPrices.Add(itm);
                        masterDbContext.SaveChanges();
                    }
                    else
                    {
                        //case: 2.2: Item is already there in BillItemPrice table, Update It.

                        itmFromServer.ItemName = itm.ItemName;
                        itmFromServer.Price = itm.Price;
                        itmFromServer.EHSPrice = itm.EHSPrice;
                        itmFromServer.SAARCCitizenPrice = itm.SAARCCitizenPrice;
                        itmFromServer.ForeignerPrice = itm.ForeignerPrice;
                        itmFromServer.InsForeignerPrice = itm.InsForeignerPrice;
                        itmFromServer.IsEHSPriceApplicable = itm.IsEHSPriceApplicable;
                        itmFromServer.IsSAARCPriceApplicable = itm.IsSAARCPriceApplicable;
                        itmFromServer.IsForeignerPriceApplicable = itm.IsForeignerPriceApplicable;
                        itmFromServer.IsInsForeignerPriceApplicable = itm.IsInsForeignerPriceApplicable;
                        itmFromServer.IsFractionApplicable = itm.IsFractionApplicable;
                        masterDbContext.Entry(itmFromServer).Property(b => b.ItemName).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.Price).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.EHSPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.SAARCCitizenPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.ForeignerPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.InsForeignerPrice).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsEHSPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsSAARCPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsForeignerPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsInsForeignerPriceApplicable).IsModified = true;
                        masterDbContext.Entry(itmFromServer).Property(b => b.IsFractionApplicable).IsModified = true;

                        masterDbContext.SaveChanges();

                    }
                }
            });

        }


    }
}


