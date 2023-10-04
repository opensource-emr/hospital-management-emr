using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.Helpers
{

    /// <summary>
    /// This class defines and provides all appointments for the day,
    /// formats input list of appointments, gets clashing appointments for a new request. etc.
    /// </summary>
    public class AppointmentDay
    {
        public class SingleAppointment
        {
            public int AppointmentId { get; set; }
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
        }

        public SingleAppointment Current { get; set; }

        //public string ActorName { get; set; }
        //public int ActorId { get; set; }
        //public DateTime AppointmentDate { get; set; }

        public int AppointmentCount { get; set; }
        public List<SingleAppointment> Schedules = new List<SingleAppointment>();
        // public List<SingleAppointment> Clashes = new List<SingleAppointment>();

        //returns a formatted object for passed appointment lists.
        public static AppointmentDay FormatData(List<AppointmentModel> daysAppointments)
        {
            AppointmentDay appDay = new AppointmentDay();

            if (daysAppointments != null && daysAppointments.Count > 0)
            {
                appDay.AppointmentCount = daysAppointments.Count;
                foreach (var item in daysAppointments)
                {
                    TimeSpan startTime = item.AppointmentTime;
                    TimeSpan endTime = item.AppointmentTime.Add(TimeSpan.FromMinutes(20));

                    appDay.Schedules.Add(new SingleAppointment() { AppointmentId = item.AppointmentId, StartTime = startTime, EndTime = endTime });
                }
            }
            appDay.Current = null;
            //ordering appointments by start time. 
            appDay.Schedules = appDay.Schedules.OrderBy(a => a.StartTime).ToList();
            return appDay;
        }

        //returns all appointments which clashes with the requested appointments. check inside function for all conditions.
        public static List<SingleAppointment> GetClashingAppointments(List<AppointmentModel> ipList, TimeSpan reqTime, int duration)
        {
            List<SingleAppointment> clashingAppts = new List<SingleAppointment>();
            if (ipList != null && ipList.Count > 0)
            {
                AppointmentDay appSchedule = AppointmentDay.FormatData(ipList);
                TimeSpan requestStartTime = reqTime;
                TimeSpan requestEndTime = reqTime + TimeSpan.FromMinutes(duration);

                //get all clashing schedules.
                clashingAppts = appSchedule.Schedules.Where(sch =>
                {
                    //check if this request comes between any of the other appointment's schedule or not.
                    //case: 1-- requeststarttime shouldn't come in between any of the existing appointments
                    //2. requestendtime also shouldn't come in between any of the existing appts.
                    //3. to handle overlap boundary conditions, existing starttime shouldn't come between requeststarttime and endtime.
                    //4. to handle exact boundary conditions, existing requeststarttime shouldn't start from any of existing startimes.
                    return ((sch.StartTime < requestStartTime && requestStartTime < sch.EndTime) ||
                      (sch.StartTime < requestEndTime && requestEndTime < sch.EndTime) ||
                       (requestStartTime < sch.StartTime && sch.StartTime < requestEndTime) ||
                       (requestStartTime == sch.StartTime));

                }).ToList();

                //if (clashingAppts != null && clashingAppts.Count > 0)
                //{
                //    returnValue = false;
                //}

                //foreach (StartEndTime sch in appSchedule.Schedules)
                //{

                //    //check if this request comes between any of the other appointment or not.
                //    if ((sch.StartTime < requestStartTime && requestStartTime < sch.EndTime) ||
                //       (sch.StartTime < requestEndTime && requestStartTime < sch.EndTime))
                //    {
                //        returnValue = false;
                //        break;
                //    }

                //}


            }

            return clashingAppts;
        }

    }

}
