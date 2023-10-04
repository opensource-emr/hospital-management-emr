using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Management;
using System.Configuration;
using System.IO;

namespace DanpheEMR.Utilities.ServerSidePrinter
{
    public partial class LoadPrinter : Form
    {
        WebBrowser myWebBrowser = new WebBrowser();
        string FolderName = "";
        bool printing = false;
        //private void Form1_Load(object sender, EventArgs e)
        //{
        //}

        public bool SetDefaultPrinter(string defaultPrinter)
        {
            using (ManagementObjectSearcher objectSearcher = new ManagementObjectSearcher("SELECT * FROM Win32_Printer"))
            {
                using (ManagementObjectCollection objectCollection = objectSearcher.Get())
                {
                    foreach (ManagementObject mo in objectCollection)
                    {
                        if (string.Compare(mo["Name"].ToString(), defaultPrinter, true) == 0)
                        {
                            mo.InvokeMethod("SetDefaultPrinter", null, null);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        public LoadPrinter()
        {
            InitializeComponent();
            using (ManagementObjectSearcher objectSearcher = new
                ManagementObjectSearcher("SELECT * FROM Win32_Printer"))
            {
                using (ManagementObjectCollection objectCollection = objectSearcher.Get())
                {
                    foreach (ManagementObject mo in objectCollection)
                    {
                        listBox1.Items.Add(mo["Name"].ToString());
                    }
                }
            }
            string str = ConfigurationManager.AppSettings["OPDSticker"];
            FolderName = ConfigurationManager.AppSettings["ServerPath"];

            SetDefaultPrinter(str);
            myWebBrowser.DocumentCompleted += MyWebBrowser_DocumentCompleted;
        }

        private void DeleteProcessedFiles(List<string> processedFiles)
        {
            foreach (string str in processedFiles)
            {
                File.Delete(str);
            }

        }
        //private void button1_Click(object sender, EventArgs e)
        //{
        //}

        private void MyWebBrowser_DocumentCompleted(object sender,
            WebBrowserDocumentCompletedEventArgs e)
        {
            myWebBrowser.Print();
            // set printing to false
            // once printing has completed
            printing = false;
        }

        private void Form1_Load_1(object sender, EventArgs e)
        {

        }

        private void openFileDialog1_FileOk(object sender, CancelEventArgs e)
        {

        }

        private void FileProcessor(object sender, EventArgs e)
        {
            // ensure that timer does not fire
            // before the files are processed
            timer1.Enabled = false;
            // get files which are HTML from the directory
            List<string> processedFiles = Directory.GetFiles(FolderName, "*html").ToList<string>();
            // Start printing them
            foreach (string str in processedFiles)
            {
                printing = true;
                myWebBrowser.DocumentText =
                    System.IO.File.ReadAllText(str);
                // wait for printing to finish
                while (printing)
                {
                    Application.DoEvents();
                }

                // then take next print
            }
            // set printing , double safety 
            // if event += leak
            printing = false;
            // once completed deleted the processed files
            DeleteProcessedFiles(processedFiles);
            // enable the time to start taking next process
            timer1.Enabled = true;
        }
    }
}
