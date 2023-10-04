using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel
{
    public class EmailViewModel
    {
        public string EmailAddress { get; set; }
        public string Subject { get; set; }
        public string Content { get; set; }

        public List<String> EmailAddressList { get; set; }
    }
}
