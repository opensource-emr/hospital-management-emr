using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class SqlAuditModel
    {
        public DateTime? Event_Time { get; set; }
        public string Server_Instance_Name { get; set; }
        public string Database_Name { get; set; }
        public string Statement { get; set; }
        public string Server_Principal_Name { get; set; }
        public string Action_Id { get; set; }
        public string Object_Name { get; set; }
        public Int16? Session_Id { get; set; }
        public string Schema_Name { get; set; }        

    }
}