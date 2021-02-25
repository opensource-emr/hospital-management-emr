using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using Microsoft.Extensions.Options;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using System.Xml;
using Newtonsoft.Json;
using DanpheEMR.Security;
using DanpheEMR.Controllers.Billing;
using System.Data;
using System.Threading.Tasks;
using DanpheEMR.Enums;

namespace DanpheEMR.Controllers
{

    public class IpBillingController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        bool realTimeRemoteSyncEnabled = false;
        public IpBillingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
        }



        [HttpGet]
        public string Get(string reqType, int patientId, int ipVisitId, int? billingTxnId, string billStatus)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                BillingDbContext dbContext = new BillingDbContext(connString);
                //sud:10Sept'18 -- Pending in below function-- get ward/bed details of patient.
                if (reqType == "list-ip-patients")
                {

                    var ipPatients = (from pat in dbContext.Patient
                                      join adm in dbContext.Admissions
                                      on pat.PatientId equals adm.PatientId
                                      where adm.AdmissionStatus == "admitted"
                                      join vis in dbContext.Visit
                                      on adm.PatientVisitId equals vis.PatientVisitId
                                      join doc in dbContext.Employee.DefaultIfEmpty()
                                      on adm.AdmittingDoctorId equals doc.EmployeeId

                                      select new
                                      {
                                          PatientId = pat.PatientId,
                                          PatientNo = pat.PatientCode,
                                          pat.DateOfBirth,
                                          pat.Gender,
                                          //if careofpersonPhonenumber is not empty then add "/CareOfPersonPhoneNo", else Don't add anything..
                                          PhoneNumber = pat.PhoneNumber + ( String.IsNullOrEmpty(adm.CareOfPersonPhoneNo) ? "" : " / " + adm.CareOfPersonPhoneNo),
                                          VisitId = adm.PatientVisitId,
                                          IpNumber = vis.VisitCode,
                                          PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                          FirstName = pat.FirstName,
                                          LastName = pat.LastName,
                                          MiddleName = pat.MiddleName,
                                          AdmittedDate = adm.AdmissionDate,
                                          DischargeDate = adm.AdmissionStatus == "admitted" ? adm.DischargeDate : (DateTime?)DateTime.Now,
                                          AdmittingDoctorId = adm.AdmittingDoctorId,
                                          AdmittingDoctorName = doc != null ? doc.FirstName + " " + doc.LastName : null,
                                          //sud:3Sept'19--removed provisional since it's not being used, also its consuming lot of time for execution.
                                          //ProvisionalAmount = (
                                          //         dbContext.BillingTransactionItems.Where(itm => itm.PatientId == pat.PatientId
                                          //         && itm.BillStatus == "provisional").Sum(itm => itm.TotalAmount)
                                          //         ),
                                          DepositAdded = (
                                             dbContext.BillingDeposits.Where(dep => dep.PatientId == pat.PatientId &&
                                                                             dep.PatientVisitId == vis.PatientVisitId &&
                                                                             dep.DepositType == ENUM_BillDepositType.Deposit // "deposit" 
                                                                             && dep.IsActive == true)
                                              .Sum(dep => dep.Amount)
                                           ),

                                          DepositReturned = (
                                                 dbContext.BillingDeposits.Where(dep =>
                                                        dep.PatientId == pat.PatientId &&
                                                        dep.PatientVisitId == vis.PatientVisitId &&
                                                         //(dep.DepositType.ToLower() == "depositdeduct" || dep.DepositType.ToLower() == "returndeposit")
                                                         (dep.DepositType.ToLower() == ENUM_BillDepositType.DepositDeduct.ToLower() || dep.DepositType.ToLower() == ENUM_BillDepositType.ReturnDeposit.ToLower())
                                                         && dep.IsActive == true).Sum(dep => dep.Amount)
                                           ),

                                          BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                            where bedInfos.PatientVisitId == adm.PatientVisitId && bedInfos.IsActive == true
                                                            select new
                                                            {
                                                                Ward = bedInfos.Ward.WardName,
                                                                BedCode = bedInfos.Bed.BedCode,
                                                                BedNumber = bedInfos.Bed.BedNumber,
                                                                StartedOn = bedInfos.StartedOn,
                                                            }).OrderByDescending(a => a.StartedOn).FirstOrDefault()
                                      }).ToList();

                    responseData.Results = ipPatients.OrderByDescending(a => a.AdmittedDate);
                }
                else if (reqType == "pat-pending-items")
                {//Sanjit / Dinesh :We need to check the items with the Itemid as well as servicedepartmentid
                    var BedServiceDepartmentId = dbContext.AdminParameters.Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "Bed_Charges_SevDeptId").FirstOrDefault().ParameterValue;
                    var intbedservdeptid = Convert.ToInt64(BedServiceDepartmentId);
                    //Check if we can apply ipVisitId condition here.. 
                    var pendingItems = dbContext.BillingTransactionItems.Where(itm => itm.PatientId == patientId
                                                  && itm.BillStatus == ENUM_BillingStatus.provisional //"provisional" //&& itm.Quantity > 0
                                                  && (itm.IsInsurance == false || itm.IsInsurance == null)).AsEnumerable().ToList(); //Excluding insurance items

                    ////sud:30Apr'20--AllEmployee not needed in this API, this is available in client side already.. 
                    //var allEmployees = (from emp in dbContext.Employee
                    //                    join dep in dbContext.Departments
                    //                    on emp.DepartmentId equals dep.DepartmentId into empDpt
                    //                    from emp2 in empDpt.DefaultIfEmpty()
                    //                    select new
                    //                    {
                    //                        EmployeeId = emp.EmployeeId,
                    //                        FullName = emp.FullName,
                    //                        FirstName = emp.FirstName,
                    //                        DepartmentCode = emp2 != null ? emp2.DepartmentCode : "N/A",
                    //                        DepartmentName = emp2 != null ? emp2.DepartmentName : "N/A"
                    //                    }).ToList();


                    var bedPatInfo = (from bedInfo in dbContext.PatientBedInfos
                                      where bedInfo.PatientVisitId == ipVisitId
                                      select bedInfo).OrderBy(x => x.PatientBedInfoId).ToList().LastOrDefault();
                    DateTime admDate = dbContext.Admissions.Where(a => a.PatientVisitId == bedPatInfo.PatientVisitId && a.PatientId == bedPatInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
                    var tempTime = admDate.TimeOfDay;
                    var EndDateTime = DateTime.Now.Date + tempTime;
                    TimeSpan qty;
                    var checkBedFeatureId = dbContext.PatientBedInfos.Where(a => a.PatientVisitId == bedPatInfo.PatientVisitId && a.PatientId == bedPatInfo.PatientId && bedPatInfo.BedFeatureId == a.BedFeatureId).Select(a => a.BedFeatureId).ToList();
                    pendingItems.ForEach(itm =>
                       {
                           //Sanjit / Dinesh :Currently servicedepartment name is hardcoded we need to parameterize later through cfg parameters
                           if (itm.ItemId == bedPatInfo.BedFeatureId && itm.ServiceDepartmentId == intbedservdeptid && bedPatInfo.EndedOn == null && itm.ModifiedBy == null)
                           {
                               //var StartedOn = Convert.ToDateTime(bedPatInfo.StartedOn).Date;
                               //int totalDays = Convert.ToInt32((DateTime.Now.Date - StartedOn).TotalDays);
                               //itm.Quantity = itm.Quantity + totalDays;  
                               // TimeSpan qty = DateTime.Now.Subtract(bedPatInfo.StartedOn.Value);
                               // itm.Quantity =  (int)qty.TotalDays + itm.Quantity;
                               itm.IsLastBed = true;
                               if (DateTime.Now > EndDateTime)
                               {
                                   qty = EndDateTime.Subtract(bedPatInfo.StartedOn.Value);
                                   //qty = bedPatInfo.StartedOn.Value.Subtract(EndDateTime);
                                   itm.Quantity = (checkBedFeatureId.Count > 1) ? ((int)qty.TotalDays + itm.Quantity + 1) : (itm.Quantity = (int)qty.TotalDays + 1);
                                   if (bedPatInfo.StartedOn.Value.Date != EndDateTime.Date)
                                   {
                                       itm.Quantity = (DateTime.Now.TimeOfDay > EndDateTime.TimeOfDay) ? (itm.Quantity + 1) : itm.Quantity;
                                   }
                               }
                               else
                               {
                                   qty = DateTime.Now.Subtract(bedPatInfo.StartedOn.Value);
                                   itm.Quantity = (checkBedFeatureId.Count > 1) ? ((int)qty.TotalDays + itm.Quantity + 1) : ((int)qty.TotalDays) + 1;

                               }
                           }
                       });
                    var itemToRemove = pendingItems.Where(r => r.Quantity == 0).Select(z => z).ToList();
                    if (itemToRemove.Count > 0)
                    {
                        itemToRemove.ForEach(a =>
                        {
                            pendingItems.Remove(a);
                        });
                    }
                    var srvDepts = dbContext.ServiceDepartment.ToList();
                    var billItems = dbContext.BillItemPrice.ToList();
                    //update integrationName and integrationServiceDepartmentName
                    //required while updating quantity of ADT items.
                    pendingItems.ForEach(penItem =>
                    {
                        var itemIntegrationDetail = (from itm in billItems
                                                     join srv in srvDepts on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
                                                     where itm.ServiceDepartmentId == penItem.ServiceDepartmentId && itm.ItemId == penItem.ItemId
                                                     select new
                                                     {
                                                         ItemIntegrationName = itm.IntegrationName,
                                                         SrvIntegrationName = srv.IntegrationName
                                                     }).FirstOrDefault();
                        if (itemIntegrationDetail != null)
                        {
                            penItem.ItemIntegrationName = itemIntegrationDetail.ItemIntegrationName;
                            penItem.SrvDeptIntegrationName = itemIntegrationDetail.SrvIntegrationName;
                        }

                        ////sud:30Apr'20--ModifiedByInformation not needed from here, we're taking it in client side.. hence removing.. 
                        //if (penItem.ModifiedBy != null)
                        //{
                        //    var ModifiedByName = (from emp in dbContext.Employee
                        //                          where emp.EmployeeId == penItem.ModifiedBy
                        //                          select emp.FirstName + " " + emp.LastName).FirstOrDefault();
                        //    penItem.ModifiedByName = ModifiedByName;
                        //}


                        //sud:30Apr'20 Clearing ServiceDepartment Object from PendingItems list.. which is not needed.. and creating heavy data..
                        penItem.ServiceDepartment = null;

                    });
                    var admInfo = (from pat in dbContext.Patient
                                   where pat.PatientId == patientId
                                   join adm in dbContext.Admissions
                                   on pat.PatientId equals adm.PatientId
                                   where adm.PatientVisitId == ipVisitId
                                   join vis in dbContext.Visit
                                   on adm.PatientVisitId equals vis.PatientVisitId
                                   join doc in dbContext.Employee.DefaultIfEmpty()
                                   on adm.AdmittingDoctorId equals doc.EmployeeId

                                   select new
                                   {
                                       AdmissionPatientId = adm.PatientAdmissionId,
                                       PatientId = pat.PatientId,
                                       PatientNo = pat.PatientCode,
                                       pat.Gender,
                                       pat.DateOfBirth,
                                       pat.PhoneNumber,
                                       VisitId = adm.PatientVisitId,
                                       IpNumber = vis.VisitCode,
                                       PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                       FirstName = pat.FirstName,
                                       LastName = pat.LastName,
                                       MiddleName = pat.MiddleName,
                                       MembershipTypeId = pat.MembershipTypeId,
                                       AdmittedOn = adm.AdmissionDate,
                                       DischargedOn = adm.AdmissionStatus == "admitted" ? (DateTime?)DateTime.Now : adm.DischargeDate,
                                       AdmittingDoctorId = adm.AdmittingDoctorId,
                                       AdmittingDoctorName = doc != null ? doc.FullName : null,//sud:30Apr'20 Replacing the concatenation logic with fullname. now we have that in database table.
                                       //AdmittingDoctorName = doc != null ? (string.IsNullOrEmpty(doc.Salutation) ? "" : doc.Salutation + ". ") + doc.FirstName + " " + (string.IsNullOrEmpty(doc.MiddleName) ? "" : doc.MiddleName + " ") + doc.LastName : null,
                                       ProcedureType = adm.ProcedureType,
                                       IsPoliceCase = adm.IsPoliceCase.HasValue? adm.IsPoliceCase : false,
                                       ////sud:30Apr'20--removed-- Below data is not at all required in client side..
                                       //ProvisionalItems = (,
                                       //         dbContext.BillingTransactionItems.Where(itm => itm.PatientId == pat.PatientId
                                       //         && itm.BillStatus == ENUM_BillingStatus.provisional //"provisional" 
                                       //         && itm.Quantity > 0
                                       //         && (itm.IsInsurance == false || itm.IsInsurance == null))).ToList(), //excluding Insurance Items

                                       DepositAdded = (
                                          dbContext.BillingDeposits.Where(dep => dep.PatientId == pat.PatientId &&
                                                                        dep.PatientVisitId == vis.PatientVisitId &&
                                                                        dep.DepositType.ToLower() == ENUM_BillDepositType.Deposit.ToLower()  //"deposit"
                                                                         && dep.IsActive == true)
                                           .Sum(dep => dep.Amount)
                                        
                                        ),

                                       DepositReturned = (
                                              dbContext.BillingDeposits.Where(dep =>
                                                  dep.PatientId == pat.PatientId &&
                                                  dep.PatientVisitId == vis.PatientVisitId &&
                                                  (dep.DepositType.ToLower() == ENUM_BillDepositType.DepositDeduct.ToLower() || dep.DepositType.ToLower() == ENUM_BillDepositType.ReturnDeposit.ToLower()) &&
                                                  //(dep.DepositType.ToLower() == "depositdeduct" || dep.DepositType.ToLower() == "returndeposit") &&
                                                  dep.IsActive == true
                                           ).Sum(dep => dep.Amount)
                                        ),
                                       DepositTxns = (
                                         dbContext.BillingDeposits.Where(dep => dep.PatientId == pat.PatientId &&
                                            //dep.PatientVisitId == vis.PatientVisitId &&
                                            dep.IsActive == true)
                                       ).ToList(),

                                       BedsInformation = (
                                       from bedInfo in dbContext.PatientBedInfos
                                       where bedInfo.PatientVisitId == adm.PatientVisitId
                                       join ward in dbContext.Wards
                                       on bedInfo.WardId equals ward.WardId
                                       join bf in dbContext.BedFeatures
                                       on bedInfo.BedFeatureId equals bf.BedFeatureId
                                       join bed in dbContext.Beds
                                      on bedInfo.BedId equals bed.BedId
                                       select new
                                       {
                                           bedInfo.PatientBedInfoId,
                                           BedId = bedInfo.BedId,
                                           WardId = ward.WardId,
                                           WardName = ward.WardName,
                                           BedFeatureName = bf.BedFeatureName,
                                           bed.BedNumber,
                                           PricePerDay = bedInfo.BedPrice,
                                           StartedOn = bedInfo.StartedOn,
                                           EndedOn = bedInfo.EndedOn.HasValue ? bedInfo.EndedOn : DateTime.Now
                                           //NoOfHours = ((TimeSpan)((bedInfo.EndedOn.HasValue ? bedInfo.EndedOn : DateTime.Now) - bedInfo.StartedOn)).Hours,
                                       }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault(),

                                       BedDetails = (from bedInfos in dbContext.PatientBedInfos
                                                     join bedFeature in dbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                                     join bed in dbContext.Beds on bedInfos.BedId equals bed.BedId
                                                     join ward in dbContext.Wards on bed.WardId equals ward.WardId
                                                     where (bedInfos.PatientVisitId == adm.PatientVisitId)
                                                     select new BedDetailVM
                                                     {
                                                         PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                         BedFeatureId = bedFeature.BedFeatureId,
                                                         WardName = ward.WardName,
                                                         BedCode = bed.BedCode,
                                                         BedFeature = bedFeature.BedFeatureName,
                                                         StartDate = bedInfos.StartedOn,
                                                         EndDate = bedInfos.EndedOn,
                                                         BedPrice = bedInfos.BedPrice,
                                                         Action = bedInfos.Action,
                                                         //calculated in clientSide
                                                         Days = 0,
                                                     }).OrderByDescending(a => a.PatientBedInfoId).ToList()
                                   }).FirstOrDefault();




                    var patIpInfo = new
                    {
                        AdmissionInfo = admInfo,
                        PendingBillItems = pendingItems

                        //allBillItem = billItems, // sud: 30Apr'20-- These two are not needed in this list.. they're already available in client side..
                        //AllEmployees = allEmployees
                    };

                    responseData.Results = patIpInfo;
                }
                else if (reqType == "pat-bill-items-for-receipt")
                {
                    try
                    {
                        DataTable patBillItems = dbContext.GetItemsForBillingReceipt(patientId, billingTxnId, billStatus);
                        responseData.Status = "OK";
                        responseData.Results = patBillItems;
                    }
                    catch (Exception ex)
                    {
                        //Insert exception details into database table.
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = ex.Message;
                    }
                    //return DanpheJSONConvert.SerializeObject(responseData);

                }
                else if (reqType == "additional-info-discharge-receipt" && ipVisitId != 0)
                {
                    RbacDbContext rbacDbContext = new RbacDbContext(connString);
                    AdmissionDetailVM admInfo = null;
                    PatientDetailVM patientDetail = null;
                    List<DepositDetailVM> deposits = null;
                    BillingTransactionDetailVM billingTxnDetail = null;

                    var visitNAdmission = (from visit in dbContext.Visit.Include(v => v.Admission)
                                           where visit.PatientVisitId == ipVisitId
                                           select visit).FirstOrDefault();
                    if (visitNAdmission != null && visitNAdmission.Admission != null)
                    {
                        var patId = visitNAdmission.PatientId;
                        var patVisitId = visitNAdmission.PatientVisitId;
                        ////invoice is not generated till then IsCurrent is false :: 18th Dec '18
                        //bool isCurrent = billingTxnId != null ? false : true;
                        var billTxn = dbContext.BillingTransactions.Where(a => a.BillingTransactionId == billingTxnId).FirstOrDefault();

                        if (billTxn != null && billTxn.ReturnStatus == false)
                        {
                            deposits = (from deposit in dbContext.BillingDeposits
                                        where deposit.PatientId == patId &&
                                        deposit.PatientVisitId == ipVisitId && deposit.DepositType != ENUM_BillDepositType.DepositCancel && //"depositcancel" &&
                                        deposit.IsActive == true
                                        join settlement in dbContext.BillSettlements on deposit.SettlementId
                                        equals settlement.SettlementId into settlementTemp
                                        from billSettlement in settlementTemp.DefaultIfEmpty()
                                        select new DepositDetailVM
                                        {
                                            DepositId = deposit.DepositId,
                                            IsActive = deposit.IsActive,
                                            ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                                            ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                                            Date = deposit.CreatedOn,
                                            Amount = deposit.Amount,
                                            Balance = deposit.DepositBalance,
                                            DepositType = deposit.DepositType,
                                            ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                                        }).OrderBy(a => a.Date).ToList();
                        }
                        else
                        {
                            deposits = (from deposit in dbContext.BillingDeposits
                                        where deposit.PatientId == patId &&
                                        deposit.PatientVisitId == ipVisitId && deposit.IsActive == true

                                        //
                                        //((deposit.IsActive == true && deposit.DepositType == ENUM_BillDepositType.Deposit) // "Deposit")
                                        //    || (deposit.BillingTransactionId == billingTxnId &&
                                        //         (deposit.DepositType == ENUM_BillDepositType.DepositDeduct || deposit.DepositType == ENUM_BillDepositType.ReturnDeposit))
                                        // )
                                        join settlement in dbContext.BillSettlements on deposit.SettlementId
                                        equals settlement.SettlementId into settlementTemp
                                        from billSettlement in settlementTemp.DefaultIfEmpty()
                                        select new DepositDetailVM
                                        {
                                            DepositId = deposit.DepositId,
                                            IsActive = deposit.IsActive,
                                            ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                                            ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                                            Date = deposit.CreatedOn,
                                            Amount = deposit.Amount,
                                            Balance = deposit.DepositBalance,
                                            DepositType = deposit.DepositType,
                                            ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                                        }).OrderBy(a => a.Date).ToList();
                        }
                        //dischDetail.AdmissionInfo.AdmittingDoctor = "Dr. Anil Shakya";

                        AdmissionDbContext admDbContext = new AdmissionDbContext(connString);
                        EmployeeModel admittingDoc = dbContext.Employee.Where(e => e.EmployeeId == visitNAdmission.ProviderId).FirstOrDefault();
                        DepartmentModel dept = dbContext.Departments.Where(d => d.DepartmentId == admittingDoc.DepartmentId).FirstOrDefault();
                        List<PatientBedInfo> patBeds = admDbContext.PatientBedInfos.Where(b => b.PatientVisitId == visitNAdmission.PatientVisitId).OrderByDescending(a => a.PatientBedInfoId).ToList();

                        WardModel ward = null;
                        //we're getting first ward from admission info as WardName. <needs revision>
                        if (patBeds != null && patBeds.Count > 0)
                        {
                            int wardId = patBeds.ElementAt(0).WardId;
                            ward = admDbContext.Wards.Where(w => w.WardId == wardId).FirstOrDefault();
                        }

                        admInfo = new AdmissionDetailVM()
                        {
                            AdmissionDate = visitNAdmission.Admission.AdmissionDate,
                            DischargeDate = visitNAdmission.Admission.DischargeDate.HasValue ? visitNAdmission.Admission.DischargeDate.Value : DateTime.Now,
                            Department = dept != null ? dept.DepartmentName : "",//need to change this and get this from ADT-Bed Info table--sud: 20Aug'18
                            RoomType = ward != null ? ward.WardName : "",
                            LengthOfStay = CalculateBedStayForAdmission(visitNAdmission.Admission),
                            AdmittingDoctor = visitNAdmission.ProviderName,
                            ProcedureType = visitNAdmission.Admission.ProcedureType
                        };

                        patientDetail = (from pat in dbContext.Patient
                                         join sub in dbContext.CountrySubdivisions on pat.CountrySubDivisionId equals sub.CountrySubDivisionId
                                         where pat.PatientId == visitNAdmission.PatientId
                                         select new PatientDetailVM
                                         {
                                             PatientId = pat.PatientId,
                                             PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                             HospitalNo = pat.PatientCode,
                                             DateOfBirth = pat.DateOfBirth,
                                             Gender = pat.Gender,
                                             Address = pat.Address,
                                             ContactNo = pat.PhoneNumber,
                                             InpatientNo = visitNAdmission.VisitCode,
                                             CountrySubDivision = sub.CountrySubDivisionName,
                                             PANNumber = pat.PANNumber
                                         }).FirstOrDefault();


                    }

                    //ashim: 14Sep2018 : BillingDetail for Discharge Bill

                    billingTxnDetail = (from bil in dbContext.BillingTransactions
                                        join emp in dbContext.Employee on bil.CreatedBy equals emp.EmployeeId
                                        join fiscalYear in dbContext.BillingFiscalYears on bil.FiscalYearId equals fiscalYear.FiscalYearId
                                        where bil.BillingTransactionId == billingTxnId
                                        select new BillingTransactionDetailVM
                                        {
                                            FiscalYear = fiscalYear.FiscalYearFormatted,
                                            ReceiptNo = bil.InvoiceNo,
                                            InvoiceNumber = bil.InvoiceCode + bil.InvoiceNo.ToString(),
                                            BillingDate = bil.CreatedOn,
                                            PaymentMode = bil.PaymentMode,
                                            DepositBalance = bil.DepositBalance + bil.DepositReturnAmount,
                                            CreatedBy = bil.CreatedBy,
                                            DepositDeductAmount = bil.DepositReturnAmount,
                                            TotalAmount = bil.TotalAmount,
                                            Discount = bil.DiscountAmount,
                                            SubTotal = bil.SubTotal,
                                            Quantity = bil.TotalQuantity,
                                            User = "",
                                            Remarks = bil.Remarks,
                                            PrintCount = bil.PrintCount,
                                            ReturnStatus = bil.ReturnStatus,
                                            OrganizationId = bil.OrganizationId,
                                            ExchangeRate = bil.ExchangeRate,
                                            Tender = bil.Tender,
                                            Change = bil.Change
                                        }).FirstOrDefault();
                    if (billingTxnDetail != null)
                    {
                        billingTxnDetail.User = rbacDbContext.Users.Where(usr => usr.EmployeeId == billingTxnDetail.CreatedBy).Select(a => a.UserName).FirstOrDefault();
                        if (billingTxnDetail.OrganizationId != null)
                        {
                            billingTxnDetail.OrganizationName = dbContext.CreditOrganization.Where(a => a.OrganizationId == billingTxnDetail.OrganizationId).Select(b => b.OrganizationName).FirstOrDefault();
                        }
                    }


                    var dischargeBillInfo = new
                    {
                        AdmissionInfo = admInfo,
                        DepositInfo = deposits,
                        BillingTxnDetail = billingTxnDetail,
                        PatientDetail = patientDetail
                    };

                    responseData.Results = dischargeBillInfo;
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

        [HttpPost]// POST api/values
        public string Post()
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                string ipDataString = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                if (reqType == "postBillTransaction")//submit
                {
                    DateTime currentDate = DateTime.Now;
                    BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);

                    if (billTransaction != null)
                    {
                        //Transaction Begins  
                        using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                        {
                            try
                            {
                                //step:1 -- make copy of billingTxnItems into new list, so thate EF doesn't add txn items again.
                                //step:2-- if there's deposit deduction, then add to deposit table.
                                billTransaction = BillingTransactionBL.PostBillingTransaction(billingDbContext, connString, billTransaction, currentUser, currentDate);

                                //step:3-- if there's deposit balance, then add a return transaction to deposit table. 
                                if (billTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                                    && billTransaction.DepositBalance != null && billTransaction.DepositBalance > 0)
                                {
                                    BillingDeposit dep = new BillingDeposit()
                                    {
                                        DepositType = ENUM_BillDepositType.ReturnDeposit, // "ReturnDeposit",
                                        Remarks = "Deposit Refunded from InvoiceNo. " + billTransaction.InvoiceCode + billTransaction.InvoiceNo,
                                        //Remarks = "ReturnDeposit" + " for transactionid:" + billTransaction.BillingTransactionId,
                                        Amount = billTransaction.DepositBalance,
                                        IsActive = true,
                                        BillingTransactionId = billTransaction.BillingTransactionId,
                                        DepositBalance = 0,
                                        FiscalYearId = billTransaction.FiscalYearId,
                                        CounterId = billTransaction.CounterId,
                                        CreatedBy = billTransaction.CreatedBy,
                                        CreatedOn = currentDate,
                                        PatientId = billTransaction.PatientId,
                                        PatientVisitId = billTransaction.PatientVisitId,
                                        PaymentMode = billTransaction.PaymentMode,
                                        PaymentDetails = billTransaction.PaymentDetails,
                                        //ReceiptNo = BillingBL.GetDepositReceiptNo(connString)

                                    };
                                    if (billTransaction.ReceiptNo == null)
                                    {
                                        dep.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                                    }
                                    else
                                    {
                                        dep.ReceiptNo = billTransaction.ReceiptNo;
                                    }


                                    billingDbContext.BillingDeposits.Add(dep);
                                    billingDbContext.SaveChanges();
                                }

                                //For cancel BillingTransactionItems
                                List<BillingTransactionItemModel> item = (from itm in billingDbContext.BillingTransactionItems
                                                                          where itm.PatientId == billTransaction.PatientId && itm.PatientVisitId == billTransaction.PatientVisitId && itm.BillStatus == "provisional" && itm.Quantity == 0
                                                                          select itm).ToList();
                                if (item.Count() > 0)
                                {
                                    item.ForEach(itm =>
                                    {
                                        var txnItem = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext, itm, "adtCancel", currentUser, currentDate, billTransaction.CounterId, null);
                                    });
                                }

                                if (realTimeRemoteSyncEnabled)
                                {
                                    if (billTransaction.Patient == null)
                                    {
                                        PatientModel pat = billingDbContext.Patient.Where(p => p.PatientId == billTransaction.PatientId).FirstOrDefault();
                                        billTransaction.Patient = pat;
                                    }
                                    //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                    //BillingBL.SyncBillToRemoteServer(billTransaction, "sales", billingDbContext);
                                    Task.Run(() => BillingBL.SyncBillToRemoteServer(billTransaction, "sales", billingDbContext));

                                }

                                var allPatientBedInfos = (from bedInfos in billingDbContext.PatientBedInfos
                                                          where bedInfos.PatientVisitId == billTransaction.PatientVisitId
                                                          && bedInfos.IsActive == true
                                                          select bedInfos
                                                          ).OrderByDescending(a => a.PatientBedInfoId).Take(2).ToList();

                                if (allPatientBedInfos.Count > 0)
                                {
                                    allPatientBedInfos.ForEach(bed =>
                                    {
                                        var b = billingDbContext.Beds.FirstOrDefault(fd => fd.BedId == bed.BedId);
                                        if (b != null)
                                        {
                                            b.OnHold = null;
                                            b.HoldedOn = null;
                                            billingDbContext.Entry(b).State = EntityState.Modified;
                                            billingDbContext.Entry(b).Property(x => x.OnHold).IsModified = true;
                                            billingDbContext.Entry(b).Property(x => x.HoldedOn).IsModified = true;
                                            billingDbContext.SaveChanges();
                                        }
                                    });
                                }

                                dbContextTransaction.Commit();
                                responseData.Results = billTransaction;
                            }
                            catch (Exception ex)
                            {
                                //rollback all changes if any error occurs
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
                        }
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "billTransaction is invalid";
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
        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                if (reqType == "update-adtItems-duration")
                {
                    List<BedDurationTxnDetailsVM> bedDurationDetails = DanpheJSONConvert.DeserializeObject<List<BedDurationTxnDetailsVM>>(str);
                    if (bedDurationDetails != null && bedDurationDetails.Count > 0)
                    {
                        double totalDuration = bedDurationDetails[0].Days;
                        int patientVisitId = bedDurationDetails[0].PatientVisitId;
                        BillingTransactionItemModel billItem = new BillingTransactionItemModel();

                        //foreach (var bedItem in bedDurationDetails)
                        //{
                        //    billItem = (from bill in billingDbContext.BillingTransactionItems
                        //                where bill.PatientVisitId == bedItem.PatientVisitId
                        //                && bill.ServiceDepartmentName.ToLower() == "bed charges"
                        //                && bill.ItemId == bedItem.BedFeatureId
                        //                select bill).FirstOrDefault();
                        //    if (billItem != null)
                        //    {
                        //        billItem.Quantity = bedItem.Days;
                        //        billItem.SubTotal = bedItem.SubTotal;
                        //        billItem.TaxableAmount = bedItem.TaxableAmount;
                        //        billItem.NonTaxableAmount = bedItem.NonTaxableAmount;
                        //        //sud,Yub : 11Feb'19 -- Re-Calculate DiscountAmount based on Existing Discount Percent.
                        //        billItem.DiscountAmount = (bedItem.SubTotal * billItem.DiscountPercent) / 100;
                        //        billItem.TotalAmount = billItem.SubTotal - billItem.DiscountAmount;
                        //        billingDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
                        //        billingDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
                        //        billingDbContext.Entry(billItem).Property(a => a.TaxableAmount).IsModified = true;
                        //        billingDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;
                        //        billingDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
                        //        billingDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
                        //    }
                        //}

                        //update duration for Medical and Resident officer/Nursing Charges
                        billItem = (from bill in billingDbContext.BillingTransactionItems
                                    join itmCfg in billingDbContext.BillItemPrice on new { bill.ServiceDepartmentId, bill.ItemId } equals new { itmCfg.ServiceDepartmentId, itmCfg.ItemId }
                                    where bill.PatientVisitId == patientVisitId && itmCfg.IntegrationName == "Medical and Resident officer/Nursing Charges"
                                    select bill).FirstOrDefault();
                        if (billItem != null)
                        {
                            billItem.Quantity = totalDuration > 0 ? totalDuration : 1;
                            billItem.SubTotal = billItem.Price * billItem.Quantity;
                            //sud,Yub : 11Feb'19 -- Re-Calculate DiscountAmount based on Existing Discount Percent.
                            billItem.DiscountAmount = (billItem.SubTotal * billItem.DiscountPercent) / 100;
                            billItem.TotalAmount = billItem.SubTotal - billItem.DiscountAmount;
                            // billItem.TotalAmount = billItem.NonTaxableAmount = billItem.SubTotal;//removed: sud:11Feb'19--this is incorrect.
                            billingDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
                            billingDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
                            billingDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
                            billingDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
                            billingDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;

                        }
                        responseData.Status = "OK";
                        billingDbContext.SaveChanges();
                        responseData.Results = "quantity updated";
                    }

                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Unable to upadate bed duration details.";
                    }

                }

                else if (reqType == "update-billtxnItem")
                {
                    List<BillingTransactionItemModel> txnItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(str);
                    if (txnItems != null)
                    {
                        txnItems.ForEach(item =>
                        {
                            item.ModifiedBy = currentUser.EmployeeId;
                            BillingTransactionBL.UpdateBillingTransactionItems(billingDbContext, item);
                        });
                    }

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


        //we're calculating days by subtracting AdmissionDate from DischargeDate
        //minimum days will be 1  <needs revision> sud: 20Aug'18
        private int CalculateBedStayForAdmission(AdmissionModel adm)
        {
            int totalDays = 1;

            if (adm != null)
            {

                DateTime admissionTime = adm.AdmissionDate;
                DateTime dischargeTime = (DateTime)(adm.DischargeDate != null ? adm.DischargeDate : DateTime.Now);

                int daysDiff = ((TimeSpan)(dischargeTime - admissionTime)).Days;
                if (daysDiff != 1)
                {
                    totalDays = daysDiff;
                }
            }
            return totalDays;
        }

    }


}
