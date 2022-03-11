using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class OtCheckListInfoModel
    {
        [Key]
        public int CheckListId { get; set; }
        public int OTBookingId { get; set; }
        public int CheckListItemName { get; set; }
        public bool ItemValue { get; set; }
        public string ItemDetails { get; set; }
    }
}
