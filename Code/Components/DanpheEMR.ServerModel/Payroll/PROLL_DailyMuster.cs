using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DailyMuster
    {

        public Int64? DailyMusterId { get; set; }
        public Int64 EmployeeId { get; set; }
        public bool Present { get; set; }
        public string AttStatus { get; set; }
       // public string Title { get; set; }
        public string ColorCode { get; set; }
        public TimeSpan? TimeIn { get; set; }
        public TimeSpan? TimeOut { get; set; }
        public int Day { get; set; }
        public int Month { get; set; }
        public Int64 Year { get; set; }
        public decimal? HoursInDay { get; set; }
    }
}
