using DanpheEMR.Controllers.Billing;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.BillingModels.DischargeStatementModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.Services.Billing.DTO;
using DanpheEMR.Services.ProvisionalDischarge.DTO;
using DanpheEMR.Utilities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.ProvisionalDischarge
{
    public class ProvisionalDischargeService : IProvisionalDischargeService
    {
        public object PostProvisionalDischarge(BillingDbContext billingDbContext, ProvisionalDischarge_DTO provisionalDischarge, RbacUser currentUser)
        {

            AdmissionModel admission = billingDbContext.Admissions.Where(adt => adt.PatientVisitId == provisionalDischarge.PatientVisitId && adt.PatientId == provisionalDischarge.PatientId).FirstOrDefault();

            PatientBedInfo bedInfo = billingDbContext.PatientBedInfos
                                                     .Where(bed => bed.PatientVisitId == provisionalDischarge.PatientVisitId)
                                                     .OrderByDescending(bed => bed.PatientBedInfoId).FirstOrDefault();
            if (admission == null || bedInfo == null)
            {
                throw new Exception("Either Admission Detail is not found Or Patient BedInfo is not found");
            }

            //Step 1: Update AdmissionStatus to "discharged", IsProvisionalDischarge to true and IsProvisionalDischargeCleared to false.
            admission.AdmissionStatus = ENUM_AdmissionStatus.discharged;
            admission.DischargeDate = provisionalDischarge.DischargeDate;
            admission.BillStatusOnDischarge = ENUM_BillingStatus.provisional; //Krishna, to describe Provisional Discharge
            admission.DischargedBy = currentUser.EmployeeId;
            admission.ModifiedBy = currentUser.EmployeeId;
            admission.ModifiedOn = DateTime.Now;
            admission.ProcedureType = provisionalDischarge.ProcedureType;
            admission.DiscountSchemeId = provisionalDischarge.DiscountSchemeId;
            admission.DischargeRemarks = provisionalDischarge.Remarks;
            admission.IsProvisionalDischarge = true;
            admission.IsProvisionalDischargeCleared = false;
            billingDbContext.Entry(admission).State = EntityState.Modified;
            billingDbContext.SaveChanges();

            //Step 2: Release Bed and update Patients Bed Transaction Info with OutAction to "discharged".
            FreeBed(bedInfo.PatientBedInfoId, provisionalDischarge.DischargeDate, admission.AdmissionStatus, billingDbContext, currentUser);


            //Step 3: Update BillingTransactionItems to Set IsProvisionalDischarge to true.
            UpdateBillingTransactionItems(billingDbContext, admission, currentUser);

            return "Provisional Discharge Successful";
        }

        private void UpdateBillingTransactionItems(BillingDbContext billingDbContext, AdmissionModel admission, RbacUser currentUser)
        {
            List<BillingTransactionItemModel> billingTransactionItems = billingDbContext.BillingTransactionItems.Where(a => a.PatientVisitId == admission.PatientVisitId
                                                                                                                        && a.PatientId == admission.PatientId
                                                                                                                        && a.BillStatus == ENUM_BillingStatus.provisional).ToList();
            if (billingTransactionItems != null && billingTransactionItems.Count > 0)
            {
                billingTransactionItems.ForEach(itm =>
                {
                    itm.IsProvisionalDischarge = true;
                    itm.ModifiedBy = currentUser.EmployeeId;
                    itm.ModifiedOn = DateTime.Now;
                    itm.Remarks = "Provisional Discharge";
                });

                billingDbContext.SaveChanges();
            }
        }

        private void FreeBed(int patientBedInfoId, DateTime dischargeDate, string admissionStatus, BillingDbContext billingDbContext, RbacUser currentUser)
        {
            PatientBedInfo bedInfo = billingDbContext.PatientBedInfos
                                                     .Where(b => b.PatientBedInfoId == patientBedInfoId)
                                                     .FirstOrDefault();
            if (bedInfo == null)
            {
                throw new Exception("Patient Bed Info is not found in system!");
            }

            UpdateIsOccupiedStatus(bedInfo.BedId, false, billingDbContext);
            //endedOn can get updated from Billing Edit item as well.
            if (bedInfo.EndedOn == null)
            {
                bedInfo.EndedOn = dischargeDate;
            }


            if (admissionStatus == ENUM_AdmissionStatus.discharged)
            {
                bedInfo.OutAction = ENUM_AdmissionStatus.discharged;
            }
            else
            {
                bedInfo.OutAction = null;
            }
            bedInfo.ModifiedBy = currentUser.EmployeeId;
            bedInfo.ModifiedOn = DateTime.Now;

            billingDbContext.Entry(bedInfo).State = EntityState.Modified;
            billingDbContext.SaveChanges();
        }

        private void UpdateIsOccupiedStatus(int bedId, bool status, BillingDbContext billingDbContext)
        {
            BedModel selectedBed = billingDbContext.Beds.Where(b => b.BedId == bedId).FirstOrDefault();
            if (selectedBed == null)
            {
                throw new Exception("Bed is not found in the system!");
            }
            selectedBed.IsOccupied = status;
            billingDbContext.Entry(selectedBed).State = EntityState.Modified;
            billingDbContext.SaveChanges();

        }

        public object GetProvisionalDischargeList(BillingDbContext billingDbContext)
        {
            DataTable dtProvisionalDischargeList = DALFunctions.GetDataTableFromStoredProc("SP_BIL_GetProvisionalDischargeList", billingDbContext);
            var provisionalDischargeList = DataTableToList.ConvertToList<ProvisionalDischargeList_DTO>(dtProvisionalDischargeList);
            return provisionalDischargeList;
        }

        public object GetProvisionalDischargeItems(BillingDbContext billingDbContext, int patientId, int schemeId, int patientVisitId)
        {
            var patientDetail = billingDbContext.Patient.Include("CountrySubDivision").Where(p => p.PatientId == patientId).FirstOrDefault();


            var provisionalDischargeItems = (from bill in billingDbContext.BillingTransactionItems.Include("ServiceDepartment")
                                             join priceCatServItm in billingDbContext.BillItemsPriceCategoryMaps
                                             on new { serviceItemId = bill.ServiceItemId, priceCategoryId = bill.PriceCategoryId } equals new { serviceItemId = priceCatServItm.ServiceItemId, priceCategoryId = priceCatServItm.PriceCategoryId }
                                             where bill.BillStatus == ENUM_BillingStatus.provisional && bill.IsProvisionalDischarge == true
                                             && bill.PatientVisitId == patientVisitId && bill.PatientId == patientId && bill.DiscountSchemeId == schemeId
                                             select new BillingTransactionItems_DTO
                                             {
                                                 BillingTransactionItemId = bill.BillingTransactionItemId,
                                                 BillingTransactionId = bill.BillingTransactionId,
                                                 PatientId = bill.PatientId,
                                                 PerformerId = bill.PerformerId,
                                                 PerformerName = bill.PerformerName,
                                                 ServiceDepartmentId = bill.ServiceDepartmentId,
                                                 ServiceDepartmentName = bill.ServiceDepartmentName,
                                                 ServiceItemId = bill.ServiceItemId,
                                                 PriceCategoryId = bill.PriceCategoryId,
                                                 ItemCode = bill.ItemCode,
                                                 IntegrationItemId = bill.IntegrationItemId,
                                                 ProcedureCode = bill.ProcedureCode,
                                                 ItemId = bill.ItemId,
                                                 ItemName = bill.ItemName,
                                                 Price = bill.Price,
                                                 Quantity = bill.Quantity,
                                                 SubTotal = bill.SubTotal,
                                                 DiscountPercent = bill.DiscountPercent,
                                                 DiscountPercentAgg = bill.DiscountPercentAgg,
                                                 DiscountAmount = bill.DiscountAmount,
                                                 Tax = bill.Tax,
                                                 TotalAmount = bill.TotalAmount,
                                                 BillStatus = bill.BillStatus,
                                                 RequisitionId = bill.RequisitionId,
                                                 RequisitionDate = bill.RequisitionDate,
                                                 CounterDay = bill.CounterDay,
                                                 CounterId = bill.CounterId,
                                                 PaidDate = bill.PaidDate,
                                                 ReturnStatus = bill.ReturnStatus,
                                                 ReturnQuantity = bill.ReturnQuantity,
                                                 CreatedBy = bill.CreatedBy,
                                                 CreatedOn = bill.CreatedOn,
                                                 Remarks = bill.Remarks,
                                                 CancelRemarks = bill.CancelRemarks,
                                                 TaxPercent = bill.TaxPercent,
                                                 CancelledOn = bill.CancelledOn,
                                                 CancelledBy = bill.CancelledBy,
                                                 PrescriberId = bill.PrescriberId,
                                                 PatientVisitId = bill.PatientVisitId,
                                                 BillingPackageId = bill.BillingPackageId,
                                                 TaxableAmount = bill.TaxableAmount,
                                                 NonTaxableAmount = bill.NonTaxableAmount,
                                                 PaymentReceivedBy = bill.PaymentReceivedBy,
                                                 PaidCounterId = bill.PaidCounterId,
                                                 BillingType = bill.BillingType,
                                                 RequestingDeptId = bill.RequestingDeptId,
                                                 ModifiedBy = bill.ModifiedBy,
                                                 ModifiedOn = bill.ModifiedOn,
                                                 IsCoPayment = bill.IsCoPayment,
                                                 CoPaymentCashAmount = bill.CoPaymentCashAmount,
                                                 CoPaymentCreditAmount = bill.CoPaymentCreditAmount,
                                                 PatientInsurancePackageId = bill.PatientInsurancePackageId,
                                                 ServiceDepartment = bill.ServiceDepartment,
                                                 VisitType = bill.VisitType,
                                                 PriceCategory = bill.PriceCategory,
                                                 ProvisionalReceiptNo = bill.ProvisionalReceiptNo,
                                                 ProvisionalFiscalYearId = bill.ProvisionalFiscalYearId,
                                                 IsInsurance = bill.IsInsurance,
                                                 DiscountSchemeId = bill.DiscountSchemeId,
                                                 OrderStatus = bill.OrderStatus,
                                                 LabTypeName = bill.LabTypeName,
                                                 ReferredById = bill.ReferredById,
                                                 DischargeStatementId = bill.DischargeStatementId,
                                                 IsPriceChangeAllowed = priceCatServItm.IsPriceChangeAllowed
                                             }).ToList().OrderBy(b => b.BillingTransactionItemId);

            var result = new
            {
                Patient = patientDetail,
                ProvisionalItems = provisionalDischargeItems
            };
            return result;
        }

        public object DiscardProvisionalItems(BillingDbContext billingDbContext, DiscardProvisionalItems_DTO discardProvisionalItems, RbacUser currentUser)
        {
            var admissionDetail = billingDbContext.Admissions.FirstOrDefault(adm => adm.PatientVisitId == discardProvisionalItems.PatientVisitId);
            if (admissionDetail == null)
            {
                throw new Exception();
            }
            admissionDetail.ModifiedBy = currentUser.EmployeeId;
            admissionDetail.ModifiedOn = DateTime.Now;
            admissionDetail.IsProvisionalDischargeCleared = true;

            billingDbContext.Entry(admissionDetail).State = EntityState.Modified;
            billingDbContext.SaveChanges();

            var billingTransactionItems = billingDbContext.BillingTransactionItems.Where(itm => itm.PatientVisitId == discardProvisionalItems.PatientVisitId && itm.BillStatus == ENUM_BillingStatus.provisional).ToList();
            if (billingTransactionItems != null && billingTransactionItems.Count > 0)
            {
                billingTransactionItems.ForEach(itm =>
                {
                    itm.BillStatus = ENUM_BillingStatus.discard;
                    itm.ModifiedBy = currentUser.EmployeeId;
                    itm.ModifiedOn = DateTime.Now;
                    itm.Remarks = discardProvisionalItems.DiscardRemarks;
                });

            }
            billingDbContext.SaveChanges();
            return "Discarded All Items Successfully";

        }

        public object PostPayProvisional(BillingDbContext billingDbContext, string postDataString, RbacUser currentUser, string connString)
        {
            
            BillingTransactionModel billingTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(postDataString);
            if (billingTransaction == null)
            {
                throw new ArgumentNullException(nameof(billingTransaction));
            }

            int FiscalYearId = GetFiscalYear(billingDbContext);
            DateTime currentDate = DateTime.Now;
            //Step 1: Create a Discharge Statement
            DischargeStatementModel dischargeStatement = SaveDischargeStatement(billingDbContext, currentUser, FiscalYearId, currentDate, billingTransaction);

            //Step 2: Create a Discharge Invoice
            if (billingTransaction.BillingTransactionItems.Count() > 0)
            {
                SaveBillingTransaction(currentUser, currentDate, billingTransaction, dischargeStatement.DischargeStatementId, billingDbContext, connString);
            }

            return new
            {
                DischargeStatementId = dischargeStatement.DischargeStatementId,
                PatientId = billingTransaction.PatientId,
                PatientVisitId = dischargeStatement.PatientVisitId
            };
        }

        private DischargeStatementModel SaveDischargeStatement(BillingDbContext billingDbContext, RbacUser currentUser, int FiscalYearId, DateTime currentDate, BillingTransactionModel billingTransaction)
        {
            DischargeStatementModel dischargeStatement = new DischargeStatementModel();

            int StatementNo = (from dischargeInfo in billingDbContext.DischargeStatements
                               where dischargeInfo.FiscalYearId == FiscalYearId
                               select dischargeInfo.StatementNo).DefaultIfEmpty(0).Max();

            dischargeStatement.StatementNo = StatementNo + 1;
            dischargeStatement.FiscalYearId = FiscalYearId;
            dischargeStatement.StatementDate = currentDate;
            dischargeStatement.StatementTime = currentDate.TimeOfDay;
            dischargeStatement.CreatedOn = currentDate;
            dischargeStatement.PatientId = billingTransaction.PatientId;
            dischargeStatement.PatientVisitId = (int)billingTransaction.PatientVisitId;
            dischargeStatement.CreatedBy = currentUser.EmployeeId;
            dischargeStatement.IsActive = true;
            dischargeStatement.PrintedOn = currentDate;
            dischargeStatement.PrintCount = 1;
            dischargeStatement.PrintedBy = currentUser.EmployeeId;

            billingDbContext.DischargeStatements.Add(dischargeStatement);
            billingDbContext.SaveChanges();
            return dischargeStatement;
        }

        private void SaveBillingTransaction(RbacUser currentUser, DateTime currentDate, BillingTransactionModel billingTransaction, int dischargeStatementId, BillingDbContext billingDbContext, string connString)
        {
            BillingTransactionModel billTransaction = billingTransaction;

            if (billTransaction != null)
            {
                if (BillingTransactionBL.IsDepositAvailable(billingDbContext, billTransaction.PatientId, billTransaction.DepositUsed))
                {
                   
                    billTransaction = BillingTransactionBL.PostBillingTransaction(billingDbContext, connString, null, billTransaction, currentUser, DateTime.Now, dischargeStatementId);

                    billTransaction.BillingUserName = currentUser.UserName;

                    var admissionDetail = billingDbContext.Admissions.FirstOrDefault(adm => adm.PatientVisitId == billTransaction.PatientVisitId);
                    if (admissionDetail != null && admissionDetail.IsProvisionalDischarge == true && admissionDetail.IsProvisionalDischargeCleared == false && billingTransaction.IsProvisionalDischargeCleared == true) 
                    {
                        admissionDetail.ModifiedBy = currentUser.EmployeeId;
                        admissionDetail.ModifiedOn = DateTime.Now;
                        admissionDetail.IsProvisionalDischargeCleared = true;

                        billingDbContext.Entry(admissionDetail).State = EntityState.Modified;
                        billingDbContext.SaveChanges();
                    }
                }
                else
                {
                    throw new Exception("Deposit Amount is Invalid, Please try again.");
                }

            }
        }

        private int GetFiscalYear(BillingDbContext billingDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            var FiscalYear = billingDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
            int fiscalYearId = 0;
            if (FiscalYear != null)
            {
                fiscalYearId = FiscalYear.FiscalYearId;
            }
            return fiscalYearId;
        }

    }
}
