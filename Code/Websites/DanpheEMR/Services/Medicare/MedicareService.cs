using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.AccountingModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.ViewModel.Medicare;
using DocumentFormat.OpenXml.Bibliography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Newtonsoft.Json;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using Syncfusion.XlsIO.Implementation.Security;
using System;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace DanpheEMR.Services.Medicare
{
    public class MedicareService : IMedicareService
    {

        public async Task<object> GetMedicarePatientDetails(MedicareDbContext medicareDbContext, int patientId)
        {
            var medicarePatientDetail = new MedicareMemberVsBalanceVM();
            var medicareMember = await medicareDbContext.MedicareMembers.FirstOrDefaultAsync(a => a.PatientId == patientId);
            if (medicareMember == null)
            {
                return null;
            }

            if (!medicareMember.IsDependent)
            {
                medicarePatientDetail = await (from mem in medicareDbContext.MedicareMembers
                                               where mem.MedicareMemberId == medicareMember.MedicareMemberId
                                               join bal in medicareDbContext.MedicareMemberBalance
                                               on mem.MedicareMemberId equals bal.MedicareMemberId
                                               into memBalGroup
                                               from balance in memBalGroup.DefaultIfEmpty()
                                               select new MedicareMemberVsBalanceVM
                                               {
                                                   MedicareMemberId = mem.MedicareMemberId,
                                                   MedicareTypeId = mem.MedicareTypeId,
                                                   FullName = mem.FullName,
                                                   MedicareInstituteCode = mem.MedicareInstituteCode,
                                                   MemberNo = mem.MemberNo,
                                                   HospitalNo = mem.HospitalNo,
                                                   PatientId = mem.PatientId,
                                                   IsDependent = mem.IsDependent,
                                                   ParentMedicareMemberId = mem.ParentMedicareMemberId,
                                                   Relation = mem.Relation,
                                                   MedicareStartDate = mem.MedicareStartDate,
                                                   InsuranceProviderId = mem.InsuranceProviderId,
                                                   InsurancePolicyNo = mem.InsurancePolicyNo,
                                                   DesignationId = mem.DesignationId,
                                                   DepartmentId = mem.DepartmentId,
                                                   DateOfBirth = mem.DateOfBirth,
                                                   InActiveDate = mem.InActiveDate,
                                                   IsOpLimitExceeded = mem.IsOpLimitExceeded,
                                                   IsIpLimitExceeded = mem.IsIpLimitExceeded,
                                                   IsActive = mem.IsActive,
                                                   MedicareBalanceId = balance.MedicareMemberBalanceId,
                                                   OpBalance = balance.OpBalance,
                                                   IpBalance = balance.IpBalance,
                                                   OpUsedAmount = balance.OpUsedAmount,
                                                   IpUsedAmount = balance.IpUsedAmount
                                               }).FirstOrDefaultAsync();
            }
            if (medicareMember.IsDependent)
            {
                if (medicareMember.ParentMedicareMemberId != null)
                {
                    var parentMedicareMemberBalance = await medicareDbContext.MedicareMemberBalance
                                                       .FirstOrDefaultAsync(m => m.MedicareMemberId == medicareMember.ParentMedicareMemberId);

                    medicarePatientDetail = new MedicareMemberVsBalanceVM
                    {
                        MedicareMemberId = medicareMember.MedicareMemberId,
                        MedicareTypeId = medicareMember.MedicareTypeId,
                        FullName = medicareMember.FullName,
                        MedicareInstituteCode = medicareMember.MedicareInstituteCode,
                        MemberNo = medicareMember.MemberNo,
                        HospitalNo = medicareMember.HospitalNo,
                        PatientId = medicareMember.PatientId,
                        IsDependent = medicareMember.IsDependent,
                        ParentMedicareMemberId = medicareMember.ParentMedicareMemberId,
                        Relation = medicareMember.Relation,
                        MedicareStartDate = medicareMember.MedicareStartDate,
                        InsuranceProviderId = medicareMember.InsuranceProviderId,
                        InsurancePolicyNo = medicareMember.InsurancePolicyNo,
                        DesignationId = medicareMember.DesignationId,
                        DepartmentId = medicareMember.DepartmentId,
                        DateOfBirth = medicareMember.DateOfBirth,
                        InActiveDate = medicareMember.InActiveDate,
                        IsOpLimitExceeded = medicareMember.IsOpLimitExceeded,
                        IsIpLimitExceeded = medicareMember.IsIpLimitExceeded,
                        IsActive = medicareMember.IsActive,
                        MedicareBalanceId = parentMedicareMemberBalance.MedicareMemberBalanceId,
                        OpBalance = parentMedicareMemberBalance.OpBalance,
                        IpBalance = parentMedicareMemberBalance.IpBalance,
                        OpUsedAmount = parentMedicareMemberBalance.OpUsedAmount,
                        IpUsedAmount = parentMedicareMemberBalance.IpUsedAmount
                    };
                }
            }

            return medicarePatientDetail;
        }
        public MedicareMember SaveMedicareMemberDetails(MedicareDbContext medicareDbContext, MedicareMemberDto medicareMemberDto, RbacUser currentUser)
        {

            try
            {
                MedicareMember medicareMemberDetail = JsonConvert.DeserializeObject<MedicareMember>(JsonConvert.SerializeObject(medicareMemberDto));
                medicareMemberDetail.CreatedBy = currentUser.EmployeeId;
                medicareMemberDetail.CreatedOn = DateTime.Now;
                medicareDbContext.MedicareMembers.Add(medicareMemberDetail);
                medicareDbContext.SaveChanges();

                //Krishna, 26thJan'23 We need to add Member Balance as well while adding Medicare Member
                if (!medicareMemberDetail.IsDependent)
                {
                    AddMedicareMemberBalanceUsingSelectedMedicareType(medicareDbContext, medicareMemberDetail, currentUser);
                }


                SubLedgerModel subledger = new SubLedgerModel();
                var hospitalId = medicareDbContext.Hospital.Select(h => h.HospitalId).FirstOrDefault();
                if (medicareMemberDto.LedgerId != null)
                {
                    subledger.SubLedgerName = medicareMemberDto.FullName;
                    subledger.LedgerId = medicareMemberDto.LedgerId;
                    subledger.CreatedBy = currentUser.EmployeeId;
                    subledger.Description = null;
                    subledger.IsActive = true;
                    subledger.CreatedOn = DateTime.Now;
                    subledger.OpeningBalance = 0;
                    subledger.DrCr = true;
                    subledger.HospitalId = hospitalId;
                    subledger.IsDefault = false;
                    if (medicareMemberDetail.IsDependent == true)
                    {
                        var dependentCount = medicareDbContext.MedicareMembers
                            .Where(x => x.IsDependent == true &&
                            x.ParentMedicareMemberId == medicareMemberDetail.ParentMedicareMemberId).Count();

                        subledger.SubLedgerCode = medicareMemberDto.MedicareTypeName + "-" + medicareMemberDetail.MemberNo + "(" + (dependentCount + 1) + ")";
                    }
                    else
                    {
                        subledger.SubLedgerCode = medicareMemberDto.MedicareTypeName + "-" + medicareMemberDetail.MemberNo;
                    }
                    medicareDbContext.SubLedger.Add(subledger);
                    medicareDbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("Cannot Map SubLedger");
                }

                LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                ledgerMapping.LedgerId = medicareMemberDto.LedgerId;
                ledgerMapping.SubLedgerId = subledger.SubLedgerId;
                ledgerMapping.ReferenceId = medicareMemberDetail.MedicareMemberId;
                ledgerMapping.HospitalId = hospitalId;
                ledgerMapping.LedgerType = ENUM_ACC_LedgerType.MedicareTypes;
                medicareDbContext.LedgerMapping.Add(ledgerMapping);
                medicareDbContext.SaveChanges();



                SubLedgerBalanceHistory subLedgerBalanceHistory = new SubLedgerBalanceHistory();
                int ficalyearId = medicareDbContext.FiscalYears.Where(f => f.StartDate <= DateTime.Today && f.EndDate >= DateTime.Today).Select(f => f.FiscalYearId).FirstOrDefault();
                subLedgerBalanceHistory.CreatedBy = currentUser.EmployeeId;
                subLedgerBalanceHistory.CreatedOn = DateTime.Now;
                subLedgerBalanceHistory.SubLedgerId = subledger.SubLedgerId;
                subLedgerBalanceHistory.OpeningBalance = 0;
                subLedgerBalanceHistory.OpeningDrCr = true;
                subLedgerBalanceHistory.ClosingBalance = 0;
                subLedgerBalanceHistory.ClosingDrCr = true;
                subLedgerBalanceHistory.HospitalId = hospitalId;
                subLedgerBalanceHistory.FiscalYearId = ficalyearId;
                medicareDbContext.SubLedgerBalanceHistory.Add(subLedgerBalanceHistory);
                medicareDbContext.SaveChanges();
                return medicareMemberDetail;

            }
            catch (Exception ex)
            {

                throw ex;
            }

        }


        private void AddMedicareMemberBalanceUsingSelectedMedicareType(MedicareDbContext medicareDbContext, MedicareMember medicareMemberDetail, RbacUser currentUser)
        {
            var medicareType = medicareDbContext.MedicareTypes.FirstOrDefault(a => a.MedicareTypeId == medicareMemberDetail.MedicareTypeId);
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance
            {
                MedicareMemberId = medicareMemberDetail.MedicareMemberId,
                HospitalNo = medicareMemberDetail.HospitalNo,
                PatientId = medicareMemberDetail.PatientId,
                OpBalance = medicareType.OpCreditAmount,
                IpBalance = medicareType.IpCreditAmount,
                OpUsedAmount = 0,
                IpUsedAmount = 0,
                CreatedBy = currentUser.EmployeeId,
                CreatedOn = DateTime.Now
            };

            medicareDbContext.MedicareMemberBalance.Add(medicareMemberBalance);
            medicareDbContext.SaveChanges();
        }

        public MedicareMember UpdateMedicareMemberDetails(MedicareDbContext medicareDbContext, MedicareMemberDto medicareMemberDto, RbacUser currentUser)
        {
            var medicareMember = medicareDbContext.MedicareMembers.Where(x => x.MedicareMemberId == medicareMemberDto.MedicareMemberId).FirstOrDefault();
            medicareMember.MedicareInstituteCode = medicareMemberDto.MedicareInstituteCode;
            medicareMember.DesignationId = medicareMemberDto.DesignationId;
            medicareMember.DepartmentId = medicareMemberDto.DepartmentId;
            medicareMember.MemberNo = medicareMemberDto.MemberNo;
            medicareMember.FullName = medicareMemberDto.FullName;
            medicareMember.MedicareInstituteCode = medicareMemberDto.MedicareInstituteCode;
            medicareMember.MedicareStartDate = Convert.ToDateTime(medicareMemberDto.MedicareStartDate);
            medicareMember.InsuranceProviderId = medicareMemberDto.InsuranceProviderId;
            medicareMember.IsIpLimitExceeded = medicareMemberDto.IsIpLimitExceeded;
            medicareMember.IsOpLimitExceeded = medicareMemberDto.IsOpLimitExceeded;
            medicareMember.IsActive = medicareMemberDto.IsActive;
            medicareMember.ParentMedicareMemberId = medicareMemberDto.ParentMedicareMemberId;
            medicareMember.Relation = medicareMemberDto.Relation;
            medicareMember.HospitalNo = medicareMemberDto.HospitalNo;
            medicareMember.DateOfBirth = Convert.ToDateTime(medicareMemberDto.DateOfBirth);
            medicareMember.ModifiedBy = currentUser.EmployeeId;
            medicareMember.ModifiedOn = DateTime.Now;
            medicareMember.Remarks = medicareMemberDto.Remarks;
            medicareMember.InsurancePolicyNo = medicareMemberDto.InsurancePolicyNo;
            medicareMember.MedicareTypeId = medicareMemberDto.MedicareTypeId;

            if (!medicareMember.IsDependent && medicareMember.MedicareTypeId != medicareMemberDto.MedicareTypeId)
            {
                UpdateMedicareMemberBalance(medicareDbContext, medicareMember.MedicareMemberId, medicareMemberDto.MedicareTypeId, currentUser);
            }

            medicareDbContext.Entry(medicareMember).State = System.Data.Entity.EntityState.Modified;
            medicareDbContext.SaveChanges();
            return medicareMember;

        }

        private void UpdateMedicareMemberBalance(MedicareDbContext medicareDbContext, int medicareMemberId, int medicareTypeId, RbacUser currentUser)
        {
            var medicareType = medicareDbContext.MedicareTypes.FirstOrDefault(a => a.MedicareTypeId == medicareTypeId);

            var medicareMemberBalance = medicareDbContext.MedicareMemberBalance.FirstOrDefault(a => a.MedicareMemberId == medicareMemberId);
            medicareMemberBalance.OpBalance = medicareType.OpCreditAmount;
            medicareMemberBalance.IpBalance = medicareType.IpCreditAmount;
            medicareMemberBalance.ModifiedBy = currentUser.EmployeeId;
            medicareMemberBalance.ModifiedOn = DateTime.Now;

            medicareDbContext.Entry(medicareMemberBalance).State = System.Data.Entity.EntityState.Modified;
            medicareDbContext.SaveChanges();
        }

        public async Task<object> GetDepartments(MedicareDbContext medicareDbContext)
        {

            var departments = await medicareDbContext.Departments
                                     .Where(a => a.IsActive == true)
                                     .Select(dept => new
                                     {
                                         DepartmentName = dept.DepartmentName,
                                         DepartmentId = dept.DepartmentId,
                                         DepartmentCode = dept.DepartmentCode,
                                     })
                                     .OrderBy(d => d.DepartmentName)
                                     .ToListAsync();
            return departments;
        }
        public async Task<object> GetDesignations(MedicareDbContext medicareDbContext)
        {
            //Krishna, 26thJan'23 Taking distinct because we do not have unique constraint on the database for EmployeeRoleName
            var designations = await medicareDbContext.EmployeeRole
                                        .Where(a => a.IsActive == true)
                                        .Select(empRole => new
                                        {
                                            DesignationName = empRole.EmployeeRoleName,
                                            DesignationId = empRole.EmployeeRoleId
                                        })
                                        .Distinct()
                                        .OrderBy(d => d.DesignationName)
                                        .ToListAsync();
            return designations;
        }
        public async Task<object> GetMedicareTypes(MedicareDbContext medicareDbContext)
        {
            var designations = await medicareDbContext.MedicareTypes
                                        .Where(m => m.IsActive == true)
                                        .ToListAsync();
            return designations;
        }
        public async Task<object> GetAllMedicareInstitutes(MedicareDbContext medicareDbContext)
        {
            var medicareInstitutes = await medicareDbContext.MedicareInstitutes
                                            .Where(m => m.IsActive == true)
                                            .ToListAsync();
            return medicareInstitutes;
        }
        public async Task<object> GetInsuranceProviders(MedicareDbContext medicareDbContext)
        {
            var insuranceProviders = await medicareDbContext.InsuranceProvider
                                            .Where(m => m.IsActive == true)
                                            .ToListAsync();
            return insuranceProviders;
        }

        public async Task<object> GetMedicareMemberByMedicareNo(MedicareDbContext medicareDbContext, string memeberNo)
        {
            var medicareMember = await medicareDbContext.MedicareMembers
                                        .Where(m => m.IsActive == true
                                                    && m.MemberNo == memeberNo
                                                    && m.IsDependent == false)
                                        .FirstOrDefaultAsync();
            return medicareMember;
        }

        public async Task<object> GetMedicareMemberByPatientId(MedicareDbContext medicareDbContext, int PatientId)
        {
            var medicareDependent = await medicareDbContext.MedicareMembers
                                            .Where(m => m.IsActive == true
                                                        && m.PatientId == PatientId
                                                        && m.IsDependent == false)
                                            .FirstOrDefaultAsync();
            return medicareDependent;
        }

        public async Task<object> GetDependentMedicareMemberByPatientId(MedicareDbContext medicareDbContext, int PatientId)
        {
            var medicareDependent = await medicareDbContext.MedicareMembers
                                            .Where(m => m.IsActive == true
                                                        && m.PatientId == PatientId
                                                        && m.IsDependent == true)
                                            .FirstOrDefaultAsync();
            var result = new
            {
                MedicareDependent = medicareDependent,
                ParentMedicareMember = medicareDbContext.MedicareMembers
                                                        .Select(a => new
                                                        {
                                                            MedicareMemberId = a.MedicareMemberId,
                                                            ParentMedicareNumber = a.MemberNo,
                                                            ParentMedicareMemberName = a.FullName
                                                        })
                                                        .FirstOrDefault(a => a.MedicareMemberId == medicareDependent.ParentMedicareMemberId)
            };
            return result;
        }

    }

}
