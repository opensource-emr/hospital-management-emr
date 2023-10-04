using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SSFModels.ClaimResponse
{
    public class ValuePeriod
    {
        public string end { get; set; }
        public string start { get; set; }
    }

    public class ValueReference
    {
        public int identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class ItemValueReference
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Extension
    {
        public string url { get; set; }
        public string valueString { get; set; }
        public ValuePeriod valuePeriod { get; set; }
        public ValueReference valueReference { get; set; }
    }

    public class Coding
    {
        public string code { get; set; }
    }

    public class Type
    {
        public IList<Coding> coding { get; set; }
    }

    public class Identifier
    {
        public Type type { get; set; }
        public string use { get; set; }
        public string value { get; set; }
    }

    public class Insurer
    {
        public string reference { get; set; }
    }

    public class Amount
    {
        public string currency { get; set; }
        public double value { get; set; }
    }

    public class Category
    {
        public IList<Coding> coding { get; set; }
        public string text { get; set; }
    }


    public class Reason
    {
        public IList<Coding> coding { get; set; }
    }

    public class Adjudication
    {
        public Amount amount { get; set; }
        public Category category { get; set; }
        public Reason reason { get; set; }
        public double value { get; set; }
    }

    public class ItemExtension
    {
        public string url { get; set; }
        public ItemValueReference valueReference { get; set; }
    }

    public class Item
    {
        public IList<Adjudication> adjudication { get; set; }
        public IList<ItemExtension> extension { get; set; }
        public int itemSequence { get; set; }
    }


    public class Patient
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Request
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Requestor
    {
        public Identifier identifier { get; set; }
        public string reference { get; set; }
        public string type { get; set; }
    }

    public class Total
    {
        public Amount amount { get; set; }
        public Category category { get; set; }
    }

    public class SSFClaimResponse
    {
        public string resourceType { get; set; }
        public string created { get; set; }
        public IList<Extension> extension { get; set; }
        public string id { get; set; }
        public List<Identifier> identifier { get; set; }
        public Insurer insurer { get; set; }
        public IList<Item> item { get; set; }
        public string outcome { get; set; }
        public Patient patient { get; set; }
        public Request request { get; set; }
        public Requestor requestor { get; set; }
        public string status { get; set; }
        public IList<Total> total { get; set; }
        public Type type { get; set; }
        public string use { get; set; }
    }
}
