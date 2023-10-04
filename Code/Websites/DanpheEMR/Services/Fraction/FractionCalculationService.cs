using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using DanpheEMR.ServerModel;
using DanpheEMR.ViewModel;
using System.Data;

namespace DanpheEMR.Services
{
    public class FractionCalculationService : IFractionCalculationService
    {
        public FractionDbContext db;
        private readonly string connString = null;

        public FractionCalculationService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new FractionDbContext(connString);
        }

        public List<FractionCalculationModel> ListFractionCalculation()
        {
            var query = db.FractionCalculation.ToList();
            return query;
        }

        public int AddFractionCalculation(FractionCalculationModel[] model)
        {
            Dictionary<double, int> doctorParent = new Dictionary<double, int>();

            foreach (var fraction in model)
            {
                FractionCalculationModel frac = new FractionCalculationModel();
                frac = fraction;
                double ParentId = fraction.IsParentId;
                bool is_integer = (ParentId % 1) == 0;

                doctorParent.Add(frac.ParentId, frac.DoctorId);

                if (fraction.IsParentId != 0)
                {
                    frac.IsParentId = doctorParent[Convert.ToInt32(ParentId)];
                }
                db.FractionCalculation.Add(frac);
                db.SaveChanges();
            }
            return model[0].BillTxnItemId;
        }

        public FractionCalculationModel UpdateFractionCalculation(FractionCalculationModel model)
        {
            db.Entry(model).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();
            return model;
        }

        public List<FractionCalculationViewModel> GetFractionCalculation(int BillTxnItemId)
        {
            var result = (from fraction in db.FractionCalculation
                          join billItem in db.BillingTransactionItems on fraction.BillTxnItemId equals billItem.BillingTransactionItemId
                          join pat in db.Patient on billItem.PatientId equals pat.PatientId
                          join emp in db.Employee on fraction.DoctorId equals emp.EmployeeId
                          join percent in db.FractionPercent on fraction.PercentSettingId equals percent.PercentSettingId
                          join designation in db.Designation on fraction.DesignationId equals designation.DesignationId
                          where fraction.BillTxnItemId == BillTxnItemId
                          select new FractionCalculationViewModel
                          {
                              ItemName = billItem.ItemName,
                              DoctorName = emp.FirstName + " " + emp.LastName,
                              InitialPercent = fraction.InitialPercent,
                              FinalPercent = fraction.FinalPercent,
                              DoctorPercent = percent.DoctorPercent,
                              CreatedOn = fraction.CreatedOn,
                              Designation = designation.DesignationName,
                              FinalAmount = fraction.FinalAmount,
                              Hierarchy = fraction.Hierarchy,
                              IsParentId = fraction.IsParentId
                          }).ToList();
            return result;
        }      
        
        public DataTable GetFractionTxnList()
        {
            FractionDbContext fracDbContext = new FractionDbContext(connString);
            DataTable result =  fracDbContext.GetFractionApplicable();
            return result;
        }
        public DataTable GetFractionReportByItemList()
        {
            FractionDbContext fracDbContext = new FractionDbContext(connString);
            DataTable result = fracDbContext.GetFractionReportByItemList();
            return result;
        }
        public DataTable GetFractionReportByDoctorList(DateTime FromDate, DateTime ToDate)
        {
            FractionDbContext fracDbContext = new FractionDbContext(connString);
            DataTable result = fracDbContext.GetFractionReportByDoctorList(FromDate, ToDate);
            return result;
        }
        
    }
}
