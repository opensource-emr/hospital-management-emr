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

namespace DanpheEMR.Controllers
{

    public class IpBillingController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        public IpBillingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
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
                                          pat.PhoneNumber,
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
                                          ProvisionalAmount = (
                                                   dbContext.BillingTransactionItems.Where(itm => itm.PatientId == pat.PatientId
                                                   && itm.BillStatus == "provisional").Sum(itm => itm.TotalAmount)
                                                   ),
                                          DepositAdded = (
                                             dbContext.BillingDeposits.Where(dep => dep.PatientId == pat.PatientId &&
                                                                             dep.PatientVisitId == vis.PatientVisitId &&
                                                                             dep.DepositType.ToLower() == "deposit" &&
                                                                             dep.IsActive == true)
                                              .Sum(dep => dep.Amount)
                                           ),

                                          DepositReturned = (
                                                 dbContext.BillingDeposits.Where(dep =>
                                                        dep.PatientId == pat.PatientId &&
                                                        dep.PatientVisitId == vis.PatientVisitId &&
                                                        (dep.DepositType.ToLower() == "depositdeduct" || dep.DepositType.ToLower() == "returndeposit") &&
                                                        dep.IsActive == true).Sum(dep => dep.Amount)
                                           ),

                                          BedInformation = (from bedInfos in dbContext.PatientBedInfos
                                                            where bedInfos.PatientVisitId == adm.PatientVisitId
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
                {
                    //Check if we can apply ipVisitId condition here.. 
                    var pendingItems = dbContext.BillingTransactionItems.Where(itm => itm.PatientId == patientId
                                                  && itm.BillStatus == "provisional" && itm.Quantity > 0
                                                  && (itm.IsInsurance == false || itm.IsInsurance == null)).AsEnumerable().ToList(); //Excluding insurance items
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
                           if (itm.ItemId == bedPatInfo.BedFeatureId && bedPatInfo.EndedOn == null && itm.ModifiedBy == null)
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
                                       AdmittedOn = adm.AdmissionDate,
                                       DischargedOn = adm.AdmissionStatus == "admitted" ? (DateTime?)DateTime.Now : adm.DischargeDate,
                                       AdmittingDoctorId = adm.AdmittingDoctorId,
                                       AdmittingDoctorName = doc != null ? (string.IsNullOrEmpty(doc.Salutation) ? "" : doc.Salutation + ". ") + doc.FirstName + " " + (string.IsNullOrEmpty(doc.MiddleName) ? "" : doc.MiddleName + " ") + doc.LastName : null,
                                       ProcedureType = adm.ProcedureType,
                                       ProvisionalItems = (
                                                dbContext.BillingTransactionItems.Where(itm => itm.PatientId == pat.PatientId
                                                && itm.BillStatus == "provisional" && itm.Quantity > 0
                                                && (itm.IsInsurance == false || itm.IsInsurance == null))).ToList(), //excluding Insurance Items

                                       DepositAdded = (
                                          dbContext.BillingDeposits.Where(dep => dep.PatientId == pat.PatientId &&
                                                                        dep.PatientVisitId == vis.PatientVisitId &&
                                                                        dep.DepositType.ToLower() == "deposit" &&
                                                                        dep.IsActive == true)
                                           .Sum(dep => dep.Amount)
                                        ),

                                       DepositReturned = (
                                              dbContext.BillingDeposits.Where(dep =>
                                                  dep.PatientId == pat.PatientId &&
                                                  dep.PatientVisitId == vis.PatientVisitId &&
                                                  (dep.DepositType.ToLower() == "depositdeduct" || dep.DepositType.ToLower() == "returndeposit") &&
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
                        PendingBillItems = pendingItems,
                        allBillItem = billItems
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
                                        deposit.PatientVisitId == ipVisitId && deposit.DepositType!= "depositcancel" &&
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
                                        deposit.PatientVisitId == ipVisitId &&
                                        ((deposit.IsActive == true && deposit.DepositType == "Deposit")
                                        || (deposit.BillingTransactionId == billingTxnId && (deposit.DepositType == "depositdeduct" || deposit.DepositType == "ReturnDeposit")))
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
                                             CountrySubDivision = sub.CountrySubDivisionName
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
                                            ExchangeRate = bil.ExchangeRate
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
                                billTransaction = BillingTransactionBL.PostBillingTransaction(billingDbContext, connString, billTransaction, currentUser.EmployeeId, currentDate);

                                //step:3-- if there's deposit balance, then add a return transaction to deposit table. 
                                if (billTransaction.PaymentMode != "credit" && billTransaction.DepositBalance != null && billTransaction.DepositBalance > 0)
                                {
                                    BillingDeposit dep = new BillingDeposit()
                                    {
                                        DepositType = "ReturnDeposit",
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
                                        ReceiptNo = billTransaction.ReceiptNo
                                    };

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
                                        var txnItem = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext, itm, "adtCancel", billTransaction.CreatedBy.Value, currentDate, billTransaction.CounterId, null);
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
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                if (reqType == "update-adtItems-duration")
                {
                    List<BedDurationTxnDetailsVM> bedDurationDetails = DanpheJSONConvert.DeserializeObject<List<BedDurationTxnDetailsVM>>(str);
                    if (bedDurationDetails != null && bedDurationDetails.Count > 0)
                    {
                        double totalDuration = bedDurationDetails[0].TotalDays;
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
