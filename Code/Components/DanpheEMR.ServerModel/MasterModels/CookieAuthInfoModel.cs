using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class CookieAuthInfoModel
    {   
        [Key]
        public int AuthId { get; set; }
        public long Selector { get; set; }
        public string HashedToken { get; set; }
        public int UserId { get; set; }
        public DateTime Expires { get; set; }

    }
}
