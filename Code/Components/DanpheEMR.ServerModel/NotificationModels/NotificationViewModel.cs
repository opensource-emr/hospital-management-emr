using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.NotificationModels
{
    public class NotificationViewModel
    {

        [Key]
        public int NotificationId { get; set; }
        public string Notification_ModuleName { get; set; }
        public string Notification_Title { get; set; }
        public string Notification_Details { get; set; }
        //public int RecipientId { get; set; }
        public int? RecipientId { get; set; }//sud: 31Jan'19--nullable exception is coming in server side.
        public string ParentTableName { get; set; }
        public int NotificationParentId { get; set; }
        public bool IsRead { get; set; }
        public int? ReadBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool? IsArchived { get; set; }
        public string RecipientType { get; set; }
        public string Sub_ModuleName { get; set; }

    }
}
