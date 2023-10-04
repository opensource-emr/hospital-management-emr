using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel.SchedulingModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{
    public class SchedulingBL
    {
        #region Scheduling Manage (Insert/Update employee schedules)
        public static Boolean ManageEmpSchedules(List<EmpSchedules> schedules, SchedulingDbContext schedulingDbContext)
        {
            //Transaction Begin
            using (var dbContextTxn = schedulingDbContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (EmpSchedules emp in schedules)
                    {
                        if (emp.TxnType == "Insert")
                            AddEmpSchedules(schedulingDbContext, emp);
                        else if (emp.TxnType == "Update")
                            UpdateEmpSchedules(schedulingDbContext, emp);
                    }

                    //Commit Transaction
                    dbContextTxn.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        #endregion

        #region Employee Working Hours Manage Transaction
        public static Boolean WorkingHrsTxn(WorkingHoursTxnVM workHrsTxn, SchedulingDbContext schedulingDbContext)
        {
            using (var dbContextTxn = schedulingDbContext.Database.BeginTransaction())
            {
                try
                {
                    //currently we are not adding or updating shift at employee level thats why commented out below code. --- ramavtar 30May'18
                    //foreach (ShiftsMasterModel s in workHrsTxn.Shifts)
                    //{
                    //    if (s.ShiftId > 0)
                    //        UpdateShiftMaster(schedulingDbContext, s);
                    //    else if (s.ShiftId == 0)
                    //        AddShiftMaster(schedulingDbContext, s);
                    //}

                    //assigning newly addded shiftid to map-data
                    var index = 0;
                    foreach (EmployeeShiftMap m in workHrsTxn.Maps)
                    {
                        if (m.EmployeeShiftMapId > 0)
                            UpdateEmpShiftMap(schedulingDbContext, m);
                        else if (m.EmployeeShiftMapId == 0)
                        {
                            m.ShiftId = workHrsTxn.Shifts[index].ShiftId;
                            AddEmpShiftMap(schedulingDbContext, m);
                        }
                        index++;
                    }

                    dbContextTxn.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        #endregion

        #region Add Employee Schedules
        public static void AddEmpSchedules(SchedulingDbContext schDBContext, EmpSchedules schedules)
        {
            try
            {
                schDBContext.EmpSchedules.Add(schedules);
                schDBContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Update Employee Schedules
        public static void UpdateEmpSchedules(SchedulingDbContext schDBContext, EmpSchedules schedules)
        {
            try
            {
                schDBContext.EmpSchedules.Attach(schedules);
                schDBContext.Entry(schedules).Property(x => x.IsWorkingDay).IsModified = true;
                schDBContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Add Shift Master
        public static void AddShiftMaster(SchedulingDbContext schDbContext, ShiftsMasterModel shift)
        {
            try
            {
                shift.CreatedOn = System.DateTime.Now;
                schDbContext.ShiftsMaster.Add(shift);
                schDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        //here im updating shift master from Manage working hours txn .. as i need following fields(shiftname,starttime,endtime,totalhrs) to get updated, so i have bought only that much content here...
        #region Update Shift Master
        public static void UpdateShiftMaster(SchedulingDbContext schDbContext, ShiftsMasterModel shift)
        {
            try
            {
                shift.ModifiedOn = System.DateTime.Now;
                schDbContext.ShiftsMaster.Attach(shift);
                schDbContext.Entry(shift).Property(x => x.ShiftName).IsModified = true;
                schDbContext.Entry(shift).Property(x => x.StartTime).IsModified = true;
                schDbContext.Entry(shift).Property(x => x.EndTime).IsModified = true;
                schDbContext.Entry(shift).Property(x => x.TotalHrs).IsModified = true;
                schDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Add Employee-Shift Map
        public static void AddEmpShiftMap(SchedulingDbContext schDbContext, EmployeeShiftMap shiftMap)
        {
            try
            {
                shiftMap.CreatedOn = System.DateTime.Now;
                schDbContext.EmpShiftMAP.Add(shiftMap);
                schDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Update Employee-Shift Map
        public static void UpdateEmpShiftMap(SchedulingDbContext schDbContext, EmployeeShiftMap shiftMap)
        {
            try
            {
                shiftMap.ModifiedOn = System.DateTime.Now;
                schDbContext.EmpShiftMAP.Attach(shiftMap);
                schDbContext.Entry(shiftMap).State = EntityState.Modified;
                schDbContext.Entry(shiftMap).Property(x => x.CreatedOn).IsModified = false;
                schDbContext.Entry(shiftMap).Property(x => x.CreatedBy).IsModified = false;
                schDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
    }
}
