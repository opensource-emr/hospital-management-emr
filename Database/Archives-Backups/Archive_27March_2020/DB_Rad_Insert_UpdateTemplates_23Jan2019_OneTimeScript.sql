/*
 Script: To update Newly added Radiology Templates and their mappings in different environment
 Create: 23Jan'19-sud
 Details: Template Insertion and Mapping was done in UAT server, below script is extracted from there. 
 Steps :
    1. Clear ReportTemplate Table
	2. Insert Fresh Data into ReportTemplate table (earlier there were only 89, now there are 195 templates)
	3. Create Temporary table for ImagingItems and Insert the Data of UAT into it.
	4. ImagingItem ->  Update TemplateId of existing table by those from Temporary Table--
	5. Delete Temporary table created for ImagingItem


*/

---  1. Clear ReportTemplate Table
DELETE FROM RAD_CFG_ReportTemplates
GO
---2. Insert Fresh Data into ReportTemplate table (earlier there were only 89, now there are 195 templates)--
SET IDENTITY_INSERT [dbo].[RAD_CFG_ReportTemplates] ON 
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (1, N'Radiology', N'Echocardiography', N'Echocardiography', N'<h1 style="text-align:center"><span style="font-size:20px"><strong>ECHOCARDIOGRAPHY&nbsp;REPORT</strong></span></h1>

<p><strong>STUDY OF VALVES</strong></p>

<p><strong>Mitral valve </strong></p>

<p style="margin-left:40px">Normal Morphology,</p>

<p style="margin-left:40px">No Mitral Regurgitation.</p>

<p style="margin-left:40px">&nbsp;No Mitral stenosis</p>

<p><strong>Tricuspid valve </strong></p>

<p style="margin-left:40px">Normal.</p>

<p style="margin-left:40px">No Tricuspid regurgitation</p>

<p style="margin-left:40px">No &nbsp;&nbsp;Tricuspid stenosis</p>

<p><strong>Aortic valve </strong></p>

<p style="margin-left:40px">Normal</p>

<p style="margin-left:40px">No Regurgitation</p>

<p style="margin-left:40px">No Aortic stenosis,</p>

<p><strong>Pulmonary valve</strong></p>

<p style="margin-left:40px">Normal.</p>

<p style="margin-left:40px">&nbsp;No Pulmonary regurgitation.&nbsp; No Pulmonary stenosis</p>

<p><strong>MEASUREMENTS</strong></p>

<p style="margin-left:40px">Aorta / Left Atrium&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / mm</p>

<p style="margin-left:40px">Interventricular Septum (Diastole/Systole) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / mm</p>

<p style="margin-left:40px">LV end diastolic / end systolic dimension&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;/ mm</p>

<p style="margin-left:40px">LV Posterior Wall (Diastole/Systole) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / mm</p>

<p style="margin-left:40px">Left Ventricle Ejection Fraction (<strong>LVEF</strong>)&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong><em>60%</em></strong></p>

<p><strong>STUDY OF CARDIAC CHAMBERS</strong></p>

<p style="margin-left:40px">Left atrium: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal</p>

<p style="margin-left:40px">Right atrium: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal size and function</p>

<p style="margin-left:40px">Left ventricle: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal.</p>

<p style="margin-left:40px">Right ventricle: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal size and function</p>

<p><strong>Wall Motion</strong>: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal LV and RV wall motion&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>

<p><strong>Mass or vegetation</strong>: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Absent.</p>

<p><strong>Pericardium</strong>: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Normal and no pericardial effusion&nbsp;</p>

<p><strong>FINDINGS</strong></p>

<p><strong>&nbsp; NORMAL LV SYSTOLIC FUNCTION, LVEF =60%</strong></p>

<p>&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-03-20T15:29:44.380' AS DateTime), 1, CAST(N'2019-01-07T16:38:24.493' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (2, N'Radiology', N'USG - Anomaly Scan', N'USG - Anomaly Scan', N'<p style="text-align:center"><u><span style="font-size:20px"><strong>Report of Obstetric Scan</strong></span></u></p>

<p><strong><u>Sonographic findings</u></strong><strong>:</strong></p>

<table border="1" cellpadding="0" cellspacing="0" style="width:600px">
	<thead>
		<tr>
			<th scope="col"><strong><em><u>Parameters</u></em></strong></th>
			<th scope="col"><strong><em><u>Findings </u></em></strong></th>
			<th scope="col"><strong><em><u>Parts of the fetus</u></em></strong></th>
			<th scope="col">&nbsp;</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Number of fetus</td>
			<td><em>Single</em></td>
			<td>Cranium</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>Cardiac activity</td>
			<td><em>Present/Absent</em></td>
			<td>Ventricles</td>
			<td>N/&nbsp; Dilated</td>
		</tr>
		<tr>
			<td>Heart Rate( bpm)</td>
			<td>&nbsp;</td>
			<td>Cerebellum</td>
			<td>N/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>Presentation</td>
			<td>&nbsp;</td>
			<td>Face</td>
			<td>N/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>Movements</td>
			<td>&nbsp;</td>
			<td>Spine</td>
			<td>N/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>Placentation</td>
			<td><em>A/&nbsp; P/&nbsp; F</em></td>
			<td>4 chamber heart</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>&nbsp;</td>
			<td><em>UU/&nbsp; LL</em></td>
			<td>Diaphragm</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>&nbsp;</td>
			<td><em>Rt/ Lt/ Midline</em></td>
			<td>Stomach</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>&nbsp;</td>
			<td>Attached/ RP clot</td>
			<td>Bowel</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>Placental thickness</td>
			<td>N/&nbsp; &uarr;/&nbsp; &darr;</td>
			<td>Abdominal wall</td>
			<td>N/&nbsp; &nbsp;Abn</td>
		</tr>
		<tr>
			<td>Cord vessel number</td>
			<td>3/ 2</td>
			<td>Kidneys</td>
			<td>N/&nbsp; &nbsp;Abn</td>
		</tr>
		<tr>
			<td>Pool depth</td>
			<td>&nbsp;&nbsp;mm.</td>
			<td>UB</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>AFI</td>
			<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm.</td>
			<td>Upper limbs</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
		<tr>
			<td>Liquor amount</td>
			<td>N/&nbsp; &uarr;/&nbsp; &darr;</td>
			<td>Lower limbs</td>
			<td>N/&nbsp; NS/&nbsp; Abn</td>
		</tr>
	</tbody>
</table>

<p><strong><u>Fetal Biometry</u></strong><strong>:</strong></p>

<p><strong>Gestational age by BPD and FL corresponds to &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Weeks.</strong></p>

<p><strong>EFW=&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; gms</strong>.</p>

<p><strong><u>Comments</u></strong><strong>:</strong></p>

<ol>
	<li>Singleton intrauterine pregnancy of &hellip;&hellip;&hellip;&hellip;&hellip;.weeks with normal fetal cardiac activity.</li>
	<li>Normal fetal movements and morphology.</li>
	<li>&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;Presentation.</li>
	<li>Placenta &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;</li>
	<li>Liquor volume&hellip;&hellip;&hellip;&hellip;.</li>
	<li>No cord around the fetal neck.</li>
</ol>

<p>&nbsp;</p>

<p>&nbsp;</p>
', N'C= Cephalic, B= Breech, T= Transverse, N= Normal, NS= Not seen, Abn= Abnormal, ?= Increased, ?=
Decreased, A= Anterior, P= Posterior, F= Fundic, UU= Upper uterine, LL= Low lying, AFI= Amniotic 
fluid index( normal Range is 5 to 25 cm), RPclot= Retroplacental clot.
', NULL, 1, CAST(N'2018-03-20T15:34:22.867' AS DateTime), 1, CAST(N'2019-01-07T16:29:13.660' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (3, N'Radiology', N'Arterial Doppler', N'Arterial Doppler study of bilateral lower limbs', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>Report of Arterial Doppler study of bilateral lower limbs</u></strong></span></p>

<ul>
	<li><span style="font-size:14px">Abdominal aorta, common iliac, external iliac, common femoral, superficial femoral, popliteal, anterior/posterior tibial and peroneal arteries were studied with B-mode, color mode and spectral Doppler.&nbsp;</span></li>
</ul>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px">Above mentioned arteries are normal in course,caliber and outline. Lumen is echofree.</span></li>
	<li><span style="font-size:14px">Normal color flow.</span></li>
	<li><span style="font-size:14px">Normal spectral wave forms with triphasic patterns noted.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal arterial Doppler study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T15:36:21.280' AS DateTime), 1, CAST(N'2019-01-07T16:39:53.167' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (4, N'Radiology', N'USG - Carotid Doppler', N'USG - Carotid Doppler', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF CAROTID DOPPLER</u></strong></span></p>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px">Normal course, caliber and outine of bilateral CCA, ICA, ECA and carotid bulbs.&nbsp; No abnormal narrowing and dilatation. No calcific plaques noted in these arteries. Normal flow. Normal spectral wave forms.</span></li>
	<li><span style="font-size:14px">Intimal thickness is normal in both CCA (0.06 mm in each side).</span></li>
	<li><span style="font-size:14px">Bilateral vertebral arteries show normal forward flow with normal spectral wave forms.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal carotid Doppler study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T15:37:25.590' AS DateTime), 1, CAST(N'2019-01-07T16:29:22.087' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (5, N'Radiology', N'USG - Early Pregnancy-2', N'USG - Early Pregnancy-2', N'<p style="text-align:center"><strong><u><span style="font-size:20px">REPORT OF USG ABDOMEN</span></u></strong></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, smooth in outline and shows homogenous echotexture. Echogenicity is normal. No focal lesion seen. Intrahepatic bile ducts are not dilated. Hepatic veins, portal vein and IVC are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER: </strong>Normal in distensibility and wall thickness. No calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>COMMON BILE DUCT: </strong>Normal in luminal diameter. No calculus or SOL seen.</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and echotexture. No focal lesion seen. Pancreatic duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size, outline and echotexture. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS:</strong> Rt-&nbsp; cm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lt- &nbsp;cm</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show smooth and regular outline. Cortical thickness is normal.Parenchymal echogenicity is normal. Corticomedullary differentiation is maintained. No focal lesion. No calculi seen. No hydronephrotic changes.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. Lumen is echofree.</span></li>
	<li><span style="font-size:14px"><strong>UTERUS</strong>: <strong>Gravid uterus with single gestational sac containing a yolk sac. Embryo not seen. MSD =&nbsp; weeks. </strong></span></li>
	<li><span style="font-size:14px"><strong>ADNEXAE</strong>: Unremarkable.</span></li>
	<li><span style="font-size:14px">No free fluid in the peritoneal cavity. Right iliac fossa is unremarkable.</span></li>
	<li><span style="font-size:14px">No retroperitoneal and mesenteric lymphadenopathy.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Early intrauterine pregnancy of weeks days.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T15:38:53.383' AS DateTime), 1, CAST(N'2019-01-07T16:42:50.383' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (6, N'Radiology', N'USG - Abdomen (Female)', N'USG - Abdomen (Female)', N'<p style="text-align:center"><u><span style="font-size:20px"><strong>REPORT OF USG ABDOMEN</strong></span></u></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, smooth in outline and shows homogenous echotexture. Echogenicity is normal. No focal lesion seen. Intrahepatic bile ducts are not dilated. Hepatic veins, portal vein and IVC are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER: </strong>Normal in distensibility and wall thickness. No calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>COMMON BILE DUCT: </strong>Normal in luminal diameter. No calculus or SOL seen.</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and echotexture. No focal lesion seen. Pancreatic duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size, outline and echotexture. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS:</strong> Rt-&nbsp; cm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lt- &nbsp;cm</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show smooth and regular outline. Cortical thickness is normal.Parenchymal echogenicity is normal. Corticomedullary differentiation is maintained. No focal lesion. No calculi seen. No hydronephrotic changes.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. Lumen is echofree.</span></li>
	<li><span style="font-size:14px"><strong>UTERUS</strong>: Anteverted uterus, it measures cm. Endometrial thickness is normal. Empty uterine cavity. No SOL seen in uterus.</span></li>
	<li><span style="font-size:14px"><strong>ADNEXAE</strong>: Unremarkable.</span></li>
	<li><span style="font-size:14px">No free fluid in the peritoneal cavity. Right iliac fossa is unremarkable.</span></li>
	<li><span style="font-size:14px">No retroperitoneal and mesenteric lymphadenopathy.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:16:56.923' AS DateTime), 1, CAST(N'2019-01-07T16:42:57.693' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (7, N'Radiology', N'Intravenous urography', N'Intravenous urography', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>Report of Intravenous urography</u></strong></span></p>

<p><span style="font-size:16px"><strong>FILMS TAKEN: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>CONTROL FILM</strong>: No abnormal radioopaque shadow (ROS) seen in KUB region. Psoas shadows, bowel gas patterns and visualised bones are normal.&nbsp;</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS: </strong>Bilateral kidneys show good and prompt contrast excretion. Both the kidneys are normal in size, outline, position and axis.</span></li>
	<li><span style="font-size:14px"><strong>PELVICALICEAL SYSTEM</strong>: Simultaneous opacification noted in both sides. No abnormal dilatation, narrowing and filling defect noted in both sides. Cupping pattern of the calyces is maintained.</span></li>
	<li><span style="font-size:14px"><strong>URETERS</strong>: Bilateral ureters are normal in outline, course and caliber. No abnormal dilatation, narrowing and filling defect noted.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and outline. No abnormal filling defect noted. No abnormal outpouching. Unremarkable post void film.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal IVU study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:17:56.910' AS DateTime), 1, CAST(N'2019-01-07T16:42:08.190' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (8, N'Radiology', N'USG - Abdomen (Male)', N'USG - Abdomen (Male)', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF USG ABDOMEN</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, smooth in outline and shows homogenous echotexture. Echogenicity is normal. No focal lesion seen. Intrahepatic bile ducts are not dilated. Hepatic veins, portal vein and IVC are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER: </strong>Normal in distensibility and wall thickness. No calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>COMMON BILE DUCT: </strong>Normal in luminal diameter. No calculus or SOL seen.</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and echotexture. No focal lesion seen. Pancreatic duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size, outline and echotexture. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS:</strong> Rt-&nbsp; cm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lt- &nbsp;cm</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show smooth and regular outline. Cortical thickness is normal .Parenchymal echogenicity is normal. Corticomedullary differentiation is maintained. No focal lesion. No calculi seen. No hydronephrotic changes.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. Lumen is echofree.</span></li>
	<li><span style="font-size:14px"><strong>PROSTATE</strong>: Normal in size. Normal in outline and echotexture. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">No free fluid in the peritoneal cavity. Right iliac fossa is unremarkable.</span></li>
	<li><span style="font-size:14px">No retroperitoneal and mesenteric lymphadenopathy.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:19:12.227' AS DateTime), 1, CAST(N'2019-01-07T16:42:29.557' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (9, N'Radiology', N'USG - Obstetric Scan', N'USG - Obstetric Scan', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>OBSTETRIC SCAN REPORT</u></strong></span></p>

<p><span style="font-size:16px"><strong><u>UPPER ABDOMINAL SCAN:</u></strong></span></p>

<p><span style="font-size:16px"><strong><u>OBSTETRIC SCAN</u></strong></span></p>

<ol style="list-style-type:lower-roman">
	<li><span style="font-size:14px">Single live fetus in the uterine cavity with regular cardiac activity and normal fetal movement.</span></li>
	<li><span style="font-size:14px">Gestational age by BPD, AC and FL corresponds to &nbsp;weeks.</span></li>
	<li><span style="font-size:14px">Placenta anterior/ posterior upper uterine/low lying.</span></li>
	<li><span style="font-size:14px">Liquor volume is adequate<strong> (AFI= cm).</strong></span></li>
	<li><span style="font-size:14px">Nuchal translucency= mm.</span></li>
	<li><span style="font-size:14px">Nuchal fold thickness= mm.</span></li>
	<li><span style="font-size:14px">No gross fetal congenital anomaly detected.</span></li>
	<li><span style="font-size:14px">Cord around the fetal neck= Seen/ Not seen.</span></li>
	<li><span style="font-size:14px">Presentation is Cephalic/ Breech.</span></li>
	<li><span style="font-size:14px">FHR=&nbsp; bpm.</span></li>
	<li><span style="font-size:14px">EFW= gms.</span></li>
	<li><span style="font-size:14px">Cervical length=&nbsp; mm.</span></li>
</ol>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Singleton intrauterine pregnancy of weeks.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:21:34.713' AS DateTime), 1, CAST(N'2019-01-07T16:29:53.663' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (11, N'Radiology', N'USG - Guided PTBD', N'USG - Guided PTBD', N'<div style="text-align:center"><span style="font-size:20px"><strong><u>PTBD (PERCUTANEOUS TRANSHEPATIC BILIARY DRAINAGE)</u></strong></span></div>

<div style="text-align:center"><span style="font-size:14px"><strong><u>INDICATION:</u> Carcinoma GB with liver infiltration and IHBDs (obstructive jaundice).</strong></span></div>

<div><span style="font-size:16px"><strong>PROCEDURE</strong>:</span></div>

<p><span style="font-size:14px">Under aspectic conditions and local anesthesia, a small incision was made in epigastric region. 18 Gz Chiba needle was inserted under ultrasound guidance into the dilated left biliary duct. Guide wire was placed in dilated biliary duct through chiba needle and then chiba needle pulled out. Then 6 FzPTBD catheter was inserted into the place through guide wire. Frank yellowish bile was obtained. Suturing done with 2.0 silk. Dressing done.&nbsp; No procedural complications noted.</span></p>

<p><span style="font-size:14px"><strong>ADVICE<u>: </u></strong></span></p>

<ol>
	<li><span style="font-size:14px">Observation for 2 hours in observation room.</span></li>
	<li><span style="font-size:14px">Tab. Cefixime 400 mg BD X 5 days.</span></li>
	<li><span style="font-size:14px">Tab. Voveron SR 75 mg sos.</span></li>
	<li><span style="font-size:14px">Follow up in 7 days.</span></li>
	<li><span style="font-size:14px">Care must be taken not to pull PTBD catheter.</span></li>
</ol>
', NULL, NULL, 1, CAST(N'2018-03-20T16:23:59.007' AS DateTime), 1, CAST(N'2019-01-07T16:44:01.713' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (12, N'Radiology', N'USG - Renal Doppler Study', N'USG - Renal Doppler Study', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF RENAL DOPPLER STUDY</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Liver, spleen, Gall bladder, pancreas and urinary bladder are normal.</span></li>
	<li><span style="font-size:14px">Bilateral kidneys are normal in size (Rt- &nbsp;cm and Lt- &nbsp;cm), outline and echotexture.&nbsp; Parenchymal echogenicity is normal. Corticomedullary differentiation is maintained. No focal lesion seen. No calculus. No hydronephrosis.</span></li>
	<li><span style="font-size:14px">Suprarenal region of both sides are unremarkable.</span></li>
	<li><span style="font-size:14px">Abdominal aorta is normal in course, caliber and outline. Normal flow with normal spectral wave forms. Peak systolic velocity (PSV) is &nbsp;cm/sec.</span></li>
	<li><span style="font-size:14px">Bilateral renal arteries are normal in course, caliber and outline with normal flow. Spectral wave form is normal.</span></li>
</ul>

<table border="1" cellpadding="1" cellspacing="1" style="margin-left:40px; width:500px">
	<tbody>
		<tr>
			<td>&nbsp;</td>
			<td><span style="font-size:14px">Right renal artery</span></td>
			<td><span style="font-size:14px">Left renal artery</span></td>
		</tr>
		<tr>
			<td><span style="font-size:14px">PSV ( cm/sec)</span></td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><span style="font-size:14px">RI</span></td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
	</tbody>
</table>

<ul>
	<li><span style="font-size:14px">Intrarenal arteries of bilateral kidneys show normal spectral wave forms.</span></li>
</ul>

<table border="1" cellpadding="1" cellspacing="1" style="margin-left:40px; width:500px">
	<tbody>
		<tr>
			<td>&nbsp;</td>
			<td><span style="font-size:14px">Rt Intrarenal arteries</span></td>
			<td><span style="font-size:14px">Lt intrarenal arteries</span></td>
		</tr>
		<tr>
			<td><span style="font-size:14px">RI</span></td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><span style="font-size:14px">Acceleration index( AI) m/s</span></td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><span style="font-size:14px">Acceleration time ( AT) ms</span></td>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
		<tr>
			<td><span style="font-size:14px">Early systolic peak</span></td>
			<td><span style="font-size:14px">Present/Absent</span></td>
			<td><span style="font-size:14px">Present/Absent</span></td>
		</tr>
	</tbody>
</table>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal renal arterial Doppler study.</strong></span></li>
	<li><span style="font-size:14px"><strong>Normal bilateral kidneys. </strong></span></li>
	<li><span style="font-size:14px"><strong>Normal abdominal aorta. Normal bilateral suprarenal region.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:29:38.243' AS DateTime), 1, CAST(N'2019-01-07T16:40:23.980' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (13, N'Radiology', N'USG - Soft Tissue', N'USG - Soft Tissue', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>USG OF THE SOFT TISSUE</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">No SOL seen.</span></li>
	<li><span style="font-size:14px">Visualized muscles and tendons are unremarkable.</span></li>
	<li><span style="font-size:14px">Included joints appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:31:36.127' AS DateTime), 1, CAST(N'2019-01-04T15:37:24.587' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (14, N'Radiology', N'USG - Transcranial USG', N'USG - Transcranial USG', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF TRANSCRANIAL USG</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Normal bilateral cerebral hemispheres. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Normal bilateral basal ganglia and thalami. Normal caudothalamic grooves of both sides.</span></li>
	<li><span style="font-size:14px">Normal brain stem.</span></li>
	<li><span style="font-size:14px">Normal cerebellum.</span></li>
	<li><span style="font-size:14px">Normal sulci, cisterns and ventricles.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:32:17.867' AS DateTime), 1, CAST(N'2019-01-07T16:44:24.057' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (16, N'Radiology', N'USG - Bilateral Breasts', N'USG - Bilateral Breasts', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF USG OF BILATERAL BREASTS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">B/L subcutaneous tissues are normal.</span></li>
	<li><span style="font-size:14px">Mammary zone of B/L breasts show normal fibro-fatty and glandular echotexture. No solid and cystic mass lesion seen. No distortion of parenchymal architecture noted.</span></li>
	<li><span style="font-size:14px">No e/o dilated ducts seen.</span></li>
	<li><span style="font-size:14px">Visualized retromammary zone is normal.</span></li>
	<li><span style="font-size:14px">No enlarged axillary lymph nodes seen.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal breast scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:35:30.620' AS DateTime), 1, CAST(N'2019-01-07T16:30:07.593' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (17, N'Radiology', N'USG Guided Pleural Aspiration', N'USG Guided Pleural Aspiration', N'<p style="margin-left:0.5in; text-align:center"><u><span style="font-size:20px"><strong>USG GUIDED PLEURAL ASPIRATION</strong></span></u></p>

<ul>
	<li><span style="font-size:14px">Under aseptic precaution, about 10 ml of straw color pleural fluid was aspirated from left side for diagnostic purpose. No procedural complication seen. The fluid was sent for laboratory investigations as indicated.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:46:45.113' AS DateTime), 1, CAST(N'2018-04-15T18:05:09.017' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (18, N'Radiology', N'USG - Neck', N'USG - Neck', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF USG OF THE NECK</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral thyroid lobes are normal in size, outline and echotexutre. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Isthmus is normal.</span></li>
	<li><span style="font-size:14px">Major neck vessels are normal.</span></li>
	<li><span style="font-size:14px">No significant cervical lymphadenopathy noted.</span></li>
	<li><span style="font-size:14px">Bilateral parotid and submandibular glands are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:47:36.630' AS DateTime), 1, CAST(N'2019-01-07T16:30:16.583' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (19, N'Radiology', N'USG - Scrotum/Testis', N'USG - Scrotum/Testis', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF USG OF THE SCROTUM/TESTIS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral testes are normal in size, outline and echotexture. No focal lesion seen. Normal vascularity noted.</span></li>
	<li><span style="font-size:14px">Bilateral epididymes are normal in size, outline and echotexture. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">No fluid collection in the tunical sac.</span></li>
	<li><span style="font-size:14px">Normal pampiniform venous plexus.</span></li>
	<li><span style="font-size:14px">No evidence of inguinal hernia noted.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:48:42.460' AS DateTime), 1, CAST(N'2019-01-07T16:30:25.383' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (20, N'Radiology', N'USG - Venous Doppler', N'USG - Venous Doppler', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong>Peripheral Venous Doppler Study</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>RIGHT LOWER LIMB:</strong>&nbsp;Common/external iliac, common/superficial femoral, saphenous, popliteal vein and it&#39;s tributaries are normal in outline and wall thickness. All these veins are compressible and show normal venous blood flow in both color and spectral Doppler study. </span></li>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px">Respiratory phasicity is maintained.</span></li>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px">No thrombus evident.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:12pt"><span style="font-size:14px">Normal Doppler Study of the Deep Venous System of Lower Limbs.</span></span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:49:42.283' AS DateTime), 1, CAST(N'2019-01-07T16:45:15.787' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (21, N'Radiology', N'HSG', N'HSG', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>HSG</u></strong></span></p>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px">Uterus is anteverted, normal in size, outline with normal endometrial cavity. Air pocket is noted within the uterine cavity.</span></li>
	<li><span style="font-size:14px">Both fallopian tubes are simultaneously opacified with contrast and appears normal.</span></li>
	<li><span style="font-size:14px">Bilateral peritoneal spillage of contrast is noted.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal HSG study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:50:27.707' AS DateTime), 1, CAST(N'2019-01-07T16:45:48.043' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (22, N'Radiology', N'CT - NC and CECT ABDOMEN (F)', N'CT - NC and CECT OF ABDOMEN (Female)', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NC and CECT OF ABDOMEN</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, outline and attenuation. No focal lesion seen. IHBD are not dilated. IVC, hepatic veins and portal vein are normal.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN</strong>: Normal in size, outline and attenuation. No focal lesion seen. &nbsp;</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS</strong>: Both kidneys are normal in size, outline, attenuation and contrast excretion. No calculus or focal lesion seen on either side. No hydronephrosis.</span></li>
	<li><span style="font-size:14px"><strong>ADRENAL GLANDS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>UTERUS</strong>:&nbsp; Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li><span style="font-size:14px">B/L <strong>adnexa</strong>: Normal.</span></li>
	<li><span style="font-size:14px">Stomach and bowel loops are normal.</span></li>
	<li><span style="font-size:14px">No free fluid in peritoneal cavity. No lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Scanned lung parenchyma appears normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong>Normal Scan</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:53:10.170' AS DateTime), 1, CAST(N'2019-01-08T12:50:21.010' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (23, N'Radiology', N'NC and CECT OF CHEST & ABDOMEN', N'NC and CECT OF CHEST &  ABDOMEN (Female)', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NC and CECT of CHEST an ABDOMEN</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings: </strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral lungs are normal. No focal lung lesion noted.</span></li>
	<li><span style="font-size:14px">Mediastinal structures appear normal. &nbsp;</span></li>
	<li><span style="font-size:14px">No hilar or mediastinal lymphadenopathy. No pleural effusion.</span></li>
	<li><span style="font-size:14px">Normal symmetrical chest wall.</span></li>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, outline and attenuation. No focal lesion seen. IHBD are not dilated. IVC, hepatic veins and portal vein are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER</strong>: Normal in distensibility and wall thickness. No calculus or mass noted.</span></li>
	<li><span style="font-size:14px"><strong>CBD</strong>: Common bile duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN</strong>: Normal in size, outline and attenuation. No focal lesion seen.&nbsp;</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS</strong>: Both kidneys are normal in size, outline, attenuation and contrast excretion. No calculus or focal lesion seen on either side. No hydronephrosis.</span></li>
	<li><span style="font-size:14px"><strong>ADRENAL GLANDS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>UTERUS</strong>:&nbsp; Normal in size and morphology. No SOL. Empty uterine cavity.</span></li>
	<li><span style="font-size:14px"><strong>ADNEXAE</strong>: Unremarkable. No mass lesion seen.</span></li>
	<li><span style="font-size:14px">Stomach and bowel loops are normal. No free fluid in peritoneal cavity. No lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:54:38.057' AS DateTime), 1, CAST(N'2019-01-08T12:50:55.900' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (24, N'Radiology', N'NC & CECT OF CHEST & ABDOMEN', N'NC and CECT OF CHEST &  ABDOMEN (Male)', N'<p style="text-align:center"><strong><u><span style="font-size:20px">NC and CECT of CHEST and ABDOMEN</span></u></strong></p>

<p><span style="font-size:16px"><strong>Findings: </strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral lungs are normal. No focal lung lesion noted.</span></li>
	<li><span style="font-size:14px">Mediastinal structures appear normal. &nbsp;</span></li>
	<li><span style="font-size:14px">No hilar or mediastinal lymphadenopathy. No pleural effusion.</span></li>
	<li><span style="font-size:14px">Normal symmetrical chest wall.</span></li>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, outline and attenuation. No focal lesion seen. IHBD are not dilated. IVC, hepatic veins and portal vein are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER</strong>: Normal in distensibility and wall thickness. No calculus or mass noted.</span></li>
	<li><span style="font-size:14px"><strong>CBD</strong>: Common bile duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN</strong>: Normal in size, outline and attenuation. No focal lesion seen.&nbsp;</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS</strong>: Both kidneys are normal in size, outline, attenuation and contrast excretion. No calculus or focal lesion seen on either side. No hydronephrosis.</span></li>
	<li><span style="font-size:14px"><strong>ADRENAL GLANDS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>PROSTATE</strong>: &nbsp;Normal in size and morphology.</span></li>
	<li><span style="font-size:14px">Stomach and bowel loops are normal. No free fluid in peritoneal cavity. No lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:55:40.900' AS DateTime), 1, CAST(N'2019-01-18T11:19:15.790' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (25, N'Radiology', N'CT - NCCT OF C-SPINE', N'CT - NCCT OF C-SPINE', N'<div style="text-align:center"><span style="font-size:20px"><u><strong>CT SCAN OF CERVICAL SPINE </strong></u></span></div>

<div style="text-align:center"><span style="font-size:12px">(plain)</span></div>

<div style="text-align:center"><span style="font-size:12px">&nbsp;3x3 mm plain contiguous axial sections of the cervical spine were obtained</span></div>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">The cervical spine shows normal degree of lordosis, with no segmental malalignment.</span></li>
	<li><span style="font-size:14px">The vertebral bodies show normal configuration and trabecular structure.</span></li>
	<li><span style="font-size:14px">The cortical margins are of normal thickness and are free of osteophytes.</span></li>
	<li><span style="font-size:14px">The bony spinal canal shows normal sagittal diameter.</span></li>
	<li><span style="font-size:14px">The intervertebral disks show normal CT density and normal posterior concavity. The disks do not project past the posterior surface of the vertebral bodies.</span></li>
	<li><span style="font-size:14px">The spinal cord is centrally placed and of normal width. It has homogeneous density and shows no circumscribed narrowing or expansion.</span></li>
	<li><span style="font-size:14px">The nerve roots show a normal course and passage through the neuroforamina, which are of normal size and structure. The facet joints and uncovertebral joints are unremarkable. Transverse processes, foramen transversarium and spinous processes are normal.</span></li>
	<li><span style="font-size:14px">The prevertebral and paravertebral soft tissues show no abnormalities.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:56:28.323' AS DateTime), 1, CAST(N'2019-01-08T12:52:06.483' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (26, N'Radiology', N'CT - KUB', N'CT - KUB', N'<div style="text-align:center"><span style="font-size:20px"><strong><u>CT&nbsp; KUB</u></strong></span></div>

<div style="text-align:center"><span style="font-size:12px">(plain)<br />
volume scan of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis.</span></div>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Right kidney is normal in&nbsp;size, outline and attenuation. &nbsp;No evidence of calculus or any focal lesion seen in right kidney. No hydronephrosis seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Left kidney is normal in&nbsp;size, outline and attenuation. &nbsp;No evidence of calculus or any focal lesion seen in right kidney. No hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bladder is normal in outline and distensibility. No evidence of any calculi noted in lumen of urinary bladder and bilateral vesicoureteric junction region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Rests of the abdominal organs appear grossly normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION</strong></span></p>

<ul>
	<li><strong>Normal Findings.</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:57:28.677' AS DateTime), 1, CAST(N'2019-01-07T16:46:45.370' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (27, N'Radiology', N'NC and CECT OF ABDOMEN', N'NC and CECT OF ABDOMEN Female', N'<div style="text-align:center"><strong><u><span style="font-size:20px">NC and CECT OF ABDOMEN</span></u></strong></div>

<div style="text-align:center"><span style="font-size:12px"><u>(along with oral contrast)</u></span></div>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, outline and attenuation. No focal lesion seen. IHBD are not dilated. IVC, hepatic veins and portal vein are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER</strong>: Normal in distensibility and wall thickness. No calculus or mass noted.</span></li>
	<li><span style="font-size:14px"><strong>CBD</strong>: Common bile duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN</strong>: Normal in size, outline and attenuation. No focal lesion seen. &nbsp;</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS</strong>: Both kidneys are normal in size, outline, attenuation and contrast excretion. No calculus or focal lesion seen on either side. No hydronephrosis.</span></li>
	<li><span style="font-size:14px"><strong>ADRENAL GLANDS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>UTERUS</strong>:&nbsp; Normal in size and morphology. No SOL. Empty uterine cavity.</span></li>
	<li><span style="font-size:14px"><strong>ADNEXAE</strong>: Unremarkable. No mass lesion seen.</span></li>
	<li><span style="font-size:14px">Stomach and bowel loops are normal.</span></li>
	<li><span style="font-size:14px">No free fluid in peritoneal cavity. No lymphadenopathy.\</span></li>
	<li><span style="font-size:14px">Scanned lung parenchyma appears normal.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T16:58:27.340' AS DateTime), 1, CAST(N'2019-01-07T16:47:17.120' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (28, N'Radiology', N'CT - NC and CECT of Abdomen(M)', N'CT - NC and CECT of Abdomen (Male)', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NC and CECT oABDOMEN</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">LIVER: Normal in size, outline and attenuation. No focal lesion seen. IHBD are not dilated. IVC, hepatic veins and portal vein are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER</strong>: Normal in distensibility and wall thickness. No calculus or mass noted.</span></li>
	<li><span style="font-size:14px"><strong>CBD</strong>: Common bile duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN</strong>: Normal in size, outline and attenuation. No focal lesion seen. &nbsp;</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS</strong>: Both kidneys are normal in size, outline, attenuation and contrast excretion. No calculus or focal lesion seen on either side. No hydronephrosis.</span></li>
	<li><span style="font-size:14px"><strong>ADRENAL GLANDS</strong>: Normal in size, outline and attenuation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>PROSTATE</strong>:&nbsp; Normal in size and morphology. No demonstrable SOL.</span></li>
	<li><span style="font-size:14px">Stomach and bowel loops are normal.</span></li>
	<li><span style="font-size:14px">No free fluid in peritoneal cavity. No lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Scanned lung parenchyma appears normal.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>Impression: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:04:01.987' AS DateTime), 1, CAST(N'2019-01-08T12:52:47.287' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (29, N'Radiology', N'NC and CECT OF CHEST ', N'NC and CECT OF CHEST ', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NC and CECT of CHEST</u></strong></span><br />
<span style="font-size:12px">Plain and contrast enhanced helical scan of chest was obtained from the lung apices to the upper abdomen.</span></p>

<p style="text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral lungs are normal in aeration and attenuation pattern. No focal lung lesion noted.</span></li>
	<li><span style="font-size:14px">Mediastinum is central. Trachea and main bronchi are normal. Heart and major mediastinal vessels are normal.</span></li>
	<li><span style="font-size:14px">No significant hilar or mediastinal lymphadenopathy.</span></li>
	<li><span style="font-size:14px">No pleural effusion. No pneumothorax.</span></li>
	<li><span style="font-size:14px">Normal symmetrical chest wall.</span></li>
	<li><span style="font-size:14px">Normal visualized abdominal organs.</span></li>
	<li><span style="font-size:14px">Normal visualized bones.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:05:09.447' AS DateTime), 1, CAST(N'2019-01-18T11:40:05.923' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (30, N'Radiology', N'NCCT OF PELVIS', N'NCCT OF PELVIS', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF PELVIS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Pelvic bones (Ilium,Ishcium,Pubic and Sacrum) are normal.</span></li>
	<li><span style="font-size:14px">SI joints, Hip joints and symphysis pubis are normal.</span></li>
	<li><span style="font-size:14px">No mass lesion, no lytic changes notes.</span></li>
	<li><span style="font-size:14px">Visualized soft tissues are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:05:44.910' AS DateTime), 1, CAST(N'2019-01-07T16:47:51.107' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (31, N'Radiology', N'CT - Urogram', N'CT - Urogram', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT UROGRAPHY</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5x3mm contiguous plain and contrast enhanced axial sections of the abdomen were obtained from the dome of diaphragm&nbsp; to symphysis pubis.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Right kidney measures 9.8 x 4.3 cm and is&nbsp;&nbsp; &nbsp;outline and attenuation. &nbsp;Right pelvicalyceal system is normal in outline including normal calyceal cupping pattern. No evidence of calculus or any focal lesion seen in right kidney.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Left kidney measures 9.8 x 4.3 cm and is&nbsp;&nbsp; &nbsp;outline and attenuation. &nbsp;Left pelvicalyceal system is normal in outline including normal calyceal cupping pattern. No evidence of calculus or any focal lesion seen in left kidney.</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show good and prompt excretion of contrast. Normal opacification of bilateral &nbsp;pelvicalyceal system including normal calyceal cupping pattern is noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">B/L ureter is normal in course, outline and caliber. No evidence of any filling defect or outpouching noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bladder is normal in outline and distensibility. No evidence of any calculi noted in lumen of urinary bladder and bilateral vesicoureteric junction region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline with no calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and visualized bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or lymphadenopathy seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>B</strong>/<strong>L adnexa</strong>: Normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal CT-urography.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normally excreting bilateral kidneys.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:06:36.190' AS DateTime), 1, CAST(N'2019-01-07T16:48:05.570' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (32, N'Radiology', N'CT LOWER LIMBS ANGIOGRAM', N'CT LOWER LIMBS ANGIOGRAM', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>CT LOWER LIMBS ANGIOGRAM </u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral common iliac artery, common femoral artery, superficial femoral artery, profunda femoris, popliteal artery, tibioperoneal trunk, posterior tibial artery, peroneal artery, anterior tibial artery and dorsalis pedis artery are normal in course, caliber, outline and contrast opacification. No evidence of focal outpouching or luminal narrowing noted. No evidence of any intraluminal thrombosis noted.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:07:15.607' AS DateTime), 1, CAST(N'2019-01-06T12:35:39.930' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (33, N'Radiology', N'NC & CECT OF HEAD + CHEST', N'NC & CECT OF HEAD + CHEST', N'<p style="margin-left:1.5in; text-align:center"><span style="font-size:20px"><strong><u>NC &amp; CECT OF HEAD + CHEST</u></strong></span></p>

<div><span style="font-size:16px"><strong>Findings: </strong></span></div>

<div style="margin-left:4.5pt"><span style="font-size:14px"><strong>HEAD:</strong></span></div>

<ul style="list-style-type:circle">
	<li><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical and appear normal in attenuation and grey-white differentiation. No focal lesion seen.&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li><span style="font-size:14px">Bilateral basal ganglia, thalami and internal capsule appear normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Brain stem structures are normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">The cerebellar hemispheres are normal in symmetry, size and attenuation pattern. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">No extra axial collection or mass noted.</span></li>
	<li><span style="font-size:14px">Sulci, cisterns and ventricles are normal.</span></li>
	<li><span style="font-size:14px">The visualized bones and soft tissues appear normal.</span></li>
</ul>

<p><span style="font-size:14px"><strong>CHEST:</strong></span></p>

<ul style="list-style-type:circle">
	<li><span style="font-size:14px">Bilateral lungs are normal in aeration and bronchovascular markings. No focal lesion noted.</span></li>
	<li><span style="font-size:14px">Mediastinum: Trachea and main bronchi are normal. Heart and major vessels are normal. No lymphadenopathy.</span></li>
	<li><span style="font-size:14px">No pleural effusion and no pleural thickening.</span></li>
	<li><span style="font-size:14px">Normal symmetrical chest wall.</span></li>
	<li><span style="font-size:14px">Normal visualized abdominal organs.</span></li>
	<li><span style="font-size:14px">Normal visualized bones.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal brain study.</strong></span></li>
	<li><span style="font-size:14px"><strong>Normal Chest Study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:08:19.947' AS DateTime), 1, CAST(N'2019-01-08T12:54:01.367' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (34, N'Radiology', N'CT - Head + PNS', N'CT - Head + PNS', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF HEAD &amp; PNS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical and appear normal in attenuation and grey-white differentiation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Bilateral basal ganglia, thalami and internal capsule appear normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Brain stem structures are normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">The cerebellar hemispheres are normal in symmetry, size and attenuation pattern. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">No extra axial collection or mass noted.</span></li>
	<li><span style="font-size:14px">Sulci, cisterns and ventricles are normal.</span></li>
	<li><span style="font-size:14px">Bilateral paranasal sinuses (maxillary, frontal, ethmoidal and sphenoid sinuses) are normal. No mass lesion or fluid density seen.</span></li>
	<li><span style="font-size:14px">The ostiomeatal complexes in both sides are normal.</span></li>
	<li><span style="font-size:14px">Nasal septum is in midline. Turbinates are normal.</span></li>
	<li><span style="font-size:14px">The visualised bones and soft tissues appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal brain study.</strong></span></li>
	<li><span style="font-size:14px"><strong>Normal PNS study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:08:59.793' AS DateTime), 1, CAST(N'2019-01-07T16:31:54.983' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (35, N'Radiology', N'NCCT AND CECT OF HEAD/NECK', N'NCCT AND CECT OF HEAD/NECK', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT AND CECT OF HEAD/NECK</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical and appear normal in attenuation and grey-white differentiation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Bilateral basal ganglia, thalami and internal capsule appear normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Brain stem structures are normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">The cerebellar hemispheres are normal in symmetry, size and attenuation pattern. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">No extra axial collection or mass noted.</span></li>
	<li><span style="font-size:14px">Sulci, cisterns and ventricles are normal.</span></li>
	<li><span style="font-size:14px">The visualized bones and soft tissue structures appear normal.</span></li>
	<li><span style="font-size:14px">Naso-, oro- and hypopharynx are normal. Normal oral cavity and its contents.</span></li>
	<li><span style="font-size:14px">Bilateral thyroid, parotid and submandibular glands are normal.</span></li>
	<li><span style="font-size:14px">Normal larynx (glottis, supraglottic and infraglotic parts). Normal laryngeal cartilages.&nbsp; Bilateral aryepiglottic folds, epiglottis and pyriform sinuses are normal.</span></li>
	<li><span style="font-size:14px">Major neck vessels are normal.</span></li>
	<li><span style="font-size:14px">No significant cervical lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Superficial and deep spaces of the neck are normal.</span></li>
	<li><span style="font-size:14px">Normal bony structures.</span></li>
	<li><span style="font-size:14px">Other visualized structures are normal</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:09:43.553' AS DateTime), 1, CAST(N'2019-01-06T12:42:49.087' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (36, N'Radiology', N'NCCT ofHEAD and CERVICAL SPINE', N'NCCT of HEAD and CERVICAL SPINE', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT of HEAD and CERVICAL SPINE</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical and appear normal in attenuation and grey-white differentiation. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Brain stem structures are normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">The cerebellar hemispheres are normal in symmetry, size and attenuation pattern. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Sulci, cisterns and ventricles are normal.</span></li>
	<li><span style="font-size:14px">No extra axial collection or mass noted.</span></li>
	<li><span style="font-size:14px">Bony calvarium appears normal.</span></li>
	<li><span style="font-size:14px">The cervical spine appears normal in alignment.</span></li>
	<li><span style="font-size:14px">The vertebrae are normal in morphology and outline.</span></li>
	<li><span style="font-size:14px">No fracture seen.</span></li>
	<li><span style="font-size:14px">No lytic or sclerotic bone lesion seen.</span></li>
	<li><span style="font-size:14px">Spinal canal is normal in caliber.</span></li>
	<li><span style="font-size:14px">The facet joints and uncovertebral joints appear normal.</span></li>
	<li><span style="font-size:14px">The disc heights appear normal.</span></li>
	<li><span style="font-size:14px">Visualised soft tissue structures appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:11:16.050' AS DateTime), 1, CAST(N'2019-01-08T12:54:41.800' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (37, N'Radiology', N'NCCT OF HEAD & ORBIT', N'NCCT OF HEAD & ORBIT', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF HEAD &amp; ORBIT </u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:&nbsp; </strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical and appear normal in attenuation and grey-white differentiation. No focal lesion noted.</span></li>
	<li><span style="font-size:14px">Bilateral basal ganglia, thalamus and internal capsule appear normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Brain stem structures are normal. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">The cerebellar hemispheres are normal in symmetry, size and attenuation pattern. No focal lesion seen.</span></li>
	<li><span style="font-size:14px">Sulci, cisterns and ventricles are normal.</span></li>
	<li><span style="font-size:14px">Normal bilateral eye balls. Normal lens. Normal anterior and posterior chambers of the eye ball.</span></li>
	<li><span style="font-size:14px">Extraocular muscles are normal. Extraconal and intraconal compartments are normal.</span></li>
	<li><span style="font-size:14px">Bilateral optic nerves are normal.</span></li>
	<li><span style="font-size:14px">Normal paranasal sinuses and nasal cavity</span></li>
	<li><span style="font-size:14px">The visualized bones and soft tissues appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal brain study.</strong></span></li>
	<li><span style="font-size:14px"><strong>Normal orbit Study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:11:50.813' AS DateTime), 1, CAST(N'2019-01-06T12:50:23.207' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (38, N'Radiology', N'CT - Head', N'CT - Head', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF HEAD</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric plain axial sections of the head were obtained from the level of the base of the skull to the vertex.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></div>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Head size</strong>: Normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Calvarium</strong>: Normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cerebral Hemispheres</strong>: Symmetrical&nbsp;</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Midline shift</strong>: Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Ventricles and Cisterns</strong>: Symmetrical</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Lateral ventricles</strong>: Normal</span></li>
		<li style="text-align:justify"><span style="font-size:14px"><strong>Third and Fourth ventricles</strong>: Normal</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Basal ganglia/ Internal capsule</strong>: Normal</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Focal lesion</strong>: Absent</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Brain stem</strong>:&nbsp; Focal Lesion Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cerebellum</strong>: Symmetrical</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Focal lesion</strong>: Absent</span></li>
	</ul>
	</li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:12:25.977' AS DateTime), 1, CAST(N'2019-01-08T12:55:17.840' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (39, N'Radiology', N'NCCT OF HEAD & PNS', N'NCCT OF HEAD & PNS', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF HEAD &amp; PNS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li>
	<div><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical and appear normal in attenuation and grey-white differentiation. No focal lesion seen.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">Bilateral basal ganglia, thalami and internal capsule appear normal. No focal lesion seen.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">Brain stem structures are normal. No focal lesion seen.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">The cerebellar hemispheres are normal in symmetry, size and attenuation pattern. No focal lesion seen.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">No extra axial collection or mass noted.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">Sulci, cisterns and ventricles are normal.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">Bilateral paranasal sinuses (maxillary, frontal, ethmoidal and sphenoid sinuses) are normal. No mass lesion or fluid density seen.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">The ostiomeatal complexes in both sides are normal.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">Nasal septum is in midline. Turbinates are normal.</span></div>
	</li>
	<li>
	<div><span style="font-size:14px">The visualised bones and soft tissues appear normal.</span></div>
	</li>
</ul>

<div>
<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>
</div>

<ul>
	<li><span style="font-size:14px"><strong>Normal brain study.</strong></span></li>
	<li><span style="font-size:14px"><strong>Normal PNS study.</strong></span></li>
</ul>

<p>&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-03-20T17:13:04.383' AS DateTime), 1, CAST(N'2019-01-08T12:55:39.887' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (40, N'Radiology', N'HRCT CHEST', N'HRCT CHEST', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>HRCT CHEST</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">2X10mm noncontiguous axial sections of the chest were obtained from the lung apices to the bases.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Both lung fields show normal attenuation and normal in aeration. The bronchovascular markings noted bilaterally symmetrical. No evidence of thickening of interlobular or intralobular septa noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The volume of bilateral lung is maintained. No evidence of volume reduction.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Trachea and major bronchi are normal. No evidence of peribronchial thickening noted in either side.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cardiac size appears normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: &nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal findings.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:14:20.607' AS DateTime), 1, CAST(N'2019-01-06T12:57:09.347' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (41, N'Radiology', N'CT - Knee Joints', N'CT - Knee Joints', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF&nbsp;KNEE JOINT</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">No fluid collection seen in the knee joint.</span></li>
	<li><span style="font-size:14px">Normal alignment/congruity of knee joint forming bones.</span></li>
	<li><span style="font-size:14px">The distal femur, proximal tibia/fibula and the patella appear normal.</span></li>
	<li><span style="font-size:14px">No fracture seen. No lytic or sclerotic bone lesion.</span></li>
	<li><span style="font-size:14px">Visualized soft tissue structures appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong><em>&nbsp;</em>Normal study. </strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:16:31.143' AS DateTime), 1, CAST(N'2019-01-07T16:32:14.077' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (42, N'Radiology', N'NCCT of LUMBO - SACRAL SPINE', N'NCCT  of  LUMBO - SACRAL  SPINE', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT&nbsp; OF&nbsp; LUMBO-SACRAL &nbsp;SPINE</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Normal vertebral alignment.</span></li>
	<li><span style="font-size:14px">The visualized vertebrae appear normal. Normal vertebral body and posterior elements.</span></li>
	<li><span style="font-size:14px">No fracture seen.</span></li>
	<li><span style="font-size:14px">No lytic/sclerotic bone lesion seen.</span></li>
	<li><span style="font-size:14px">Normal spinal canal. No significant stenosis.</span></li>
	<li><span style="font-size:14px">Normal facets joints.</span></li>
	<li><span style="font-size:14px">Intervertebral foraminae are normal.</span></li>
	<li><span style="font-size:14px">Disc spaces are normal.</span></li>
	<li><span style="font-size:14px">Normal bilateral SI joints.</span></li>
	<li><span style="font-size:14px">Normal visualized soft tissues.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:17:17.650' AS DateTime), 1, CAST(N'2019-01-07T16:51:14.657' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (43, N'Radiology', N'NCCT OF MAXILLA AND MANDIBLE', N'NCCT OF MAXILLA AND MANDIBLE', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF MAXILLA AND MANDIBLE</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Maxillary and mandibular bones appear normal.</span></li>
	<li><span style="font-size:14px">B/L temporomandibular joint appears normal.</span></li>
	<li><span style="font-size:14px">Normal orbit and its content.</span></li>
	<li><span style="font-size:14px">Normal paranasal sinuses and nasal cavity.</span></li>
	<li><span style="font-size:14px">Visualized brain structures are normal.</span></li>
	<li><span style="font-size:14px">No obvious fracture noted in scanned area.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong><em>&nbsp;</em>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:17:54.297' AS DateTime), 1, CAST(N'2019-01-07T16:51:24.877' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (44, N'Radiology', N'CT-Chest', N'CT - Chest Plain', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF CHEST</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous plain and contrast enhanced axial sections from the base of skull to aortic arch level. </span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Trachea is central. Laryngeal cartilages are normal. B/L pyriform sinuses are normal. B/l thyroid lobes are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted.</span></li>
	<li><span style="font-size:14px">Mediastinum: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen.</span></li>
	<li><span style="font-size:14px">Pleura: No pleural effusion or pleural thickening.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Chest wall: Bilaterally Symmetrical and normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible bones are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:18:45.173' AS DateTime), 1, CAST(N'2019-01-08T12:57:18.223' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (45, N'Radiology', N'NCCT of Right Clavicle', N'NCCT of Right Clavicle', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT of Right Clavicle</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">The clavicle appears normal.</span></li>
	<li><span style="font-size:14px">The sternoclavicular joint appears normal.</span></li>
	<li><span style="font-size:14px">The acromioclavicular joint also appears normal.</span></li>
	<li><span style="font-size:14px">The scapula, proximal humerus and visualized ribs appear normal.</span></li>
	<li><span style="font-size:14px">Visualised soft tissue structures appear normal.</span></li>
	<li><span style="font-size:14px">Viaualised right lung appears normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:19:18.677' AS DateTime), 1, CAST(N'2019-01-08T12:57:37.753' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (46, N'Radiology', N'CT - Neck', N'CT - Neck', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF NECK</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous plain &nbsp;sections from the base of skull to aortic arch level. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">B/l parapharyngeal, retropharyngeal ,masticator ,parotid&amp; carotid spaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissues of the neck are normal.&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral carotid arteries are normal in course, caliber and outline.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Trachea is central. Laryngeal cartilages are normal. B/L pyriform sinuses are normal. B/l thyroid lobes are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible bones are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: &nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></p>
', NULL, NULL, 1, CAST(N'2018-03-20T17:19:52.170' AS DateTime), 1, CAST(N'2019-01-08T12:58:04.437' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (47, N'Radiology', N'NECK, CHEST,ABDOMEN', N'NC and CECT of NECK, CHEST and ABDOMEN', N'<p style="text-align:center"><u><span style="font-size:20px"><strong>NC and CECT of NECK, CHEST and ABDOMEN</strong></span></u></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Aero-digestive tract appears normal.</span></li>
	<li><span style="font-size:14px">Thyroid, bilateral parotid and submandibular glands are normal.</span></li>
	<li><span style="font-size:14px">Major neck vessels are normal.</span></li>
	<li><span style="font-size:14px">No significant cervical lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Superficial and deep spaces of the neck are normal.</span></li>
	<li><span style="font-size:14px">Bilateral lungs are normal. No focal lung lesion seen.</span></li>
	<li><span style="font-size:14px">Normal mediastinal structures.</span></li>
	<li><span style="font-size:14px">No significant hilar or mediastinal lymphadenopathy.</span></li>
	<li><span style="font-size:14px">No pleural effusion.</span></li>
	<li><span style="font-size:14px">Liver, GB, CBD, spleen, pancreas, kidneys, adrenal glands, UB and pelvic organs are normal.</span></li>
	<li><span style="font-size:14px">Stomach and bowel loops are normal.</span></li>
	<li><span style="font-size:14px">No significant lymphadenopathy.</span></li>
	<li><span style="font-size:14px">No free fluid in peritoneal cavity.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Scan</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:20:57.960' AS DateTime), 1, CAST(N'2019-01-08T12:58:20.230' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (48, N'Radiology', N'CT - Neck + Chest', N'CT - Neck + Chest', N'<p style="text-align:center"><strong><u><span style="font-size:20px">NC and CECT of NECK and CHEST</span></u></strong></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Aero-digestive tract appears normal.</span></li>
	<li><span style="font-size:14px">Thyroid, bilateral parotid and submandibular glands are normal.</span></li>
	<li><span style="font-size:14px">Major neck vessels are normal.</span></li>
	<li><span style="font-size:14px">No significant cervical lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Superficial and deep spaces of the neck are normal.</span></li>
	<li><span style="font-size:14px">Bilateral lungs are normal. No focal lung lesion seen.</span></li>
	<li><span style="font-size:14px">Normal mediastinal structures.</span></li>
	<li><span style="font-size:14px">No significant hilar or mediastinal lymphadenopathy.</span></li>
	<li><span style="font-size:14px">No pleural effusion.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION</strong></span></p>

<ul>
	<li>
	<p><span style="font-size:14px"><strong>Normal Scan</strong>.</span></p>
	</li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:21:54.317' AS DateTime), 1, CAST(N'2019-01-07T16:33:00.950' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (49, N'Radiology', N'NCCT OF ORBIT', N'NCCT OF ORBIT', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF ORBIT</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Normal bilateral eye balls. Normal lens. Normal anterior and posterior chambers of the eye ball.</span></li>
	<li><span style="font-size:14px">Extraocular muscles are normal. Extraconal and intraconal compartments are normal.</span></li>
	<li><span style="font-size:14px">Bilateral optic nerves are normal.</span></li>
	<li><span style="font-size:14px">Bony structures are normal.</span></li>
	<li><span style="font-size:14px">Normal paranasal sinuses and nasal cavity.</span></li>
	<li><span style="font-size:14px">Visualized brain structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong>&nbsp;<span style="font-size:14px">Normal scan.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:22:31.633' AS DateTime), 1, CAST(N'2019-01-06T14:05:00.980' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (50, N'Radiology', N'CT - PNS', N'CT - PNS', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF PARANASAL SINUSES</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric plain axial and coronal sections of nose and paranasal sinuses were obtained.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">All the paranasal sinuses appear normal in outline and show normal aeration. No soft tissue density noted within. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ostiomeatal complex are bilaterally normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Turbinates appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No bony lesion seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal finding</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:23:25.793' AS DateTime), 1, CAST(N'2019-01-08T12:58:55.163' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (51, N'Radiology', N'NC and CECT OF PNS & NECK', N'NC and CECT OF PNS & NECK', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NC and CECT OF PNS &amp; NECK</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral paranasal sinuses (including maxillary, frontal, ethmoidal and sphenoid sinuses) are normal. No mass lesion or fluid density seen.</span></li>
	<li><span style="font-size:14px">The ostiomeatal complexes in both sides are normal.</span></li>
	<li><span style="font-size:14px">Nasal septum is in midline. The nasal turbinates are normal.</span></li>
	<li><span style="font-size:14px">The visualised bones and soft tissues appear normal.</span></li>
	<li><span style="font-size:14px">Bilateral thyroid, parotid and submandibular glands are normal.</span></li>
	<li><span style="font-size:14px">Naso-, oro- and hypopharynx are normal. Normal oral cavity and its contents.</span></li>
	<li><span style="font-size:14px">Normal larynx (glottis, supraglottic and infraglotic parts). Normal laryngeal cartilages.&nbsp; Bilateral aryepiglottic folds, epiglottis and pyriform sinuses are normal.</span></li>
	<li><span style="font-size:14px">Major neck vessels are normal.</span></li>
	<li><span style="font-size:14px">No significant cervical lymphadenopathy.</span></li>
	<li><span style="font-size:14px">Superficial and deep spaces of the neck are normal.</span></li>
	<li><span style="font-size:14px">Normal bony structures.</span></li>
	<li><span style="font-size:14px">Other visualized structures are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:24:08.927' AS DateTime), 1, CAST(N'2019-01-06T14:06:59.993' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (52, N'Radiology', N'NC & CECT OF MASTOID', N'NC & CECT OF MASTOID', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NC &amp; CECT OF MASTOID</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral CP angles are unremarkable. No mass lesion noted.</span></li>
	<li><span style="font-size:14px">Bilateral internal auditory meati are normal in course and caliber. No SOL is noted within it.</span></li>
	<li><span style="font-size:14px">Inner ear apparatus are normal in both sides.</span></li>
	<li><span style="font-size:14px">Bilateral middle ears are normal. Ossicular chain is intact bilaterally.</span></li>
	<li><span style="font-size:14px">Bilateral external auditory meati are normal.</span></li>
	<li><span style="font-size:14px">Bilateral mastoid air cells are normal. Normal petrous bone.</span></li>
	<li><span style="font-size:14px">Normal visualized PNS.</span></li>
	<li><span style="font-size:14px">Scanned portion of the brain is normal.&nbsp;</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><em>&nbsp;</em><span style="font-size:14px">Normal study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-03-20T17:24:46.960' AS DateTime), 1, CAST(N'2019-01-06T14:09:13.520' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (53, N'Radiology', N'USG - Early Pregnancy', N'USG - Early Pregnancy', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>REPORT OF USG ABDOMEN</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>LIVER</strong>: Normal in size, smooth in outline and shows homogenous echotexture. Echogenicity is normal. No focal lesion seen. Intrahepatic bile ducts are not dilated. Hepatic veins, portal vein and IVC are normal.</span></li>
	<li><span style="font-size:14px"><strong>GALL BLADDER: </strong>Normal in distensibility and wall thickness. No calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>COMMON BILE DUCT: </strong>Normal in luminal diameter. No calculus or SOL seen.</span></li>
	<li><span style="font-size:14px"><strong>PANCREAS</strong>: Normal in size, outline and echotexture. No focal lesion seen. Pancreatic duct is not dilated.</span></li>
	<li><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size, outline and echotexture. No focal lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>KIDNEYS:</strong> Rt- &nbsp; &nbsp; &nbsp; cm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lt- &nbsp; &nbsp;&nbsp; cm</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show smooth and regular outline. Cortical thickness is normal.Parenchymal echogenicity is normal. Corticomedullary differentiation is maintained. No focal lesion. No calculi seen. No hydronephrotic changes.</span></li>
	<li><span style="font-size:14px"><strong>URINARY BLADDER</strong>: Normal in distensibility and wall thickness. Lumen is echofree.</span></li>
	<li><span style="font-size:14px"><strong>UTERUS</strong>: <strong>Gravid uterus with single gestational sac, yolk sac and embryo visualized. CRL = &nbsp;weeks&nbsp; days. Normal cardiac activity. FHR= &nbsp;bpm. </strong></span></li>
	<li><span style="font-size:14px"><strong>ADNEXAE</strong>: Unremarkable.</span></li>
	<li><span style="font-size:14px">No free fluid in the peritoneal cavity. Right iliac fossa is unremarkable.</span></li>
	<li><span style="font-size:14px">No retroperitoneal and mesenteric lymphadenopathy.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Singleton early&nbsp;intrauterine viable pregnancy of 7 weeks&nbsp; days.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-15T16:46:18.487' AS DateTime), 1, CAST(N'2019-01-08T12:59:46.150' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (54, N'Radiology', N'IVU', N'IVU', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>Report of Intravenous Urography</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong><u>FILMS TAKEN: </u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong><u>CONTROL FILM</u>: </strong>No abnormal radioopaque shadow (ROS) seen in KUB region. Psoas shadows, bowel gas patterns and visualised bones are normal.&nbsp; </span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong><u>KIDNEYS: </u></strong>Bilateral kidneys show good and prompt contrast excretion. Both the kidneys are normal in size, outline, position and axis. </span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong><u>PELVICALICEAL SYSTEM</u>: </strong>Simultaneous opacification noted in both sides. No abnormal dilatation, narrowing and filling defect noted in both sides. Cupping pattern of the calyces is maintained. </span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong><u>URETERS</u>: </strong>Bilateral ureters are normal in outline, course and caliber. No abnormal dilatation, narrowing and filling defect noted.</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong><u>URINARY BLADDER</u>: </strong>Normal in distensibility and outline. No abnormal filling defect noted. No abnormal outpouching. Unremarkable post void film.</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal IVU study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-15T16:58:50.060' AS DateTime), 1, CAST(N'2019-01-18T12:08:21.660' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (55, N'Radiology', N'USG - TRUS', N'USG - Transrectal Ultrasound Report (TRUS)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>TRANSRECTAL ULTRASOUND REPORT (TRUS)</u></strong></span></p>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px">Prostate measurements: Height&nbsp;&nbsp; mm; Width&nbsp;&nbsp; mm; Length&nbsp;&nbsp; mm</span></li>
	<li><span style="font-size:14px">Prostate volume:&nbsp;&nbsp;&nbsp; cc.</span></li>
	<li><span style="font-size:14px">Prostatic echotexture appears normal. No abnormal hypoechogenic areas or calcification seen.</span></li>
	<li><span style="font-size:14px">Prostate median lobe: absent. No intraveiscal prostatic protrusion.</span></li>
	<li><span style="font-size:14px">Bilateral seminal vesicals: normal.</span></li>
	<li><span style="font-size:14px">Urinary bladder appears normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>No abnormality detected.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-15T17:39:55.003' AS DateTime), 1, CAST(N'2019-01-07T16:33:59.040' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (56, N'Radiology', N'CT - IVU (female)', N'CT - Urography (Female)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT UROGRAPHY</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5x3mm contiguous plain and contrast enhanced axial sections of the abdomen were obtained from the dome of diaphragm&nbsp; to symphysis pubis.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Right kidney measures&nbsp;&nbsp;&nbsp; cm and is normal in&nbsp;outline and attenuation. &nbsp;Right pelvicalyceal system is normal in outline including normal calyceal cupping pattern. No evidence of calculus or any focal lesion seen in right kidney..</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Left kidney measures&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm&nbsp; and is normal in&nbsp;outline and attenuation. &nbsp;Left pelvicalyceal system is normal in outline including normal calyceal cupping pattern. No evidence of calculus or any focal lesion seen in left kidney.</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show good and prompt excretion of contrast. Normal opacification of bilateral &nbsp;pelvicalyceal system including normal calyceal cupping pattern is noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">B/L ureter is normal in course, outline and caliber. No evidence of any filling defect or outpouching noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bladder is normal in outline and distensibility. No evidence of any calculi noted in lumen of urinary bladder and bilateral vesicoureteric junction region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline with no calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and visualized bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or lymphadenopathy seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>B</strong>/<strong>L adnexa</strong>: Normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal CT urography study.</strong></span></li>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normally excreting bilateral kidneys</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-16T11:47:08.283' AS DateTime), 1, CAST(N'2019-01-06T14:11:52.630' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (57, N'Radiology', N'CT - D Spine', N'CT - Dorsal Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>CT SCAN OF DORSAL SPINE </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>Volumetric plain contiguous axial sections of the lumbar spine were obtained</em></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Position</strong>: Dorsal spine shows normal curvature. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Bony spinal canal</strong>: is normal in AP and Transverse diameters. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Vertebral bodies</strong>: are normal in shape and height. Cortex is normal in thickness. Margins are smooth and sharp. No marginal osteophytes seen. No fracture lines noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Intervertebral disc spaces</strong>: are normal in width and margins. No disc protrusion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Posterior elements</strong>: Neural arches are intact. Facet joints are normal in shape and alignment and they are symmetrical. Spinous processes are normal in shape length and bony structures.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Soft tissues</strong>: pre and paravertebral soft tissues are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal Scan.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-16T18:05:34.867' AS DateTime), 1, CAST(N'2019-01-08T13:28:34.817' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (58, N'Radiology', N'CT - L Spine', N'CT - L Spine', N'<div style="text-align:center"><span style="font-size:20px"><u><strong>CT SCAN OF LUMBER SPINE </strong></u></span></div>

<div style="text-align:center"><span style="font-size:12px">(plain)</span></div>

<div style="text-align:center"><span style="font-size:12px">&nbsp;3x3 mm plain contiguous axial sections of the lumber spine were obtained</span></div>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Position</strong>: Lumbar spine shows normal lordosis. There is no segmental.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Bony spinal canal</strong>: is normal in AP and Transverse diameters. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Vertebral bodies</strong>: are normal in shape and height. Cortex is normal in thickness. Margins are smooth and sharp. No marginal osteophytes seen. No fracture lines noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Intervertebral disc spaces</strong>: are normal in width and margins. No disc protrusion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Posterior elements</strong>: Neural arches are intact. Facet joints are normal in shape and alignment and they are symmetrical. Spinous processes are normal in shape length and bony structures.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Soft tissues</strong>: pre and paravertebral soft tissues are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-16T18:09:07.050' AS DateTime), 1, CAST(N'2019-01-07T16:34:10.260' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (59, N'Radiology', N'CT - Elbow Joints', N'CT - Elbow Joints', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF ELBOW&nbsp;JOINTS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">No fluid collection seen in the elbow joints.</span></li>
	<li><span style="font-size:14px">Normal alignment/congruity of elbow joint forming bones.</span></li>
	<li><span style="font-size:14px">The distal humerus, proximal radius/unla&nbsp; appear normal.</span></li>
	<li><span style="font-size:14px">No fracture seen. No lytic or sclerotic bone lesion.</span></li>
	<li><span style="font-size:14px">Visualized soft tissue structures appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-16T18:23:51.937' AS DateTime), 1, CAST(N'2019-01-07T16:34:19.670' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (60, N'Radiology', N'CT - Ankle Joints', N'CT - Ankle Joints', N'<p style="text-align:center"><span style="font-size:20px"><strong><u>NCCT OF ANKLE JOINTS</u></strong></span></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">No fluid collection seen in the ankle joints.</span></li>
	<li><span style="font-size:14px">Normal alignment/congruity of ankle joint forming bones.</span></li>
	<li><span style="font-size:14px">The distal tibia/fibula,&nbsp;tarsal, meta-tarsals and phalanges appear normal.</span></li>
	<li><span style="font-size:14px">No fracture seen. No lytic or sclerotic bone lesion.</span></li>
	<li><span style="font-size:14px">Visualized soft tissue structures appear normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><em>&nbsp;</em><span style="font-size:14px">Normal study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-04-16T18:26:10.837' AS DateTime), 1, CAST(N'2019-01-07T16:34:28.443' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (61, N'Radiology', N'NEWTESTT', N'NewTestTemplate', N'<p>This is a test template.</p>

<p>So lets check its working condition.</p>
', NULL, NULL, 1, CAST(N'2018-05-16T17:48:56.880' AS DateTime), 1, CAST(N'2019-01-18T12:10:18.160' AS DateTime), 0)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (62, N'Radiology', N'USG - Abd and Pelvis (Male)', N'USG - Abdomen and Pelvis (Male)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>USG REPORT OF ABDOMEN AND PELVIS</strong></u></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Liver</strong>: Liver is normal in size measuring cm (cranio caudal), regular in outline and shows homogenous parenchymal echotexture. No space occupying lesion is seen. Portal vein is normal in caliber. Hepatic veins are normal. Intrahepatic bile ducts are not dilated.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Gall Bladder:</strong> Normal in distensibility. No internal echoes or calculus noted. Normal wall thickness.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Common bile duct:</strong> Normal in caliber. Lumen is echo free.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Pancreas:</strong> Normal in size, outline and homogenous parenchymal echotexture. No SOL seen. Pancreatic duct is not dilated. </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Spleen:</strong> Normal in size measuring &nbsp;cm in long axis. Homogenous echotexture. No SOL seen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Kidneys:</strong> Right &ndash; &nbsp; &nbsp; &nbsp; cm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Left &ndash; &nbsp; &nbsp;&nbsp; cm</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Both kidneys are normal in size, outline and echotexture. Corticomedullary differentiation is maintained. No calculus or SOL seen<strong>.</strong> No hydronephrotic changes seen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No free fluid or enlarged lymph node seen in the abdomen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Urinary bladder:</strong> Urinary bladder is normal in outline, distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Prostate: </strong>Measures approximately cc in volume. Outline is smooth and regular with normal echotexture. No focal lesion seen.&nbsp;</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:&nbsp;</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan of abdomen and pelvis</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T05:59:30.667' AS DateTime), 1, CAST(N'2019-01-08T13:33:21.643' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (63, N'Radiology', N'USG - Abd and Pelvis (Female)', N'USG - Abdomen and Pelvis (Female)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>USG REPORT OF ABDOMEN AND PELVIS</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Liver is normal in size measuring&nbsp;&nbsp; cm (cranio caudal), regular in outline and homogenous parenchymal echotexture. No space occupying lesion is seen. Portal vein is normal in caliber. Hepatic veins are normal. Intrahepatic bile ducts are not dilated.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder:</strong> Normal in distensibility and size. Normal wall thickness. No internal echo or calculus evident.&nbsp;</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Common bile duct:</strong> Normal in caliber. Lumen is echo free.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas:</strong> Normal in size, outline and homogenous parenchymal echotexture. No SOL seen. Pancreatic duct is not dilated.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen:</strong> Normal in size measuring&nbsp;&nbsp; cm in long axis. Homogenous echotexture. No SOL seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Kidneys:</strong> Right -&nbsp; cm&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Left - cm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Both kidneys are normal in size, outline and echotexture. Corticomedullary differentiation is maintained. No SOL or calculus seen. No hydronephrotic changes seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or enlarged lymph node seen in the abdomen.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder:</strong> Urinary bladder is normal in outline, distensibility and wall thickness. No focal lesion or calculus seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus:</strong> Anteverted, measuring cm. Outline is regular. Normal endometrial echocomplex. Endometrial thickness is normal ( mm). No SOL.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Adnexa:</strong> Unremarkable </span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid seen in the POD.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Abdominal and Pelvic scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:01:53.197' AS DateTime), 1, CAST(N'2019-01-08T13:33:38.270' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (64, N'Radiology', N'USG - Neck', N'USG - Neck', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>USG NECK</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:12pt"><span style="font-size:14px"><strong>Both lobes of thyroid and isthmus are normal in size, outline, echotexture and vascularity. No focal lesion is seen.</strong></span></span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral carotid vessel and jugular veins appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral submandibular gland and parotid gland are normal in size, outline and echogenicity. No increase in vascularity is noted. No focal lesions are seen</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Neck muscles are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>No significant lymphadenopathy is noted in bilateral cervical region.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:03:35.500' AS DateTime), 1, CAST(N'2019-01-08T13:33:52.833' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (65, N'Radiology', N'USG - Obs Early Pregnancy', N'USG - Obs Early Pregnancy', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>OBSTETRICAL ULTRASOUND REPORT</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Single intrauterine gestational sac is noted with embryo within showing regular cardiac activity.</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>FHR = &nbsp; &nbsp;&nbsp; bpm.</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Gestational age by:</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>CRL =</strong></span></p>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Single live intrauterine pregnancy of&nbsp;&nbsp; weeks &nbsp;day of gestation. </strong></span></li>
</ul>

<p style="margin-left:0.5in; margin-right:0in"><span style="font-size:14px"><strong>(<em> Advice : anomaly scan at 20- 22 wks of gestation.)</em></strong></span></p>
', NULL, NULL, 1, CAST(N'2018-09-25T06:06:11.637' AS DateTime), 1, CAST(N'2019-01-08T13:34:14.280' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (66, N'Radiology', N'USG - Obs Normal', N'USG - Obs Normal', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>OBSTETRICAL ULTRASOUND REPORT</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Fetus: </strong>Gravid uterus containing a single live fetus seen. Cephalic presentation at the time of examination. Normal fetal movement and regular cardiac activity noted.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Gestational age by:</strong></span></p>

<ul>
	<li><span style="font-size:14px">BPD&nbsp;&nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">&nbsp;&nbsp;HC&nbsp; &nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">&nbsp;&nbsp;AC&nbsp;&nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">&nbsp;&nbsp;FL&nbsp; &nbsp; &nbsp;= &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Estimated fetal body weight =&nbsp;&nbsp;&nbsp; gms.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&nbsp;FHR =&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; bpm</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Placenta: </strong>Attached,&nbsp; anteriorly in upper uterine segment.&nbsp; Normal placental thickness. No retroplacental collection.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Amniotic Fluid:</strong> Adequate amount. AFI =&nbsp;&nbsp; cm</span><span style="font-size:12pt">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Single live intrauterine fetus corresponding to&nbsp;&nbsp;&nbsp;&nbsp; weeks&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; days of gestation.</strong></span></li>
	<li><span style="font-size:14px"><strong>Cephalic presentation.</strong></span></li>
	<li><span style="font-size:14px"><strong>Anterior upper uterine placentation.</strong></span></li>
	<li><span style="font-size:14px"><strong>Normal amniotic fluid volume.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:07:49.567' AS DateTime), 1, CAST(N'2019-01-08T13:34:33.517' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (67, N'Radiology', N'USG - Breast', N'USG - Breast', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>USG REPORT OF BREASTS</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong><u>RT BREAST</u></strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Skin complex and Fat lobules </strong>- Normal.</span></li>
	<li><span style="font-size:14px"><strong>Breast parenchyma</strong>- Homogeneously echogenic.No SOL seen.</span></li>
	<li><span style="font-size:14px"><strong>Mammary ducts</strong>- Normal.</span></li>
	<li><span style="font-size:14px"><strong>Nipple and Periaerolar area </strong>- Normal.</span></li>
	<li><span style="font-size:14px">No enlarged axillary lymph node noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong><u>LT BREAST</u></strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Skin complex and Fat lobules </strong>- <strong>Normal.</strong></span></li>
	<li><span style="font-size:14px"><strong>Breast parenchyma</strong>- Homogeneously echogenic. No SOL seen.</span></li>
	<li><span style="font-size:14px"><strong>Mammary ducts</strong>- <strong>Normal.</strong></span></li>
	<li><span style="font-size:14px"><strong>Nipple and Periaerolar area </strong>- Normal.</span></li>
	<li><span style="font-size:14px">No enlarged axillary lymph node noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION</strong>:</span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan </strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:11:29.010' AS DateTime), 1, CAST(N'2019-01-08T13:34:48.060' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (68, N'Radiology', N'USG - Obs Scan', N'USG - Obs Scan', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>OBSTETRIC SCAN</strong></span></u></p>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px">Single live foetus in the uterine cavity with regular cardiac activity and normal foetal&nbsp; movement. Fetal heart rate is&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; bpm.</span></li>
	<li><span style="font-size:14px">Gestational age by BPD, FL, HC and AC corresponds to &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;..weeks.</span></li>
	<li><span style="font-size:14px">Placenta is</span></li>
	<li><span style="font-size:14px">Liquor volume is adequate. Amniotic fluid index =</span></li>
	<li><span style="font-size:14px">Estimated fetal weight =&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; gms.</span></li>
	<li><span style="font-size:14px">No gross congenital anomaly is detected.</span></li>
	<li><span style="font-size:14px">Presentation is cephalic/breech.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li><span style="font-size:14px"><strong>Singleton live pregnancy of &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;weeks gestation.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:14:39.240' AS DateTime), 1, CAST(N'2019-01-08T13:35:10.120' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (69, N'Radiology', N'USG - Scrotum', N'USG - Scrotum', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>USG SCROTUM</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><u><strong>Testis:</strong></u></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Right:&nbsp;&nbsp; &nbsp;mm&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Left: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mm</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral testis are normal in size, echotexture and vascularity.</span></li>
	<li><span style="font-size:14px"><strong>Epididymal head :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;<br />
	&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Right: &nbsp; &nbsp;&nbsp; mm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp; Left: &nbsp; &nbsp; mm</strong></span></li>
	<li><span style="font-size:14px">Bilateral epididymis are normal in size, echotexture and vascularity-</span></li>
	<li><span style="font-size:14px">No e/o hydrocele.</span></li>
	<li><span style="font-size:14px">No e/o varicocele.</span></li>
	<li><span style="font-size:14px">No e/o mass lesion/ hernia.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:12.0pt"><span style="font-size:16px">IMPRESSION:</span> </span></strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Sca.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:17:27.517' AS DateTime), 1, CAST(N'2019-01-08T13:36:22.313' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (70, N'Radiology', N'USG - Testes', N'USG - Testes', N'<h2 style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>USG SCROTUM</u></strong></span></h2>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Testis :</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Right:&nbsp;&nbsp; &nbsp;mm&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Left: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mm</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral testis are normal in size, echotexture and vascularity.</span></li>
	<li><span style="font-size:14px"><strong>Epididymal head :</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; Right:&nbsp; &nbsp; &nbsp; &nbsp;mm&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp; Left:&nbsp; &nbsp; &nbsp; mm</strong></span></p>

<ul>
	<li><span style="font-size:14px">Bilateral epididymis are normal in size, echotexture and vascularity-</span></li>
	<li><span style="font-size:14px">No e/o hydrocele.</span></li>
	<li><span style="font-size:14px">No e/o varicocele.</span></li>
	<li><span style="font-size:14px">No e/o mass lesion/ hernia.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:21:31.943' AS DateTime), 1, CAST(N'2019-01-08T13:36:43.887' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (71, N'Radiology', N'USG - Thyroid', N'USG - Thyroid', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>USG OF NECK</strong></span></u></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Both lobes of thyroid and isthmus are normal in size, outline, echotexture and vascularity. No focal lesions/ calcifications noted within.</span></li>
	<li><span style="font-size:14px">Adjacent great vessels are normal in course, caliber and outline.</span></li>
	<li><span style="font-size:14px">No evidence of enlarged lymph nodes in neck.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal Study</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:25:55.230' AS DateTime), 1, CAST(N'2019-01-08T13:36:57.357' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (72, N'Radiology', N'USG - TRUS', N'USG - TRUS', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>TRUS</u></strong></span></p>

<p style="text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Approximately 14 x 12 x 11 mm sized mixed ecoic polypoidal lesion is noted in lumen of anal canal/lower rectum. The lesion is attached to the mucosa of rectum. Interface with muscularis mucosa is indistinct. However, adjacent submucosa and muscularis propria are normal. No abnormality seen in peri rectal region. No enlarged perirectal lymph nodes seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Prostate measures approximately 4.6 x 3.7 x 2.6 cm which corresponds to approximately 24 gm weight. Normal zonal differentiation seen. Approximately 7.7 mm diameter cyst is seen in central gland of the prostate. No focal lesion seen in peripheral zone.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Both seminal vesicles are normal in size and echogenicity. No focal lesion seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span><span style="font-size:11pt">&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Polypoidal lesion in lumen of anal canal/lower rectum attached to mucosa and suspicious extension upto muscularis mucosa. No invasion of submucosa and muscularis propria. No perirectal lymph nodes.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:28:24.530' AS DateTime), 1, CAST(N'2019-01-08T13:37:31.157' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (73, N'Radiology', N'USG - Trus', N'USG - Trus', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>TRUS</u></strong></span></p>

<h4 style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></h4>

<ul>
	<li><span style="font-size:14px">Prostate: size&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;..; normal in outline, echotexture. No focal lesion noted. </span></li>
	<li><span style="font-size:14px">Bilateral vas deferens: normal in size, outline and echotexture.</span></li>
	<li><span style="font-size:14px">Bilateral seminal vesicles: normal in size, outline and echotexture.</span></li>
	<li><span style="font-size:14px">Urinary bladder:</span></li>
	<li><span style="font-size:14px">Bilateral vesicoureteric junctions appear normal. No calculi are noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong><u>IMPRESSION:</u></strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:31:53.487' AS DateTime), 1, CAST(N'2019-01-08T13:37:56.213' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (74, N'Radiology', N'USG - TVS', N'USG - TVS', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>Transvaginal Ultrasound </u></strong></span></p>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px"><strong><u>Uterus: </u></strong></span>

	<ul style="list-style-type:circle">
		<li><span style="font-size:14px">Normal in size, morphology and echotexture. Size:</span></li>
		<li><span style="font-size:14px">No focal lesion noted. </span></li>
		<li><span style="font-size:14px">Endometrial echocomplex measures ___</span></li>
	</ul>
	</li>
	<li><span style="font-size:14px"><strong><u>Adnexa: </u></strong></span>
	<ul style="list-style-type:circle">
		<li><span style="font-size:14px">Normal in size, morphology and echotexture. </span></li>
		<li><span style="font-size:14px">No focal lesion is noted.&nbsp;</span></li>
	</ul>
	</li>
	<li><span style="font-size:14px"><strong><u>POD:</u></strong></span></li>
	<li style="list-style-type:none">
	<ul style="list-style-type:circle">
		<li><span style="font-size:14px">No collection noted. </span></li>
	</ul>
	</li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal Study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:35:49.103' AS DateTime), 1, CAST(N'2019-01-08T13:38:14.170' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (75, N'Radiology', N'USG - Twin Obs', N'USG - Twin Obs', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>OBSTETRICAL ULTRASOUND REPORT</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong> </span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Gravid uterus containing two live fetuses seen. </span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>TWIN A (in Maternal right) - </strong>Cephalic presentation at the time of examination. Normal fetal movement and regular cardiac activity noted.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Gestational age by:</strong></span></p>

<ul>
	<li><span style="font-size:14px">BPD&nbsp;&nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">HC &nbsp; &nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">AC &nbsp; &nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">FL &nbsp; &nbsp; &nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Estimated fetal body weight =&nbsp;&nbsp;&nbsp; gms.</span></p>

<ul>
	<li><span style="font-size:14px"><strong>FHR =&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; bpm</strong></span></li>
	<li><span style="font-size:14px"><strong>EFW =&nbsp;&nbsp;&nbsp;&nbsp; gms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Placenta: </strong>Attached, posteriorly in fundus.&nbsp; Normal placental thickness. No retroplacental collection.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>TWIN-B (in Maternal left)- </strong>Cephalic presentation at the time of examination. Normal fetal movement and regular cardiac activity noted.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Gestational age by:</strong></span></p>

<ul>
	<li><span style="font-size:14px">BPD&nbsp;&nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">HC &nbsp; &nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">AC &nbsp; &nbsp;&nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day.</span></li>
	<li><span style="font-size:14px">FL &nbsp; &nbsp; &nbsp; = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm = &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; weeks &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; day. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Estimated fetal body weight =&nbsp;&nbsp;&nbsp; gms.</span></p>

<ul>
	<li><span style="font-size:14px"><strong>FHR =&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;bpm</strong></span></li>
	<li><span style="font-size:14px"><strong>EFW =&nbsp;&nbsp;&nbsp;&nbsp; gms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Placenta: </strong>Attached in upper anterior segment.&nbsp; Normal placental thickness. No retroplacental collection.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Amniotic Fluid:</strong> Adequate amount. <strong>AFI =&nbsp;&nbsp; cm</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>Dichorionic diamniotic live twin pregnancy.</strong></span></li>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>Twin A (Maternal right):​​​​​​​</strong></span>&nbsp;</li>
</ul>

<ol>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>&nbsp; &nbsp;weeks&nbsp; &nbsp;days of gestation,</strong></span></li>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>Cephalic presentation,</strong></span></li>
</ol>

<ul>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>&nbsp;Twin B (Maternal left): &nbsp;</strong></span></li>
</ul>

<ol>
	<li><span style="font-size:14px"><strong>&nbsp; &nbsp;weeks&nbsp; &nbsp; days of gestation,</strong></span></li>
	<li><span style="font-size:14px"><strong>Cephalic presentation, </strong></span></li>
</ol>

<ul>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>Upper anterior placentation. </strong></span></li>
	<li style="margin-left: 0in; margin-right: 0in;"><span style="font-size:14px"><strong>Normal amniotic fluid volume.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-09-25T06:37:25.317' AS DateTime), 1, CAST(N'2019-01-04T16:11:29.363' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (76, N'Radiology', N'X-Ray - Chest', N'X-Ray - Chest', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X &ndash; Ray Report</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:16px"><strong>Chest PA view</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li><span style="font-size:14px">Both the lung fields are clear. Normal bronchovascular pattern in seen bilaterally.</span></li>
	<li><span style="font-size:14px">The cardiothoracic ratio is normal.</span></li>
	<li><span style="font-size:14px">The apices, costo and cardiophrenic angles are free.</span></li>
	<li><span style="font-size:14px">The cardio vascular shadow and hila shows no abnormal feature. </span></li>
	<li><span style="font-size:14px">The bony thorax shows no significant abnormality.</span></li>
	<li><span style="font-size:14px">The domes of diaphragm are well delineated. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Chest X-ray.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:41:05.887' AS DateTime), 1, CAST(N'2019-01-11T12:23:58.563' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (77, N'Radiology', N'X-Ray - Hand', N'X-Ray - Hand', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Hand &ndash; AP &amp; Oblique Views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal bone density.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Lower ends of radius, ulna, all the carpal bones, metacarpal bones and phalanges show normal outlines and alignment. No fracture seen in the visible bones. No focal lytic or sclerotic lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Joint spaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in soft tissues.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:43:31.930' AS DateTime), 1, CAST(N'2019-01-08T13:40:15.940' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (78, N'Radiology', N'X-Ray - Ankle Joint', N'X-Ray - Ankle Joint', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Right/Left Ankle &ndash;AP &amp; Lateral Views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal bone density.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible bones including lower part of tibia, fibula and tarsal bones are normal. No fracture, focal lytic or sclerotic lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible joints including ankle and subtalar joints are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No osteochondral defect seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissue is normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><strong><span style="font-size:14px">Normal Study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:45:48.573' AS DateTime), 1, CAST(N'2019-01-08T13:40:59.830' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (79, N'Radiology', N'X-Ray - Cervical Spine', N'X-Ray - Cervical Spine', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Cervical Spine - &nbsp;AP &amp; Lateral views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal bone density.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal alignment outlines and height of vertebrae noted. No focal lytic or sclerotic lesion seen. Posterior elements are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal height of intervertebral discs seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Atlanto-axial joint is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No significant degenerative changes seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in pre and paravertebral soft tissues.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><strong><span style="font-size:14px">Normal Study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:48:56.467' AS DateTime), 1, CAST(N'2019-01-08T13:41:40.877' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (80, N'Radiology', N'X-Ray - Dorsal Spine', N'X-Ray - Dorsal Spine', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Dorsal Spine - &nbsp;AP &amp; Lateral views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal bone density.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal alignment, outlines and height of vertebrae noted. No focal lytic or sclerotic lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal height of intervertebral discs seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No other abnormality seen in paravertebral soft tissues.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:49:50.560' AS DateTime), 1, CAST(N'2019-01-08T13:42:22.070' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (81, N'Radiology', N'X-Ray - Knee', N'X-Ray - Knee', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Left knee &ndash; AP &amp; Lateral views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bone density is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal outlines of visible bones. No focal lytic or sclerotic lesion is seen in the bones.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Joint spaces are maintained. No marginal osteophytes seen. Articular surfaces are regular. No subchondral lucency seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in soft tissues.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:54:49.907' AS DateTime), 1, CAST(N'2019-01-08T13:43:01.543' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (82, N'Radiology', N'X-Ray - L-S Spine', N'X-Ray - L-S Spine', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Lumbo-Sacral Spine - &nbsp;AP &amp; Lateral views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal bone density.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal alignment outlines and height of vertebrae noted. No focal lytic or sclerotic lesion seen. Posterior elements are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal height of intervertebral discs seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in paravertebral soft tissues.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Sclerotic changes seen in bilateral sacroiliac joints with blurring of the joint margin and loss of joint space. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Bilateral symmetrical sacroilitis. </strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:56:24.813' AS DateTime), 1, CAST(N'2019-01-08T13:43:45.893' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (83, N'Radiology', N'X-Ray - Pelvis', N'X-Ray - Pelvis', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Pelvis- AP &amp;&nbsp; Left Hip Lateral views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal bone density.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal outlines of pelvic bones and femur. No focal lytic or sclerotic lesion seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Both hip joints are normal with normal articular surfaces of femur and acetabulum.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Both SI joints are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in soft tissues.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:58:18.637' AS DateTime), 1, CAST(N'2019-01-08T13:44:21.467' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (84, N'Radiology', N'X-Ray - PNS', N'X-Ray - PNS', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ay PNS - OM view</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">All the visible paranasal sinuses are normal. No opacity is seen in the sinuses.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bony sinus walls are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Other visible bones are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T06:59:09.073' AS DateTime), 1, CAST(N'2019-01-08T13:45:02.537' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (85, N'Radiology', N'X-Ray - Neck', N'X-Ray - Neck', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray Soft Tissue Neck- AP &amp; Lateral views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissue structures of neck including epiglottis, aeryepiglottic folds, ventricle and vocal cord area are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Prevertebral soft tissue is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No obvious mass is seen in the region of thyroid.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Trachea and laryngeal airway appear normal. No tracheal narrowing or displacement seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in cervical spine.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T07:02:24.260' AS DateTime), 1, CAST(N'2019-01-08T13:45:37.360' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (86, N'Radiology', N'X-Ray - Elbow', N'X-Ray - Elbow', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>X-ray of Elbow&ndash;AP &amp; Lateral Views</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bone density is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal alignment of the bones seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Lower part of humerus, upper parts of radius and ulna show normal outlines and density. No focal lytic or sclerotic lesion seen. No fracture noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Elbow joint space is normal. Articular surfaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in soft tissues.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T07:04:37.020' AS DateTime), 1, CAST(N'2019-01-08T13:46:17.067' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (87, N'Radiology', N'CECT - Abdomen and Pelvis (M)', N'CECT - Abdomen and Pelvis (Male)', N'<div style="margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ABDOMEN AND PELVIS</u></strong></span></div>

<div style="margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous &nbsp;axial sections of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prostate</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T22:02:31.847' AS DateTime), 1, CAST(N'2019-01-08T13:46:33.167' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (88, N'Radiology', N'CECT - Abdomen and Pelvis (F)', N'CECT - Abdomen and Pelvis (Female)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ABDOMEN AND PELVIS </u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous &nbsp;axial sections of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Bilateral kidneys</strong>: Normal in size, outline, attenuation. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">B/<strong>L </strong>adnexa: Normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T22:44:10.827' AS DateTime), 1, CAST(N'2019-01-08T13:46:55.653' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (89, N'Radiology', N'CECT - Chest and Abdomen (F)', N'CECT - Chest and Abdomen (Female)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF NECK, CHEST AND ABDOMEN</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous plain and contrast enhanced axial&nbsp; sections from the base of skull to pubic symphysis</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in chest</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Mediastinum</strong>: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Chest wall</strong>: Bilaterally Symmetrical and normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in abdomen: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesions seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal</strong> <strong>vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation &amp; show prompt excretion of contrast. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or enlarged lymphnodes seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>B/L adnexa</strong>: Normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T23:27:42.603' AS DateTime), 1, CAST(N'2019-01-08T13:47:26.100' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (90, N'Radiology', N'CECT - Chest and Abdomen (M)', N'CECT - Chest and Abdomen (Male)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF NECK, CHEST AND ABDOMEN</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous&nbsp;sections from the base of skull to pubic symphysis</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in chest</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Mediastinum</strong>: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Chest wall</strong>: Bilaterally Symmetrical and normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in abdomen: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal</strong> <strong>vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation &amp; show prompt excretion of contrast. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or enlarged lymphnodes seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prostate</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong><strong>Normal findings.</strong></strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T23:30:55.887' AS DateTime), 1, CAST(N'2019-01-08T13:47:41.470' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (91, N'Radiology', N'CECT - Chest', N'CECT - Chest', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF CHEST</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volume plain and contrast enhancedaxial sections of the chest were obtained from the lung apices to upper abdomen.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted.</span></li>
	<li><span style="font-size:14px"><strong>Mediastinum</strong>: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen. </span></li>
	<li><span style="font-size:14px"><strong>Chest wall</strong>: Bilaterally Symmetrical and normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible abdominal organs are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-09-25T23:32:43.957' AS DateTime), 1, CAST(N'2019-01-08T13:47:59.470' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (92, N'Radiology', N'CECT - Head And Neck', N'CECT - Head And Neck', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF HEAD AND NECK</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Plain and contrast enhanced axial sections of the head were obtained from the level of vertex to aortic arch level.</span></div>

<p><span style="font-size:16px"><strong>Findings in head:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Head size</strong>: Normal</span></li>
	<li><span style="font-size:14px"><strong>Calvarium</strong>: Normal</span></li>
	<li><span style="font-size:14px"><strong>Extraaxial lesion</strong>: Absent</span></li>
	<li><span style="font-size:14px"><strong>Cerebral Hemispheres</strong>: Symmetrical</span></li>
	<li><span style="font-size:14px"><strong>Midline shift</strong>: Absent</span></li>
	<li><span style="font-size:14px"><strong>Ventricles and cisterns</strong>: Symmetrical&nbsp;</span></li>
	<li><span style="font-size:14px"><strong>Lateral ventricles</strong>: Normal</span></li>
	<li><span style="font-size:14px"><strong>Third and Fourth ventricles</strong>: Normal</span></li>
	<li><span style="font-size:14px"><strong>Basal ganglia/ Internal capsule</strong>: Normal</span></li>
	<li><span style="font-size:14px"><strong>Focal lesion </strong>Absent</span></li>
	<li><span style="font-size:14px"><strong>Brain stem</strong>: Focal lesion Absent</span></li>
	<li><span style="font-size:14px"><strong>Cerebellum</strong>: &nbsp;Symmetrical</span></li>
	<li><span style="font-size:14px"><strong>Focal lesion</strong>: Absent&nbsp;</span></li>
	<li><span style="font-size:14px">No<strong> </strong>abnormal enhancement of brain or meninges noted.</span></li>
</ul>

<p><span style="font-size:16px"><strong>Findings in neck:</strong></span></p>

<ul>
	<li><span style="font-size:14px">B/l parapharyngeal, retropharyngeal, masticator, parotid&amp; carotid spaces are normal.</span></li>
	<li><span style="font-size:14px">Soft tissues of the neck are normal. &nbsp;&nbsp;</span></li>
	<li><span style="font-size:14px">Bilateral carotid arteries are normal in course, caliber and outline.</span></li>
	<li><span style="font-size:14px">Trachea is central. Laryngeal cartilages are normal. B/L pyriform sinuses are normal. B/l thyroid lobes are normal.</span></li>
	<li><span style="font-size:14px">Visible bones are normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:&nbsp;</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings in head and neck.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T10:51:14.550' AS DateTime), 1, CAST(N'2019-01-08T13:48:41.753' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (94, N'Radiology', N'CECT - Head', N'CECT - Head', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px">&nbsp;<strong><u>CT SCAN OF HEAD</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and ontrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">plain and contrast enhanced axial sections of the head were obtained from the level of the base of the skull to the vertex. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Head size</strong>: Normal&nbsp;</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Calvarium</strong>: Normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Extraaxial lesion</strong>: Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cerebral Hemispheres</strong>: Symmetrical</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Midline shift</strong>: Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Ventricles and cisterns</strong>: Symmetrical&nbsp;</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Lateral ventricles</strong>: Normal</span></li>
		<li style="text-align:justify"><span style="font-size:14px"><strong>Third and Fourth ventricles</strong>: Normal</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Basal ganglia/ Internal capsule</strong>: Normal </span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Focal lesion</strong>: Absent</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Brain stemm</strong>: Focal lesion Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cerebellum </strong>:&nbsp; Symmetrical</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Focal lesion </strong>: Absent</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormal enhancement of brain or meninges noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:07:07.910' AS DateTime), 1, CAST(N'2019-01-08T13:49:04.157' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (95, N'Radiology', N'CECT - Neck , Chest and Abdome', N'CECT - Neck , Chest and Abdomen (f)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF NECK, CHEST AND ABDOMEN</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous plain and contrast enhanced axial sections from the base of skull to pubic symphysis</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in neck and chest</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">B/l parapharyngeal, retropharyngeal, masticator ,parotid&amp; carotid spaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissues of the neck are normal.&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral carotid arteries are normal in course, caliber and outline.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Trachea is central. Laryngeal cartilages are normal. B/L pyriform sinuses are normal. B/L thyroid lobes are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Mediastinum: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Chest wall: Bilaterally Symmetrical and normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in abdomen: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesions seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation &amp; show prompt excretion of contrast. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or enlarged lymphnodes seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>B/L</strong> <strong>adnexa</strong>: Normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:10:49.463' AS DateTime), 1, CAST(N'2019-01-08T13:49:28.357' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (96, N'Radiology', N'CECT-Neck,Chest and Abdomen(m)', N'CECT - Neck , Chest and Abdomen (m)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF NECK, CHEST AND ABDOMEN</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous plain and contrast enhanced axial sections from the base of skull to pubic symphysis</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in neck and chest</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">B/l parapharyngeal, retropharyngeal, masticator ,parotid&amp; carotid spaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissues of the neck are normal.&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral carotid arteries are normal in course, caliber and outline.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Trachea is central. Laryngeal cartilages are normal. B/L pyriform sinuses are normal. B/L thyroid lobes are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Mediastinum: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Chest wall: Bilaterally Symmetrical and normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings in abdomen: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation &amp; show prompt excretion of contrast. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or enlarged lymphnodes seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prostate</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:14:17.097' AS DateTime), 1, CAST(N'2019-01-08T13:49:53.637' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (97, N'Radiology', N'CECT - Neck', N'CECT - Neck', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF NECK</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5X5 mm contiguous plain and contrast enhanced axial sections from the base of skull to aortic arch level.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral parapharyngeal, masticator and parotid spaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissues of the neck are normal.&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral carotid arteries are normal in course, caliber and outline.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Trachea is central. Laryngeal cartilages are normal. Bilateral pyriform sinuses are normal. Bilateral thyroid lobes are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible bones are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><span style="font-size:16px"><strong>IMPRESSION</strong>:&nbsp;</span></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:16:11.507' AS DateTime), 1, CAST(N'2019-01-08T13:50:14.873' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (98, N'Radiology', N'CECT - PNS', N'CECT - PNS', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF PARANASAL SINUSES</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">3X3 mm contiguous plain and contrast axial and coronal sections of nose and paranasal sinuses were obtained. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">All the paranasal sinuses appear normal in outline and show normal aeration. No soft tissue density noted within. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ostiomeatal complexes are normal bilaterally. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Turbinates appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No bony lesion seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Study</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:18:23.063' AS DateTime), 1, CAST(N'2019-01-08T13:50:33.927' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (99, N'Radiology', N'CT - Abdomen (f)', N'CT - Abdomen (female) (plain)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ABDOMEN</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous plain axial sections of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis .</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>B/L adnexa</strong>: Normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>

<p>&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-12-26T11:32:20.737' AS DateTime), 1, CAST(N'2019-01-06T15:23:25.103' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (100, N'Radiology', N'CT - Abdomen (m)', N'CT - Abdomen (m)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ABDOMEN</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous plain axial sections of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesions seen. Hepatic veins and IVC are normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall</strong> <strong>Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Pancreas: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or enlarged lymphnodes seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymphnodes seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and distensibility. Wall thickness is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prostate</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:34:19.033' AS DateTime), 1, CAST(N'2019-01-06T15:24:24.297' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (101, N'Radiology', N'CT - Angiogram Abdomen', N'CT - Angiogram Abdoment', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT ANGIOGRAM OF ABDOMEN AND CECT ABDOMEN</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Abdominal aorta appears normal in course, caliber and outline. Branches of abdominal aorta including celiac axis, superior mesenteric and inferior mesenteric arteries are normal in course, caliber and outline. No filling defect or abnormal narrowing or dilatation noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and visible bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T11:36:20.623' AS DateTime), 1, CAST(N'2019-01-06T15:25:11.090' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (102, N'Radiology', N'CT - Angiogram Cerebral', N'CT - Angiogram Cerebral', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><u>CT CEREBRAL ANGIOGRAM</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-12-26T12:03:10.377' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (103, N'Radiology', N'CT - Angiogram Neck', N'CT - Angiogram Neck', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT ANGIOGRAM OF NECK</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Both common, internal and external carotid arteries are normal in course, caliber and outline .No filling defect and outpouching noted along the course of the above mentioned vessels.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">B/L ACA, MCA, PCA, Anterior communicating arteries, Posterior communicating arteries are normal in course, caliber and outline. No Abnormal vessels seen. No filling defect and outpouching noted along the course of the above mentioned vessels.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal CT angiogram.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:12:25.130' AS DateTime), 1, CAST(N'2019-01-06T16:58:47.863' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (104, N'Radiology', N'CT - Angiogram Pulmonary', N'CT - Angiogram Pulmonary', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CECT PULMONARY ANGIOGRAPHY</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volume scan of the chest were obtained from the lung apices to upper abdomen.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Pulmonary trunk, right and left main pulmonary arteries and their branches are normal in course, outlines caliber and branching pattern. They show normal enhancement. No intraluminal filling defect seen. No abnormal narrowing or dilatation seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lungs are normal in aeration, bronchovascular markings and attenuation pattern. No mass lesion noted.</span></li>
	<li><span style="font-size:14px"><strong>Mediastinum</strong>: Trachea is central. Carinal bifuration is normal. Cardiac shadow and major vessels are normal. No lymphadenopathy seen. </span></li>
	<li><span style="font-size:14px">No pleural thickening or effusion seen.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Chest wall</strong>: Bilaterally Symmetrical and normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible abdominal organs are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal CT pulmonary angiography.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:13:31.047' AS DateTime), 1, CAST(N'2019-01-08T13:52:08.733' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (105, N'Radiology', N'CT - Angiogram Renal', N'CT - Angiogram Renal', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT Renal Angiography</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Both kidneys are normal in size, shape, outline, position, lie &amp; axis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>LEFT KIDNEY:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Left kidney measures &nbsp;&nbsp;<strong>98.8 mm</strong>. There are no renal masses, calculi or hydronephrosis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Vasculature:</strong></span>
	<ul>
		<li style="text-align:justify"><span style="font-size:14px">Number of left renal arteries: <strong>1 </strong>with diameter of&nbsp;&nbsp; <strong>6.6 mm</strong>.</span>
		<ul style="list-style-type:circle">
			<li style="text-align:justify"><span style="font-size:14px">Distance between the left renal arterial origin and the first segmentary bifurcation: 27.8<strong> mm</strong></span></li>
			<li style="text-align:justify"><span style="font-size:14px"><strong>Accessory Renal Arteries</strong>: None</span></li>
		</ul>
		</li>
		<li style="text-align:justify"><span style="font-size:14px">No of left&nbsp; renal veins: 1.</span></li>
		<li style="text-align:justify"><span style="font-size:14px">Course of left renal vein: pre-aortic</span></li>
		<li style="text-align:justify"><span style="font-size:14px">Distance between the segmentary confluence of the left renal vein and SMA: <strong>43.5&nbsp; mm</strong></span></li>
		<li style="text-align:justify"><span style="font-size:14px">Distance between the confluence of the left renal vein and the left margin of the aorta: <strong>23.7 mm</strong>.</span></li>
	</ul>
	</li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>RIGHT KIDNEY:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Right kidney measures <strong>81.3</strong> mm. There are no renal masses, calculi or hydronephrosis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Vasculature:</strong></span>
	<ul>
		<li style="text-align:justify"><span style="font-size:14px">Number of right renal arteries<strong>: 1</strong> with diameter of <strong>7.6 </strong>mm<strong>.</strong></span>
		<ul style="list-style-type:circle">
			<li style="text-align:justify"><span style="font-size:14px">Distance between the right arterial origin and the first segmentary bifurcation: <strong>40.8 mm.</strong></span></li>
			<li style="text-align:justify"><span style="font-size:14px">Distance between the right IVC margin and the first segmentary bifurcation: 1<strong>4.1 mm.</strong></span></li>
		</ul>
		</li>
		<li style="text-align:justify"><span style="font-size:14px"><strong>Accessory Renal Arteries</strong>:<strong> </strong>None</span></li>
		<li style="text-align:justify"><span style="font-size:14px">No of right&nbsp; renal veins: 1</span></li>
		<li style="text-align:justify"><span style="font-size:14px">Distance between the segmentary confluence of the right renal vein and IVC: <strong>11.9 mm</strong>.</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Collecting systems:</strong> Bilateral pelvicalyceal systems are normal in outline including normal calyceal cupping pattern. No duplication noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The celiac, SMA and IMA are patent. The common, internal and external iliac arteries are patent.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The IVC is normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Retroverted uterus is noted.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Moderate amount of free fluid in pouch of Douglas.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong> </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Single left renal artery with single left renal vein. </strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Single right renal artery with single right renal vein</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>No hydronephrosis, renal mass or calculus in bilateral kidneys.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Otherwise unremarkable CT abdomen and pelvis.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:19:06.937' AS DateTime), 1, CAST(N'2019-01-08T13:52:46.810' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (106, N'Radiology', N'CT - Angiogram UL', N'CT - Angiogram Upper Limb', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT ANGIOGRAM UPPER LIMB</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:20:40.927' AS DateTime), 1, CAST(N'2019-01-08T13:53:32.130' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (107, N'Radiology', N'CT - Ankle', N'CT - Ankle', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ANKLE</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">2x2mm contiguous axial &amp; coronal plain sections of temporal bones were obtained.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>The bones comprising the ankle present a normal configuration.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:22:04.757' AS DateTime), 1, CAST(N'2019-01-08T13:53:46.383' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (108, N'Radiology', N'CT - Aortogram', N'CT - Aortogram Format', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT AORTOGRAM </u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Ascending aorta, descending thoracic aorta and their branches are normal in course caliber and outline with normal contrast opacification.</strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid black 1.0pt; margin-left:.2in; width:436.5pt">
	<tbody>
		<tr>
			<td style="border-color:black; height:14.05pt; vertical-align:top; width:153.0pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Aortic annulus</strong></span></p>
			</td>
			<td style="border-color:black; height:14.05pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="border-color:black; height:14.05pt; vertical-align:top; width:175.5pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Just proximal to Innominate artery</strong></span></p>
			</td>
			<td style="border-color:black; height:14.05pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:14.05pt; vertical-align:top; width:153.0pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Sinus of valsalva</strong></span></p>
			</td>
			<td style="height:14.05pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="height:14.05pt; vertical-align:top; width:175.5pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Descending aorta</strong></span></p>
			</td>
			<td style="height:14.05pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:28.05pt; vertical-align:top; width:153.0pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Sinotubular junction</strong></span></p>
			</td>
			<td style="height:28.05pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="height:28.05pt; vertical-align:top; width:175.5pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Suprarenal abdominal aorta</strong></span></p>
			</td>
			<td style="height:28.05pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:30.15pt; vertical-align:top; width:153.0pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Tubular ascending aorta</strong></span></p>
			</td>
			<td style="height:30.15pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="height:30.15pt; vertical-align:top; width:175.5pt">
			<p style="margin-left:40px; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Infrarenal abdominal aorta&nbsp;</strong></span></p>
			</td>
			<td style="height:30.15pt; vertical-align:top; width:.75in">
			<p style="margin-left:0.5in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0.5in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>&nbsp;</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:24:47.957' AS DateTime), 1, CAST(N'2019-01-06T17:09:33.133' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (109, N'Radiology', N'CT - Cerebral Angio/Venogram', N'CT - Cerebral Angiogram and Venogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT CEREBRAL ANGIOGRAM AND VENOGRAM </u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">B/L ACA, MCA, PCA, Anterior communicating arteries, Posterior communicating arteries are normal in course, caliber and outline. No Abnormal vessels seen. No filling defect and outpouching noted along the course of the above mentioned vessels.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Superior sagittal sinus, infra sagittal sinus, straight sinus, bilateral transverse sinus, bilateral sigmoid sinus, bilateral internal cerebral vein are normal in course, caliber and outline and show normal contrast opacification. No thrombus is noted within their lumen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal CT of cerebral arteries and veins.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:27:52.343' AS DateTime), 1, CAST(N'2019-01-06T17:10:01.327' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (110, N'Radiology', N'CT - Cisternography', N'CT - Cisternography', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT CISTERNOGRAPHY</u></strong></span></p>

<div style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Procedure: </strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:justify"><strong><span style="font-size:14px">Under aseptic precaution and local anesthesia lumbar puncture was done and approximately 10 ml of low osmolar contrast was given and thin coronal section of PNS was taken.</span></strong></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Cribriform plate is normal and no defect noted. No leakage of the contrast and focal accumulation in the ethmoidal region. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">All the paranasal sinuses appear normal in outline and show normal aeration. No soft tissue density noted within. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Osteomeatal complexes are normal bilaterally. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Turbinates appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No bony lesion seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: &nbsp;</span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Cisternography findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:32:55.763' AS DateTime), 1, CAST(N'2019-01-08T13:59:19.970' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (111, N'Radiology', N'CT - C-Spine', N'CT - C Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>CT SCAN OF CERVICAL SPINE </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>3x3 mm plain contiguous axial sections of the cervical spine were obtained</em></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bony alignment is normal. No evidence of fracture of cervical spine or soft tissue swelling is noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Atlanto-dental interval appears normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">All of vertebral bodies and posterior elements &nbsp;are normal in shape and height. Cortex is normal in thickness. Margins are smooth and sharp. No marginal osteophytes seen. No fracture lines noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Soft tissues: pre and para vertebral soft tissues are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>&nbsp;Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:35:45.967' AS DateTime), 1, CAST(N'2019-01-08T13:59:50.173' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (112, N'Radiology', N'CT - DL Spine', N'CT - Dorsal and Lumbar Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF DORSAL &amp; LUMBAR SPINE </u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric plain contiguous axial sections of the dorsal and lumbar spine were obtained</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Position</strong>: Dorsal and lumbar spine shows normal curvature. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Bony spinal canal</strong>: is normal in AP and Transverse diameters. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Vertebral bodies</strong>: are normal in shape and height. Cortex is normal in thickness. Margins are smooth and sharp. No marginal osteophytes seen. No fracture lines noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Intervertebral disc spaces</strong>: are normal in width and margins. No disc protrusion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Posterior elements</strong>: Neural arches are intact. Facet joints are normal in shape and alignment and they are symmetrical. Spinous processes are normal in shape length and bony structures.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Soft tissues</strong>: pre and paravertebral soft tissues are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:40:14.453' AS DateTime), 1, CAST(N'2019-01-08T14:00:22.353' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (113, N'Radiology', N'CT - Elbow', N'CT - Elbow', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ELBOW</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Joint space is normal. No evidence of joint effusion.</span></li>
	<li><span style="font-size:14px">Articular cartilages and subchondral bones are normal.</span></li>
	<li><span style="font-size:14px">No e/o marrow edema.</span></li>
	<li><span style="font-size:14px">Para-articular soft tissues are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: &nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-12-26T12:44:18.680' AS DateTime), 1, CAST(N'2019-01-06T17:33:54.643' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (114, N'Radiology', N'CT - Enterography', N'CT - Enterography', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT ENTEROGRAPHY</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:11px">Volumetric contiguous plain and contrast enhanced axial sections of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis along with oral and iv contrast.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation &amp; show prompt excretion of contrast. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Urinary</strong> <strong>bladder</strong>: Normal in outline and distensibility. Wall thickness is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prostate</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:46:16.753' AS DateTime), 1, CAST(N'2019-01-07T14:20:45.637' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (117, N'Radiology', N'CT - Femur', N'CT - Femur', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT Left Distal Femur and Knee Joint</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">2X10mm noncontiguous axial sections of the chest were obtained from the lung apices to the bases.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li><span style="font-size:14px">The &nbsp;bones comprising the knee joint show normal configuration and position. The cortex shows smooth contours and normal thickness with no evidence of focal lesion. </span></li>
	<li><span style="font-size:14px">The soft tissues surrounding the knee joint are unremarkable.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal Study </strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:55:00.720' AS DateTime), 1, CAST(N'2019-01-06T17:35:38.513' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (118, N'Radiology', N'CT - Foot', N'CT - Foot', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF BILATERAL &nbsp;FOOT</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">2x2mm contiguous axial &amp; coronal plain sections of temporal bones were obtained.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Visible parts of distal part of tibia, fibula, tarsal&#39;s and metatarsals appear normal in morphology, outline and density.</span></li>
	<li><span style="font-size:14px">Joint spaces between visible bones appear normal.</span></li>
	<li><span style="font-size:14px">Soft tissues appear normal.</span></li>
	<li><span style="font-size:14px">No e/o fracture or focal lesion noted in bones of foot.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings in foot</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T12:57:54.757' AS DateTime), 1, CAST(N'2019-01-08T14:03:40.587' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (119, N'Radiology', N'CT - Hip', N'CT - Left Hip', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF LEFT HIP</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">The femoral head and acetabulum are of normal shape and femoral head is well covered by acetabular margins. The joint space is of normal width. No fracture noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The articular surface is smooth and congruent and show normal cortical thickness. No marginal osteophytes noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Each femoral shaft is normal with no evidence of fracture.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The sacroiliac joints are normally shaped with normal development of the sacrum and iliac wings and a normal-appearing lumbosacral junction. The joint space is of normal width on both sides. The joint contours are smooth and sharply defined. The muscles and the imaged organs of the lesser pelvis show no abnormalities. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><span style="font-size:16px"><strong>IMPRESSION</strong></span>: </span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal Study</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T13:20:48.627' AS DateTime), 1, CAST(N'2019-01-08T14:03:59.153' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (120, N'Radiology', N'CT - IVU (male)', N'CT - Urography (male)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT UROGRAPHY</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5x3mm contiguous &nbsp;axial sections of the abdomen were obtained from the dome of diaphragm&nbsp; to symphysis pubis.</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong> </span></p>

<ul>
	<li><span style="font-size:14px">Right kidney measures &nbsp;cm and is normal in&nbsp;outline and attenuation. &nbsp;Right pelvicalyceal system is normal in outline including normal calyceal cupping pattern. No evidence of calculus or any focal lesion seen in right kidney.</span></li>
	<li><span style="font-size:14px">Left kidney measures&nbsp; cm and is normal in&nbsp;outline and attenuation. &nbsp;Left pelvicalyceal system is normal in outline including normal calyceal cupping pattern. No evidence of calculus or any focal lesion seen in left kidney.</span></li>
	<li><span style="font-size:14px">Bilateral kidneys show good and prompt excretion of contrast. Normal opacification of bilateral &nbsp;pelvicalyceal system including normal calyceal cupping pattern is noted. </span></li>
	<li><span style="font-size:14px">B/L ureter is normal in course, outline and caliber. No evidence of any filling defect or outpouching noted.</span></li>
	<li><span style="font-size:14px">Bladder is normal in outline and distensibility. No evidence of any calculi noted in lumen of urinary bladder and bilateral vesicoureteric junction region</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline with no calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal</strong> <strong>vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and visualized bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or lymphadenopathy seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prostate</strong>: Normal in size, outline and attenuation. No focal lesion is seen.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:00:23.147' AS DateTime), 1, CAST(N'2019-01-08T14:04:16.897' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (121, N'Radiology', N'CT - Knee', N'CT - Knee', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF LEFT KNEE</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">The femoral condyles and tibial plateau are of normal. The joint space is of normal width. No fracture noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The articular surface is smooth and congruent and show normal cortical thickness. No marginal osteophytes noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:02:20.360' AS DateTime), 1, CAST(N'2019-01-08T14:04:31.773' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (122, N'Radiology', N'CT - Lower Limb', N'CT - Lower Limb', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF LEFT LOWER LIMB</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5x3mm contiguous plain axial sections were obtained from lower thigh upto mid leg of left lower limb</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">There is a well defined, round, hypodense lesion with central hyperdense nodule and surrounding bony sclerosis noted in the lower femoral metaphysis. The bony sclerosis is more marked anteriorly and laterally. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">The overlying bony cortex is intact. No soft tissue swelling. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Rest of the visible bones show normal outline, alignment and density. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Knee joint space appears normal. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Findings s/o</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:08:16.060' AS DateTime), 1, CAST(N'2019-01-08T14:04:55.010' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (123, N'Radiology', N'CT - Lumbar Spine', N'CT - Lumbar Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>CT SCAN OF LUMBAR SPINE </strong></u></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">&nbsp;(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>Volumetric plain contiguous axial sections of the lumbar spine were obtained</em></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Visible spine is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Position</strong>: Lumbar spine shows normal lordosis. There is no segmental.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Bony spinal canal</strong>: is normal in AP and Transverse diameters. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Vertebral bodies</strong>: are normal in shape and height. Cortex is normal in thickness. Margins are smooth and sharp. No marginal osteophytes seen. No fracture lines noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Intervertebral disc spaces</strong>: are normal in width and margins. No disc protrusion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Posterior elements</strong>: Neural arches are intact. Facet joints are normal in shape and alignment and they are symmetrical. Spinous processes are normal in shape length and bony structures.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Soft tissues</strong>: pre and paravertebral soft tissues are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong><span style="font-size:16px">IMPRESSION</span>:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:12pt"><strong><span style="font-size:14px">Normal scan.</span></strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:10:34.510' AS DateTime), 1, CAST(N'2019-01-08T14:05:15.140' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (124, N'Radiology', N'CT - Myelogram', N'CT - Myelogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT Myelogram</u></strong></span></p>

<div style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong><span style="font-size:16px">Procedure</span>: </strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:justify"><strong><span style="font-size:12pt"><span style="font-size:14px">Under aseptic precaution and local anesthesia lumbar puncture was done and approximately 10 ml of low osmolar contrast was given and thin axial section of vertebral column was taken.</span></span></strong></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>IMPRESSION:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-12-26T15:12:59.713' AS DateTime), 1, CAST(N'2019-01-07T14:08:45.863' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (125, N'Radiology', N'CT - Orbit and Head', N'CT - Orbit and Head', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF HEAD AND ORBIT AND PNS</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>Volumetric &nbsp;contiguous sections of the head were obtained from the base of the skull to the vertex. </em></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>3x3 axial sections of orbit were obtained </em></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>Volumetric plain axial and coronal </em><em>sections of nose and paranasal sinuses were obtained. </em></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">B/L orbital apex and optic foramen are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral cerebral hemispheres are symmetrical. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral lateral ventricles and third ventricle are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal ganglia appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cerebellum and fourth ventricle appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">All the paranasal sinuses appear normal in outline and show normal aeration. No soft tissue density noted within. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ostiomeatal complex are bilaterally normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Turbinates appear normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:25:16.883' AS DateTime), 1, CAST(N'2019-01-07T14:12:04.020' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (126, N'Radiology', N'CT - Orbit', N'CT - Orbit', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF ORBIT </u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><em>Volumetric contiguous sections of the orbit were obtained from the base of the skull to the vertex</em></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral orbits including extraconal and intraconal compartments are normal. Globes are normal. Bilateral optic nerve sheath complexes are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">B/L orbital apex and optic foramen are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Nasal septum is central.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal scan</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:27:50.097' AS DateTime), 1, CAST(N'2019-01-07T14:12:49.587' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (127, N'Radiology', N'CT - Pelvis', N'CT - Pelvis', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF PELVIS</u></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">The sacroiliac joints are normally shaped with normal development of the sacrum and iliac wings and a normal-appearing lumbosacral junction. The joint space is of normal width on both sides. The joint contours are smooth and sharply defined. The muscles and the imaged organs of the lesser pelvis show no abnormalities. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:29:02.513' AS DateTime), 1, CAST(N'2019-01-07T14:13:21.310' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (128, N'Radiology', N'CT - Plain and Bone Window', N'CT - Plain and Bone Window', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF HEAD</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Bone Window )</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous plain axial sections of the head were obtained from the level of the base of the skull to the vertex. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">There are prominent extraaxial CSF spaces with proportionate dilatation of the ventricles.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Head size</strong>: Normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Calvarium</strong>: Normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cerebral Hemispheres</strong>: Symmetrical</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Midline shift</strong>: Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Basal ganglia</strong>/ <strong>Internal capsule</strong>: Normal</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Focal lesion </strong>: Absent</span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Brain</strong> <strong>stem</strong>: Focal lesion Absent</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cerebellum</strong>:&nbsp; Symmetrical</span>
	<ul style="list-style-type:circle">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Focal lesion</strong>: Absent</span></li>
	</ul>
	</li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:32:46.857' AS DateTime), 1, CAST(N'2019-01-07T14:14:19.303' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (129, N'Radiology', N'CT  - Portogram', N'CT - Portogram', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT PORTOGRAM</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous axial sections of the whole abdomen were obtained from the domes of diaphragm to pubic symphysis along with iv contrast.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline and attenuation. IHBDs are not dilated. No focal lesion seen. Hepatic veins and IVC are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Gall Bladder</strong>: Normal in outline and wall thickness. No calculi or focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>CBD</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Portal vein</strong>: Normal in course and caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; attenuation. </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; attenuation. No focal lesion seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Both kidneys</strong>: Normal in size, outline, attenuation &amp; show prompt excretion of contrast. No focal lesion seen. No calculus or hydronephrosis seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Stomach and bowel loops appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid or lymphadenopathy seen in the abdomen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Urinary bladder: Normal in outline and distensibility. Wall thickness is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">No fluid or any obvious mass seen in the pelvis.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymph nodes seen in the pelvis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><span style="font-size:16px"><strong>IMPRESSION</strong></span>: </span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:40:20.627' AS DateTime), 1, CAST(N'2019-01-07T14:23:30.387' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (130, N'Radiology', N'CT - Sacrococcygeal Joint', N'CT - Sacrococcygeal Joint', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF SACROCOCCYGEAL JOINT</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">5x3mm contiguous plain axial sections were obtained from lower thigh upto mid leg of left lower limb</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">The sacrocaccygeal joint appears normal. The coccyx appears normal. No e/o focal lesion noted. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Rest of the visible bones show normal outline, alignment and density. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T15:59:24.717' AS DateTime), 1, CAST(N'2019-01-07T14:25:18.993' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (131, N'Radiology', N'CT - Sternum', N'CT - Sternum', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF STERNUM</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">3x3 mm contiguous plain axial sections of the sternum were obtained.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Sternum</strong>: Normal in outline, density and no focal lesion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Costochondral joints are normal. No focal lesion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Sternoclavicular joints are normal bilaterally.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible soft tissues are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible portions of adjacent lungs appear normal. No focal lesion noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T16:02:14.633' AS DateTime), 1, CAST(N'2019-01-08T14:07:24.557' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (132, N'Radiology', N'CT - Wrist', N'CT - Wrist', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>CT SCAN OF WRIST JOINT</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(lain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">2x2mm contiguous axial &amp; coronal plain sections of temporal bones were obtained.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li><span style="font-size:14px">The bones comprising the wrist present a normal configuration.</span></li>
	<li><span style="font-size:14px">The radial joint angle is normal. The carpal bones show normal shape and relationship to one another and to the radiocarpal and carpometacarpal joints.</span></li>
	<li><span style="font-size:14px">There are no osteophytes and no subchondral signal changes.</span></li>
	<li><span style="font-size:14px">The ulnar (triangular) disk exhibits normal </span></li>
	<li style="text-align:justify"><span style="font-size:14px">The metacarpals and phalanges have normal margins. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T16:10:47.127' AS DateTime), 1, CAST(N'2019-01-08T14:07:49.437' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (133, N'Radiology', N'Cerebral DSA', N'Cerebral DSA', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:14.0pt">CEREBRAL DSA</span></strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong><span style="font-size:14.0pt">Findings</span></strong><span style="font-size:14.0pt">:</span></span></p>

<ul>
	<li><span style="font-size:14px">&nbsp;Anterior cerebral artery, middle cerebral artery and its branches appear normal in course caliber outline and contrast opacification. Basilar artery, posterior cerebral artery and visible branches appear normal in course caliber outline and contrast opacification.</span></li>
	<li><span style="font-size:14px">Superior saggital sinus, inferior saggital sinus, straight sinus, transverse and sigmoid sinus as well as visible cortical veins appear normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong><span style="font-size:14.0pt">IMPRESSION</span></strong><span style="font-size:14.0pt">: </span></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T16:14:37.703' AS DateTime), NULL, NULL, 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (135, N'Radiology', N'HRCT Temporal Bone (cochelear)', N'HRCT Temporal Bone (cochlear implant)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>HRCT SCAN OF TEMPORAL BONE </u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous axial &amp; coronal plain sections of temporal bones were obtained. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<table align="left" border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid windowtext 1.0pt; margin-left:6.75pt; margin-right:6.75pt">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Inner ear </strong></span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Right</strong></span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Left</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">1</span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Cochlea</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Present, malformation, patency</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Present, malformation, patency</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">2</span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Internal auditory canal width</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">3 </span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Round window</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Present and patent</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Present and patent</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">4 </span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Carotid canal</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Relation to cochlea</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Relation to cochlea</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">5 </span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Jugular bulb</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Relation to round window, dehisence</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Relation to round window, dehisence</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">6</span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Facial nerve</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Normal course</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Normal course</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Middle ear</strong></span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">1.</span></p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Integrity of ossicles</span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Mastoids</strong></span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Normal/extensive/partial pneumatization,</span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Sclerotic mastoids</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Normal/extensive/partial pneumatization,</span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Sclerotic mastoids</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:19.8pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:125.1pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Miscellaneous</strong></span></p>
			</td>
			<td style="vertical-align:top; width:2.0in">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">High riding jugular bulb</span></p>
			</td>
			<td style="vertical-align:top; width:157.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">High riding jugular bulb</span></p>
			</td>
		</tr>
	</tbody>
</table>

<p>&nbsp;</p>

<p>&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify">&nbsp;</p>

<p style="text-align:justify">&nbsp;</p>

<p style="text-align:justify">&nbsp;</p>

<p style="text-align:justify">&nbsp;</p>

<p style="text-align:justify">&nbsp;</p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral external auditory canals appear normal in course, caliber and outline.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Petrous pyramids are normal in configuration and shape.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible portions of paranasal sinuses are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal scan</span>.</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T16:30:42.857' AS DateTime), 1, CAST(N'2019-01-08T14:08:38.913' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (136, N'Radiology', N'HRCT Temporal Bone(new thesis)', N'HRCT Temporal Bone (New Thesis)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>HRCT SCAN OF TEMPORAL BONE </u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous axial &amp; coronal plain sections of temporal bones were obtained. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Extent of disease :</strong> Soft tissue density seen in &hellip;..</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Middle ear cavity :&nbsp;&nbsp;</strong>Soft tissue density<strong> </strong>seen in &hellip;..</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Ossicular status :</strong></span>
	<ul style="list-style-type:square">
		<li style="text-align:justify"><span style="font-size:14px"><strong>Malleus</strong></span></li>
		<li style="text-align:justify"><span style="font-size:14px"><strong>Incus</strong></span></li>
		<li style="text-align:justify"><span style="font-size:14px"><strong>Stapes</strong></span></li>
	</ul>
	</li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Scutum</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Sinus tympani</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Facial nerve and canal</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Sinus plate</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Dural plate</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Lateral semicircular canal</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Internal ear :</strong> Appear normal in configuration and borders with normal chochleas and semicircular canals.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Internal acoustic meatus</strong> : are normal in course, caliber and shape.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Mastoids</strong> : show normal borders &amp; pneumatization pattern.&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Petrous pyramids</strong> : are normal in configuration and shape.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible portions of paranasal sinuses are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T16:33:53.637' AS DateTime), 1, CAST(N'2019-01-08T14:09:17.457' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (137, N'Radiology', N'HRCT Temporal Bone', N'HRCT Temporal Bone', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>HRCT SCAN OF TEMPORAL BONE </u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Volumetric contiguous axial &amp; coronal plain sections of temporal bones were obtained. </span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral external auditory canals appear normal in course, caliber and outline.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Middle ear cavities are normal in shape, borders and pneumatization with normal ossicles.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Internal ears appear normal in configuration and borders with normal chochleas and semicircular canals.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Internal acoustic meatus are normal in course, caliber and shape.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Mastoids show normal borders &amp; pneumatization pattern.&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Petrous pyramids are normal in configuration and shape.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible portions of paranasal sinuses are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-26T16:35:41.213' AS DateTime), 1, CAST(N'2019-01-08T14:09:37.240' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (140, N'Radiology', N'MRA - Brain', N'MRI - MRA Brain', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Brain with MRA</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Technique:&nbsp;</strong>MRA 3D TOF</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Pituitary gland is normal in size and signal intensity. No abnormality seen in supra and parasellar region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior cranial fossa structures are normal. No abnormality seen in CP angle area. Brainstem is normal in size, outline and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral ICA, MCA, and ACA are normal in course, caliber and outline. No abnormal focal dilatation or stenosis noted in these arteries. No flow voids noted within these vessels.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral vertebral arteries, basilar artery and posterior cerebral arteries are normal in course, caliber and outline. No flow voids noted within these vessels.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal MRA study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T10:58:56.373' AS DateTime), 1, CAST(N'2019-01-07T15:44:58.150' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (141, N'Radiology', N'MRCP', N'MRCP Report', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>MRCP REPORT</strong></u></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>SEQUENCES:</u></strong>&nbsp; T2 weighted axial images. </span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Single shot FSE MRCP images.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">MIP</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">2D</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings: </strong></span></p>

<ul>
	<li><span style="font-size:14px">Gall bladder is normal. Cystic duct and intrahepatic billiary channels appear normal.</span></li>
	<li><span style="font-size:14px">Common bile duct, common hepatic duct and IHBDs are normal. No intraluminal abnormality noted.</span></li>
	<li><span style="font-size:14px">Visible pancreatic duct appears normal.</span></li>
	<li><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline &amp; signal intensity. No space occupying lesion seen. Hepatic veins, IVC &amp; portal veins are normal</span></li>
	<li><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; signal intensity. Pancreatic duct is not dilated. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:01:09.347' AS DateTime), 1, CAST(N'2019-01-08T14:16:00.860' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (142, N'Radiology', N'MRI - Whole Spine', N'MRI - Whole Spine Screening', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF WHOLE SPINE</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>SEQUENCES:</strong></u>&nbsp; T2 weighted sequences in sagittal planes of whole spine.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>&nbsp; <span style="font-size:16px">Findings</span>:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Odontoid process is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Curvature is maintained.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Intervertebral disc shows normal in height and signal intensity</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No e/o SOL/ cord edema.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Facets joints are normal</span>.</li>
</ul>

<div style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span> &nbsp; &nbsp;</div>

<ul>
	<li>
	<p><span style="font-size:12pt"><span style="font-size:14.0pt"><span style="font-size:14px"><strong>Normal study.</strong></span></span></span></p>
	</li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:04:59.040' AS DateTime), 1, CAST(N'2019-01-08T14:15:52.427' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (143, N'Radiology', N'MRI - Spine', N'MRI - Whole Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF WHOLE SPINE</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>SEQUENCES:</strong></u> &nbsp;T1 and T2 weighted sequences in sagittal and axial planes of lumbar spines. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>&nbsp;Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Atlanto-dental interspace is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Effective foramen magnum diameter is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Odontoid process is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Curvature is maintained.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Intervertebral disc shows normal in height and signal intensity</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior elements (pedicle, lamina, spinous process and transverse process) are normal in signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No e/o SOL/ cord edema.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Facets joints are normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px">ALL, PLL, spinous ligaments and ligamentum flavum are normal in configuration and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:12pt"><span style="font-size:14px">Pre and paravertebral soft tissues appear normal.</span></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:12pt"><strong><span style="font-size:14.0pt"><span style="font-size:14px">Normal study</span></span></strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:09:34.837' AS DateTime), 1, CAST(N'2019-01-08T14:15:41.273' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (144, N'Radiology', N'MRI - Abdomen with MRCP', N'MRI - Abdomen with MRCP', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF ABDOMEN WITH MRCP</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>SEQUENCES:</u></strong> &nbsp;T2 weighted Axial images.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Single shot FSE MRCP images.</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings: </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Liver</strong>: Normal in size, outline &amp; signal intensity. No space occupying lesion seen. No IHBD dilatation. Hepatic veins, IVC &amp; portal veins are normal.</span></li>
	<li><span style="font-size:14px"><strong>Gallbladder</strong>: Normal in outline, distensibility &amp; wall thickness. No calculus seen.</span></li>
	<li><span style="font-size:14px"><strong>CBD</strong>: &nbsp;&nbsp;&nbsp;Normal course &amp; caliber.</span></li>
	<li><span style="font-size:14px"><strong>Spleen</strong>: Normal in size, outline &amp; signal intensity. No Space occupying lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>Pancreas</strong>: Normal in size, outline &amp; signal intensity. Pancreatic duct is not dilated. No space occupying lesion seen.</span></li>
	<li><span style="font-size:14px"><strong>Kidneys</strong>:&nbsp; Both kidneys are normal in size, outline &amp; signal intensity, Corticomedullary differentiation is normal. No hydronephrosis. No space occupying lesion seen.</span></li>
	<li><span style="font-size:14px">Stomach &amp; visible bowel loops are normal.</span></li>
	<li><span style="font-size:14px">No abnormality seen in spine &amp; paraspinal region.</span></li>
	<li><span style="font-size:14px">Lung bases are normal.</span></li>
	<li><span style="font-size:14px">MRCP: Normal course &amp; caliber of R &amp; L hepatic ducts, common hepatic duct, CBD &amp; pancreatic ducts. No intraluminal filling defect seen. No abnormal narrowing or dilatation seen. Pancreatic biliary confluence is normal.</span></li>
</ul>

<p><span style="font-size:16px"><strong>IMPRESSION:&nbsp; </strong></span></p>

<ul>
	<li><strong><span style="font-size:12pt"><span style="font-size:14px">Normal study.</span></span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:13:10.647' AS DateTime), 1, CAST(N'2019-01-08T14:13:25.107' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (145, N'Radiology', N'MRI - Ankle', N'MRI - Right Ankle Joint', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF RIGHT &nbsp;ANKLE JOINT</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>SEQUENCES</u>: </strong></span><span style="font-size:12px">T1, T2 Axial</span></div>

<div style="text-align:center"><span style="font-size:12px">T1, T2, STIR coronal.</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">The bones comprising the ankle joint show normal position and configuration, with normal development of the ankle mortise.</span></li>
	<li><span style="font-size:14px">The bone marrow signal, trabecular pattern, and epiphyseal lines are all normal.</span></li>
	<li><span style="font-size:14px">The joint space is of normal width. The cortex shows normal thickness and smooth contours, especially along the tibial and talar articular surfaces.</span></li>
	<li><span style="font-size:14px">There are no subchondral signal changes and no osteophytes.</span></li>
	<li><span style="font-size:14px">The lateral and medial ligaments are normal in their course, width, and signal characteristics.</span></li>
	<li><span style="font-size:14px">The talocalcaneal and talonavicular joints appear normal. The interosseous ligament between the talus and calcaneus is intact. The Achilles tendon is normal in its course, width, and signal characteristics, and the preAchilles fat is clear. The tendons and plantar aponeurosis are unremarkable.</span></li>
	<li><span style="font-size:14px">The soft tissues show no abnormalities.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:&nbsp; </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal MRI study of ankle.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:18:02.233' AS DateTime), 1, CAST(N'2019-01-08T14:13:47.300' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (146, N'Radiology', N'MRI - Arm', N'MRI - Left/Right Arm', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the left / right arm</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>Technique:</strong></u><strong>&nbsp;</strong>T2 weighed axial and coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">Gradient echo ( F12 D) sag</span></div>

<div style="text-align:center"><span style="font-size:12px">Fat suppressed inversion recovery sag</span></div>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings :</strong></span></p>

<ul>
	<li><span style="font-size:14px">Muscles in the arm show normal morphology with normal signal intensity . No abnormality in intermuscular plane. No mass lesion along the neurovascular bundle.</span></li>
	<li><span style="font-size:14px">Humerus shows normal cortical and marrow signal intensity . No cortical erosion or bony destruction evident.</span></li>
	<li><span style="font-size:14px">No abnormality noted in subcutaneous plane.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal MR study of right / left arm.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:19:49.313' AS DateTime), 1, CAST(N'2019-01-08T14:15:14.833' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (147, N'Radiology', N'MRI - MRV - Brain', N'MRI - MRV - Brain', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><strong><span style="font-size:20px">MRI AND MRV BRAIN</span></strong></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>Technique:</strong></u><strong>&nbsp;</strong>T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR Axial</span></div>

<div style="text-align:center"><span style="font-size:12px">TOF 2D Sequence</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li><span style="font-size:14px">Pituitary gland is normal in size and signal intensity. No abnormality seen in supra and parasellar region.</span></li>
	<li><span style="font-size:14px">Posterior cranial fossa structures are normal. No abnormality seen in CP angle area. Brainstem is normal in size, outline and signal intensity. </span></li>
	<li><span style="font-size:14px">Cranio-vertebral junction area does not show any abnormality.</span></li>
	<li><span style="font-size:14px">No abnormality noted in paranasal sinuses.</span></li>
	<li><span style="font-size:14px">Superior sagittal sinus, Transverse sinus and sigmoid sinus are normal in course, caliber and signal intensity. No intraluminal flow voids are noted.</span></li>
	<li><span style="font-size:14px">Straight sinus, vein of Galen, internal cerebral vein and vein of Rosenthal are seen well. </span></li>
	<li><span style="font-size:14px">No evidence of sinus thrombosis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRV study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:22:53.207' AS DateTime), 1, CAST(N'2019-01-08T14:15:07.563' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (148, N'Radiology', N'MRI - Brain and C-spine', N'MRI - Brain and C-spine  screening', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>MRI of the Brain </strong></u></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u>&nbsp;</strong>T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR Axial</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Pituitary gland is normal in size and signal intensity. No abnormality seen in supra and parasellar region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior cranial fossa structures are normal. No abnormality seen in CP angle area. Brainstem is normal in size, outline and signal intensity. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cranio-vertebral junction area does not show any abnormality.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality noted in paranasal sinuses.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><u>T2&nbsp; saggital screening of cervical spine:</u></strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Intervertebral disc shows normal in height and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No e/o SOL/ cord edema.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRI study of Brain</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:26:56.000' AS DateTime), 1, CAST(N'2019-01-08T14:14:59.740' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (149, N'Radiology', N'MRI - C-spine', N'MRI - Cervical Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI Cervical Spine </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u>&nbsp;</strong>T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR axial</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Curvature of cervical spine is maintained.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Intervertebral disc shows normal in height and signal intensity</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior elements (pedicle, lamina, spinous process and transverse process) are normal in signal intensity. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No e/o SOL/ cord edema.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Atlanto-dental interspace is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Effective foramen magnum diameter is normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Odontoid process is normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><strong><span style="font-size:14px">Normal MRI study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:29:24.160' AS DateTime), 1, CAST(N'2019-01-07T15:58:30.350' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (150, N'Radiology', N'MRI - Brain and Orbit', N'MRI - Brain and Orbit', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF BRAIN AND ORBIT</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>Sequences</strong></u>: Spin echo T1 sequences in axial &amp; sagittal planes.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">FSE T2 sequences in sagittal, axial and coronal planes. </span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">FLAIR sequences axial plane.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">B/L cerebral hemispheres are normal in signal intensity. No SOL seen.</span></li>
	<li><span style="font-size:14px">B/L basal ganglia, internal capsules and thalami are normal in signal intensity.</span></li>
	<li><span style="font-size:14px">B/L hippocampus and parahippocampal regions are normal in morphology and signal intensity.</span></li>
	<li><span style="font-size:14px">B/L sylvian fissures, basal cisterns and cortical sulci are normal.</span></li>
	<li><span style="font-size:14px">Falx is central.</span></li>
	<li><span style="font-size:14px">B/L cerebellar hemispheres, mid brain, pons and medulla are normal in signal intensity. No SOL seen.</span></li>
	<li><span style="font-size:14px">Ventricular system is normal in morphology and signal intensity.</span></li>
	<li><span style="font-size:14px">Visualized vessels appear normal.</span></li>
	<li><span style="font-size:14px">Bilateral orbit including extraconal and intraconal compartments are normal in signal intensity. No focal lesion seen. Bilateral optic nerve sheath complexes are normal in signal intensity.</span></li>
	<li><span style="font-size:14px">Bilateral cavernous sinuses show normal signal intensity.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:12pt"><span style="font-size:14.0pt"><span style="font-size:14px"><strong>Normal MRI of Brain and Orbit</strong></span></span></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:31:59.833' AS DateTime), 1, CAST(N'2019-01-07T16:00:10.497' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (151, N'Radiology', N'MRI - Brain with Contrast', N'MRI - Brain with Contrast', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Brain </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain and Contrast)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR Axial</span></div>

<div style="text-align:center"><span style="font-size:12px">Post- contrast T-1weighted coronal and sagittal.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Pituitary gland is normal in size and signal intensity. No abnormality seen in supra and parasellar region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior cranial fossa structures are normal. No abnormality seen in CP angle area. Brainstem is normal in size, outline and signal intensity. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cranio-vertebral junction area does not show any abnormality.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality noted in paranasal sinuses.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No contrast enhancing lesion noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRI study of &nbsp;Brain</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:34:00.347' AS DateTime), 1, CAST(N'2019-01-07T16:01:17.223' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (152, N'Radiology', N'MRI - Brain', N'MRI - Brain', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Brain </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR Axial</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Pituitary gland is normal in size and signal intensity. No abnormality seen in supra and parasellar region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior cranial fossa structures are normal. No abnormality seen in CP angle area. Brainstem is normal in size, outline and signal intensity. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cranio-vertebral junction area does not show any abnormality.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality noted in paranasal sinuses.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRI study of Brain</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:37:15.413' AS DateTime), 1, CAST(N'2019-01-07T16:02:26.537' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (153, N'Radiology', N'MRI - Brain Pituitary Normal', N'MRI - Brain Pituitary Normal', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Brain </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR Axial</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">The size, position, and configuration of the sella are normal. The floor and walls of the sella are smooth and well-defined. The pituitary is normal in size, shape, and position. The pituitary tissue shows normal signal characteristics with no circumscribed abnormalities of signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The infundibulum is centered and of normal size.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The optic chiasm and suprasellar CSF spaces appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">The cavernous sinus and imaged portions of the internal carotid artery and carotid siphon are unremarkable.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior cranial fossa structures are normal. No abnormality seen in CP angle area. Brainstem is normal in size, outline and signal intensity. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cranio-vertebral junction area does not show any abnormality.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality noted in paranasal sinuses.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRI study of &nbsp;Brain</strong>.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T11:41:34.580' AS DateTime), 1, CAST(N'2019-01-08T14:16:57.120' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (154, N'Radiology', N'MRI - DL Spine', N'MRI - D - L Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF D-L SPINE</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>SEQUENCES:</strong></u> T1 and T2 weighted sequences in sagittal and axial planes.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Curvature is maintained.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Intervertebral disc shows normal in height and signal intensity</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior elements (pedicle, lamina, spinous process and transverse process) are normal in signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No evidence of SOL or cord edema.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Facets joints are normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px">ALL, PLL, spinous ligaments and ligamentum flavum are normal in configuration and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:12pt"><span style="font-size:14px">Pre and paravertebral soft tissues appear normal.</span></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong>Normal MRI scan</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:01:53.527' AS DateTime), 1, CAST(N'2019-01-08T14:17:18.217' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (155, N'Radiology', N'MRI - D Spine', N'MRI - Dorsal Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI of the Dorsal Spine</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>SEQUENCES:</strong> </u>&nbsp;T-1 and T-2 weighted Sagittal and &nbsp;Axial</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Fat Suppressed IR Sagittal</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Curvature is maintained.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Intervertebral disc shows normal in height and signal intensity</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior elements (pedicle, lamina, spinous process and transverse process) are normal in signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No evidence of SOL or cord edema.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Facets joints are normal</span></li>
	<li style="text-align:justify"><span style="font-size:14px">ALL, PLL, spinous ligaments and ligamentum flavum are normal in configuration and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:12pt"><span style="font-size:14px">Pre and paravertebral soft tissues appear normal.&nbsp;</span>&nbsp;</span></li>
</ul>

<div style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:14.0pt"><span style="font-size:16px">IMPRESSION</span>: </span></strong></span></div>

<ul>
	<li>
	<div><span style="font-size:12pt"><strong><span style="font-size:14.0pt"><span style="font-size:14px">Normal Findings</span></span></strong></span></div>
	</li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:03:34.163' AS DateTime), 1, CAST(N'2019-01-08T14:17:39.250' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (156, N'Radiology', N'MRI - Foot', N'MRI - Foot', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Foot </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 weighted coronal and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">STIR coronal</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Visualized metatarsal bones show normal alignment, outline and signal intensity. No evidence of joint effusion noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Flexor and extensor tendons show normal signal intensity with attachment. Periarticular soft tissue appear normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal MRI study of foot.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:05:23.820' AS DateTime), 1, CAST(N'2019-01-07T16:06:42.117' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (157, N'Radiology', N'MRI - Hip', N'MRI - Right Hip', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF RIGHT HIP</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>SEQUENCES:</strong></u> T1, T2 Axial</span></div>

<div style="text-align:center"><span style="font-size:12px">T1, T2, STIR coronal.</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">No free fluid is noted in the right hip joint.</span></li>
	<li><span style="font-size:14px">No abnormal signal intensity noted in the adjacent bones.</span></li>
	<li><span style="font-size:14px">Articular cartilages and subchondral bones are normal.</span></li>
	<li><span style="font-size:14px">Visualized femur and acetabulum are normal. No e/o marrow edema.</span></li>
	<li><span style="font-size:14px">Para-articular soft tissues are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal MRI scan</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:06:59.460' AS DateTime), 1, CAST(N'2019-01-08T14:18:14.920' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (158, N'Radiology', N'MRI - Knee', N'MRI - Left Knee', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF LEFT KNEE</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Protocol:</u>&nbsp;&nbsp;</strong></span><span style="font-size:12px">T1W sequences in coronal plane.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">T2 Fat suppressed sequence in coronal plane.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">T2W sequences in axial, coronal &amp; sagittal planes.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">PD sequences in sagittal planes.</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Free fluid seen in the knee joint.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>T2/STIR heterogenous signal intensity area is noted in the antero-medial aspect of anterior horn of lateral meniscus .It is associated with well defined fluid attenuating cystic lesion measuring 13.9 x 12 mm in the intercondylar notch .The cystic lesion is abutting the anterior fibers of the anterior cruciate ligament . However, ACL appear normal in course and outline. </strong></span></li>
	<li><span style="font-size:14px">Visualized tibia and fibula are normal. No e/o marrow edema.</span></li>
	<li><span style="font-size:14px">Patella is normal in morphology and signal intensity.</span></li>
	<li><span style="font-size:14px">ACL, PCL, MCL and LCL are normal in morphology and signal intensity.</span></li>
	<li><span style="font-size:14px">Medial meniscus is normal in morphology and signal intensity.</span></li>
	<li><span style="font-size:14px">Para-articular soft tissues are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Tear of the anterior horn of lateral meniscus associated with parameniscal cyst in the intercondylar notch anteriorly.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Knee joint effusion.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:09:24.323' AS DateTime), 1, CAST(N'2019-01-08T14:18:33.730' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (159, N'Radiology', N'MRI - Leg', N'MRI - Leg', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of LEG</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">&nbsp;(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>Technique:</strong></u>&nbsp;T-1 and T-2 weighted Sagittal</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">T-1 and T-2 weighted Coronal</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">STIR</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings</strong>:</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">All three compartments of the legs are normal. Muscles in the leg show normal morphology and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality seen in intermuscular and fascial plane. No evidence of fluid collection along the muscle and fascial plane.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Both tibia and fibula show normal cortical thickness, outline and signal intensity. Normal marrow signal seen in both of these bones.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality noted along neurovascular bundles.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visible part of the tendons are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRI scan.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:22:32.463' AS DateTime), 1, CAST(N'2019-01-08T14:18:48.413' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (160, N'Radiology', N'MRI - L S Spine', N'MRI - L-S Spine', N'<div style="margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI OF L-S SPINE</u></strong></span></div>

<div style="margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>SEQUENCES</u>:</strong>&nbsp; T1 and T2 weighted sequences in sagittal and axial planes.</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Curvature is maintained.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Vertebral bodies show normal height, alignment and signal intensity.</span></li>
	<li><span style="font-size:14px">Disc spaces and the signal intensity of the disc in all levels are normal.</span></li>
	<li><span style="font-size:14px">Central spinal canal and bilateral neural foramina are normal in caliber.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Posterior elements (pedicle, lamina, spinous process and transverse process) are normal in signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Visualized spinal cord appears normal in morphology and signal intensity. No e/o SOL/ cord edema. Facets joints are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">ALL, PLL, spinous ligaments and ligamentum flavum are normal in configuration and signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:12pt"><span style="font-size:14px">Pre and paravertebral soft tissues appear normal.&nbsp;</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal findings.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:24:54.440' AS DateTime), 1, CAST(N'2019-01-08T14:19:23.330' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (161, N'Radiology', N'MRI - Neck', N'MRI - Neck Normal', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of NECK</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-2 weighted Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">Gradient Echo (Fl2D) Axial</span></div>

<div style="text-align:center"><span style="font-size:12px">T-1 and T-2 weighted Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">Fat Suppressed Inversion Recovery (IR) Coronal</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Masticator and Parapharyngeal/Parapharyngeal Mucosal Space: Normal</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Parotid and Submandibular Space: Normal</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Carotid Space: Normal</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Prevertebral Space: Normal</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>The Laryngeal Skeleton: </strong>Cricoid, thyroid cartilages, hyoid bone and epiglottis is normal. No morphological changes seen in these structures.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>The Laryngeal Soft Tissue Structures:</strong> True and false vocal cords, laryngeal musculatures, aryepiglitic fold area, para-laryngeal and preepiglottic spaces are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Whole of the trachea and proximal major bronchi are normal. No abnormality seen in paratracheal area. Apical area of the thorax are normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Neck muscles and intermuscular planes are normal. No signal changes noted in the muscles.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No significantly enlarged lymphnodes are seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Thyroid Gland: </strong>Well visualized. Normal in size and signal intensity. No focal lesion evident.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal study MRI neck</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:26:37.137' AS DateTime), 1, CAST(N'2019-01-08T14:19:34.560' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (162, N'Radiology', N'MRI - Pelvis', N'MRI - Pelvis', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Pelvis </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Plain)</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;Axial T1W</span></div>

<div style="text-align:center"><span style="font-size:12px">Coronal, sagital T2W</span></div>

<div style="text-align:center"><span style="font-size:12px">Axial T1W, fat supressed</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Bilateral femoral heads are normal in contour with normal cortical outline and marrow signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal signal intensity noted in bilateral hip joint region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No evidence of joint effusion.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal soft tissue signal intensity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No space occupying lesions noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal marrow signal intensity of the pelvis and visible bones.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal signal intensity noted in the inter and intramuscular compartment.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><strong>Normal MRI scan</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:28:02.727' AS DateTime), 1, CAST(N'2019-01-07T16:19:12.743' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (163, N'Radiology', N'MRI - Sacrococcygeal Spine', N'MRI - Sacrococcygeal Spine', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>MRI of the Sacrococcygeal Spine</strong></u></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>Techniques:</strong></u>&nbsp;T-1 and T-2 weighted Sagittal</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">T-1 and T-2 weighted Axial</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Fat suppressed IR Sagittal</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Gradient Echo (Fl2D) Sagittal</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Patient scanning in prone position. No abnormality seen in soft tissue plane in the posterior aspect of the sacrum and the coccyx. No abnormality noted in perianal region and presacral space. Pelvic organs including rectum, urinary bladder and prostate appear normal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal alignment, configuration and height of the vertebral bodies with normal marrow signal.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Disc spaces and the signal intensity of the disc in all lumbar levels are normal. No disc bulge, herniation or sequestration evident.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Lower part of the cord is normal. CSF space around the cord is normal. No space occupying lesions seen.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No para-spinal abnormality.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:14px"><strong>Normal MR Study of the Sacrococcygeal Spine.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:30:09.923' AS DateTime), 1, CAST(N'2019-01-07T16:21:10.240' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (164, N'Radiology', N'MRI - Shoulder', N'MRI - Right/Left Shoulder', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong><u>MRI of the Right/Left Shoulder</u></strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 weighted Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-1 and T-2 weighted Oblique Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Acromian-clavicular joint is normal. Type I acromion is noted. &nbsp;No acromial&nbsp; spur/osteophytes seen. Subacromial space is normal.</span></li>
	<li><span style="font-size:14px">Rotator cuff: Rotator cuff muscles including supraspinatous tendon and muscle show normal morphology and signal intensity. No muscle atrophy or retraction seen. No evidence of tendonitis or rotator cuff tear. Bicipital tendon is in normal location.</span></li>
	<li><span style="font-size:14px">Labral capsular complex: Labrum is normal in shape and signal intensity. No labral tear seen. Type-I capsular insertion is noted both anteriorly and posteriorly.</span></li>
	<li><span style="font-size:14px">Suprascapular notch is well visualized. Both nerve and artery is identifiable. No mass noted in this area.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study of left shoulder</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:32:18.207' AS DateTime), 1, CAST(N'2019-01-08T14:20:30.630' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (165, N'Radiology', N'MRI - SI Joint', N'MRI - Sacroiliac Joint', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI SACROILIAC JOINTS</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Protocol</u>:&nbsp;&nbsp;</strong>T1W, T2W and STIR sequences in coronal plane.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">&nbsp; &nbsp; T1 W, T2W sequences in axial plane</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">The sacroiliac joints are normal shape with normal development of the sacrum and iliac wings and a normal-appearing lumbosacral junction.</span></li>
	<li><span style="font-size:14px">The joint space is of normal width on both sides. The joint contours are smooth and sharply defined.</span></li>
	<li><span style="font-size:14px">The subchondral bone marrow appears normal. There are no marginal osteophytes.</span></li>
	<li><span style="font-size:14px">The sacrum and iliac wings also contain normal bone marrow and present smooth, intact cortical boundaries. The sacral neural foramina are of normal width. The nerve filaments show normal course and diameter, and the width of the sacral spinal canal is normal.</span></li>
	<li><span style="font-size:14px">The muscles and the imaged organs of the lesser pelvis show no abnormalities.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: &nbsp;</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in; text-align: justify;"><span style="font-size:12pt"><strong><span style="font-size:14px">Normal findings.</span></strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:34:38.577' AS DateTime), 1, CAST(N'2019-01-07T16:23:33.790' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (166, N'Radiology', N'MRI - Thigh', N'MRI - Right Thigh', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI - RIGHT THIGH</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>SEQUENCES:</u> </strong>FSE T1W sequence in axial, sagittal and coronal plane.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">FSE T2W sequence in axial, sagittal and coronal plane.</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Proton density sequence in sagittal plane.</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">All compartments of the thigh are normal. Muscles in the thigh show normal morphology and signal intensity. No evidence of vascular abnormality.</span></li>
	<li><span style="font-size:14px">No evidence of fluid collection along the muscle and fascial plane. Normal subcutaneous fat plane.</span></li>
	<li><span style="font-size:14px">Femur show normal cortical thickness, outline and marrow signal intensity. No abnormality seen in periosteum.</span></li>
	<li><span style="font-size:14px">No abnormality noted along neurovascular bundles.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: &nbsp;</strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in;"><strong><span style="font-size:14px">Normal MRI study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:43:49.433' AS DateTime), 1, CAST(N'2019-01-07T16:25:07.557' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (167, N'Radiology', N'MRI - Wrist', N'MRI - Wrist', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI OF WRIST</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>SEQUENCES:</strong> </u>&nbsp;T-1 and T-2 weighted Coronal</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">T-2 weighted Transverse</span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">Gradient Echo (Fl2D) and Fat Suppressed Inversion Recovery (IR) Coronal</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">The wrist show normal morphology with normal marrow signal intensity. TFCC is normal. No evidence of rupture noted. No fluid collection seen around it. No abnormality seen over the ulnar styloid process.</span></li>
	<li><span style="font-size:14px">No bone erosion and destruction evident.</span></li>
	<li><span style="font-size:14px">No signal changes in all visible muscles evident in all sequences.</span></li>
	<li><span style="font-size:14px">No abnormality seen in tendon and tendonous seath.</span></li>
	<li><span style="font-size:14px">Both nerve and artery is identifiable. No mass noted in this area.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-left: 0in; margin-right: 0in;"><strong><span style="font-size:14px">Normal Findings</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:46:02.887' AS DateTime), 1, CAST(N'2019-01-07T16:25:58.597' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (168, N'Radiology', N'MRI - Brain (CP)', N'MRI - Brain (CP Angles)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong>MRI of the Brain</strong></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 weighted Axial and Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-2 weighted Axial and Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">FLAIR Axial</span></div>

<div style="text-align:center"><span style="font-size:12px">BASG and T1 coronal of Pituitary</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Both internal auditory meatus and canals including 7th and 8th cranial nerve bundles are well visualized. No mass seen in and around it. No abnormality seen in CP angle area. Cochlea and semicircular canals appear normal. Brainstem is normal in size, outline and signal intensity. No retained fluid or signal changes noted in mastoid air cells.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Normal brain morphology with normal parenchymal signal intensity. No evidence of brain edema, recent haemorrhage or infarction.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Ventricles are normal in size and configuration.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No midline shift or mass effect noted.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Basal cisterns and perihemispheric CSF spaces are normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Pituitary gland is normal in size and signal intensity. No abnormality seen in supra and parasellar region.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">Cranio-vertebral junction area does not show any abnormality.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No abnormality noted in paranasal sinuses.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal MR Study of the Brain. &nbsp;&nbsp;</strong></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:48:25.877' AS DateTime), 1, CAST(N'2019-01-08T14:21:13.907' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (169, N'Radiology', N'MRI - Pelvis and SI Joint', N'MRI - Pelvis and SI Joint', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI of the Pelvis and SI joints</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><strong><u>Technique:</u></strong>&nbsp;T-1 and T-2 weighted Sagittal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-1 and T-2 weighted Coronal</span></div>

<div style="text-align:center"><span style="font-size:12px">T-1 and T-2 weighted Transverse</span></div>

<div style="text-align:center"><span style="font-size:12px">Gradient Echo (Fl2D) Coronal</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Sacrum&nbsp; shows normal morphology and marrow signal. Both SI joints are normal. No evidence of joint space narrowing, articular erosion noted. No marrow signal changes seen adjacent to SI joints. Sacral spinal canal and neural foraminas are normal. No abnormality seen in soft tissue around the SI joint. Coccygeal bones are normal. No marrow signal changes noted in coccygeal bone. Presacral soft tissue plane is normal. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Both hip joints are normal. No abnormality noted in acetabular roof, femoral head and neck. Normal signal changes seen in the marrow spaces of these bones. Symphasis pubis is normal. No abnormality seen in muscles and intermuscular plane.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No enlarged lymphnodes seen along the course of iliac vessels and in the inguinal area.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal MR Study of the Pelvis and SI Joints.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:50:32.027' AS DateTime), 1, CAST(N'2019-01-08T14:21:27.617' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (170, N'Radiology', N'MRV - Brain', N'MRI - MRV - Brain', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>MRI AND&nbsp; MRV BRAIN</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px"><u><strong>Technique:</strong></u>&nbsp;T-2 weighted Axial screening</span></div>

<div style="text-align:center"><span style="font-size:12px">TOF 2D Sequence</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px">Superior sagittal sinus, Transverse sinus and sigmoid sinus are normal in course, caliber and signal intensity. </span></li>
	<li><span style="font-size:14px">Internal cerebral veins and &nbsp;Straight sinus are visualised without obvious thrombus.</span></li>
	<li><span style="font-size:14px">T2 weighted axial images of brain shows normal brain morphology and signal intensity. No focal lesion is seen. Ventricles are normal.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal MRV study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T12:53:49.050' AS DateTime), 1, CAST(N'2019-01-08T14:21:44.203' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (172, N'Radiology', N'USG - TVS (New Format)', N'USG - Transabdominal and Transvaginal Pelvic ', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Transabdominal and Transvaginal Pelvic &nbsp;Ultrasound </strong></span></u></p>

<p><span style="font-size:16px"><strong>Findings:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong><u>Uterus: </u></strong></span>

	<ul style="list-style-type:circle">
		<li><span style="font-size:14px"><strong>Uterus is anteverted, normal in &nbsp;&nbsp;outline and echotexture. Size: &nbsp;</strong></span></li>
		<li><span style="font-size:14px">No focal lesion noted. </span></li>
		<li><span style="font-size:14px"><strong>Endometrial thickness measures&nbsp;&nbsp;&nbsp; mm.</strong></span></li>
	</ul>
	</li>
	<li><span style="font-size:14px"><strong><u>Adnexa: </u></strong></span>
	<ul style="list-style-type:circle">
		<li><span style="font-size:14px">Both ovaries are normal in size, morphology and echotexture. </span></li>
		<li><span style="font-size:14px">No focal lesion is noted. </span></li>
	</ul>
	</li>
	<li><span style="font-size:14px"><strong><u>POD:&nbsp; </u></strong></span></li>
	<li style="list-style-type:none">
	<ul style="list-style-type:circle">
		<li><span style="font-size:14px">No collection noted. </span></li>
	</ul>
	</li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION</strong>: </span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal scan </strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-27T16:35:14.307' AS DateTime), 1, CAST(N'2019-01-08T14:21:57.850' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (173, N'Radiology', N'Arterial (Illiac Vessels)', N'Doppler Study of Illiac Vessels', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Doppler Study of Iliac Vessels</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><span style="font-size:14px">Both common, internal and external iliac arteries are normal in course, outline and caliber. &nbsp;Normal flow is seen in color and spectral Doppler study. Triphasicity is maintained. No plaques noted. No abnormal dilatation or constriction evident. Bilateral common, internal and external iliac veins are normal in course and show normal wall thickness. Normal antegrade flow is seen in color and spectral Doppler study. Respiratory phasicity is maintained. No thrombus is seen.&nbsp;</span></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Findings of Spectral Doppler Study is given below:</strong></span></p>

<table cellspacing="0" class="Table" style="border-collapse:collapse; border:undefined; margin-left:23.4pt">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>RIGHT</strong></span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>VESSELS</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>LEFT</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Common Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>External Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Internal Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong><u>IMPRESSION:</u></strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Arterial Doppler Study of the Lower Limb.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:11:41.153' AS DateTime), 1, CAST(N'2019-01-08T14:23:11.353' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (174, N'Radiology', N'Arterial (Lower Limbs)', N'Arterial Doppler Study (Left Lower Limb)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Arterial Doppler Study</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Left Lower Limb)</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">External iliac, common/superficial femoral, profunda femoris, popliteal artery and their branches are normal in course and caliber. Anterior and posterior tibial arteries were traced up to dorsalis pedis and retromalleolar area on the both sides. Triphasicity is maintained. No plaques noted. No abnormal dilatation or constriction evident.</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Findings of Spectral Doppler Study is given below:</strong></span></p>

<table cellspacing="0" class="Table" style="border-collapse:collapse; border:undefined; margin-left:23.4pt">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>VESSELS</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>LEFT</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>External Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; 63.8 cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Common Femoral Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;&nbsp; 106 &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Profunda Femoral Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; 46.7 &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Superficial Femoral Artery (Proximal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; 73.2 &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Superficial Femoral Artery (Distal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;67.9&nbsp; &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Popliteal Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; 37.7 &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Posterior Tibial Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; 33.9 cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Posterior Tibial Artery (Retromalleolar)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;32.2&nbsp; &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Anterior Tibial Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;17.5 &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Dorsalis Pedis Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;36.7&nbsp; &nbsp;cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Peroneal Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp;28.1 cm/sec</span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong><u>IMPRESSION:</u></strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Arterial Doppler Study of Left &nbsp;Lower Limb.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:13:42.937' AS DateTime), 1, CAST(N'2019-01-08T14:25:01.447' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (175, N'Radiology', N'Arterial - Upper Limbs', N'Peripheral Arterial Doppler Study - Upper Limbs', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Peripheral Arterial Doppler Study</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12px">(Upper Limbs)</span></div>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Right Upper Limb:</strong><strong> </strong>Brachio-cephalic artery is normal. Origin of the common carotid artery and vertebral artery is normal.&nbsp;Subclavian, axillary, brachial, radial and ulnar arteries are normal in course, calibre and luminal outline. Normal flow seen in both color and spectral doppler study with preserved triphasicity.</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Left Upper Limb:</strong><strong> </strong>Origin of the common carotid artery and vertebral artery is normal.&nbsp;Subclavian, axillary, brachial, radial and ulnar arteries are normal in course, calibre and luminal outline. Normal flow seen in both color and spectral doppler study with preserved triphasicity.</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Findings of Spectral Doppler Study is given below:</strong></span></p>

<table cellspacing="0" class="Table" style="border-collapse:collapse; border:undefined; margin-left:.7in">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>RIGHT</strong></span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>VESSELS</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>LEFT</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Subclavian Artery (Proximal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Subclavian Artery (Distal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Axillary Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Brachial Artery (Proximal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Brachial Artery (Distal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Ulnar Artery &nbsp;(Proximal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Ulnar Artery (Distal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Radial Artery &nbsp;(Proximal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Radial Artery (Distal)</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:2.75in">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong><u>COMMENT &amp; IMPRESSION:</u></strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Peripheral Arterial Doppler Study of the Both Upper Limbs.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:16:26.647' AS DateTime), 1, CAST(N'2019-01-08T14:26:12.173' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (176, N'Radiology', N'CD - Abdomen (Illiac Vessel)', N'Color Doppler Study Of Illiac Vessels', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>REPORT OF COLOR DOPPLER STUDY OF IlIAC VESSELS</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><strong><span style="font-size:16px">Findings:</span></strong></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Bilateral common, external and internal iliac arteries and veins are normal in course, outline and caliber. Normal triphasic flow is seen in iliac arteries. Normal antegrade venous flow is noted in iliac veins. No thrombus seen.&nbsp;</span></p>

<table cellspacing="0" class="Table" style="border-collapse:collapse; border:undefined; margin-left:23.4pt">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>RIGHT</strong></span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>VESSELS</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>LEFT</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Common Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>External Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
			<td style="vertical-align:top; width:261.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong>Internal Iliac Artery</strong></span></p>
			</td>
			<td style="vertical-align:top; width:99.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cm/sec</span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong> </span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><strong>Normal Study.</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:35:19.347' AS DateTime), 1, CAST(N'2019-01-08T14:27:36.557' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (177, N'Radiology', N'CD - Carotid Normal', N'Doppler Study of the Carotid & Vertebral Arteries', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Doppler Study of the Carotid &amp; Vertebral Arteries</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:10.0pt">B-mode, Color and Spectral Doppler Study of Common, External and Internal Carotid and Vertebral Arteries performed.</span></strong></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMAGING FINDINGS:</strong> </span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Both common, internal and external carotid arteries are normal in course and caliber. No intimo-medial complex thickening is noted on both sides (Rt= mm &amp; Lt= mm). No plaques seen. No abnormal narrowing or dilatation evident.&nbsp;</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Spectral Doppler shows normal waveforms and velocities. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Antegrade blood flow is seen in both vertebral arteries. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>SPECTRAL DOPPLER FINDINGS:</strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid black 1.0pt; margin-left:5.4pt; width:662px">
	<tbody>
		<tr>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:46.05pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>SIDE</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>PSV</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(CCA cm/sec)</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>EDV</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(CCA cm/sec)</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>PSV</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(ICA cm/sec)</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:63.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>EDV</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(ICA cm/sec)</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:55.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>SVR </strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(ICA/CCA)</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:53.55pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>DVR</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(ICA/CCA)</strong></span></p>
			</td>
			<td style="border-color:black; height:22.95pt; vertical-align:top; width:90.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>VERTEBRAL FLOW</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(cm/sec)</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:27.7pt; vertical-align:top; width:46.05pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>RIGHT</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:63.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:55.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:53.55pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:27.7pt; vertical-align:top; width:90.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Antegrade</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:32.45pt; vertical-align:top; width:46.05pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>LEFT</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:62.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:63.0pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:55.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:53.55pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
			<td style="height:32.45pt; vertical-align:top; width:90.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Antegrade</strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong></span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Consensus Panel Gray-Scale and Doppler US Criteria for Diagnosis of ICA Stenosis</strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid windowtext 1.0pt; margin-left:5.4pt; width:495.55pt">
	<tbody>
		<tr>
			<td rowspan="2" style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Degree of Stenosis (%)</strong></span></p>
			</td>
			<td colspan="2" style="height:13.5pt; vertical-align:top; width:196.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Primary Parameters</strong></span></p>
			</td>
			<td colspan="2" style="height:13.5pt; vertical-align:top; width:196.35pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Additional Parameters</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="height:.1in; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>ICA PSV (cm/sec)</strong></span></p>
			</td>
			<td style="height:.1in; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>Plaque Estimate (%)*</strong></span></p>
			</td>
			<td style="height:.1in; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>ICA/CCA PSV Ratio</strong></span></p>
			</td>
			<td style="height:.1in; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>ICA EDV (cm/sec)</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="height:14.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Normal</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;125</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">None</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;2.0</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;40</span></p>
			</td>
		</tr>
		<tr>
			<td style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;50</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;125</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;50</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;2.0</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&lt;40</span></p>
			</td>
		</tr>
		<tr>
			<td style="height:14.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">50-69</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">125-230</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&ge;50</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">2.0 &ndash; 4.0 </span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">40 &ndash; 100 </span></p>
			</td>
		</tr>
		<tr>
			<td style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&ge;70 but less than near occlusion </span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&gt;230</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&ge;50</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&gt;4.0</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&gt;100</span></p>
			</td>
		</tr>
		<tr>
			<td style="height:14.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Near occlusion</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">High, low, or undetectable</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Visible</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Variable</span></p>
			</td>
			<td style="height:14.25pt; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Variable</span></p>
			</td>
		</tr>
		<tr>
			<td style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Total occlusion</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:84.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Undetectable</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Visible, no detectable lumen</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Not applicable</span></p>
			</td>
			<td style="height:13.5pt; vertical-align:top; width:93.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Not applicable</span></p>
			</td>
		</tr>
		<tr>
			<td colspan="5" style="height:13.5pt; vertical-align:top; width:495.55pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">* Plaque estimate (diameter reduction) with gray-scale and color Doppler US</span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>COMMENT &amp; IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal B-mode, Color and Spectral Doppler Study of the Carotid Arteries. Antegrade blood flow in both vertebral arteries.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:38:10.670' AS DateTime), 1, CAST(N'2019-01-08T14:31:35.390' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (178, N'Radiology', N'CD - Abdomen (f)', N'CD - Abdomen (female)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>REPORT OF THE ABDOMINAL &amp;&nbsp; PELVIC ULTRASOUND WITH </strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>COLOR DOPPLER STUDY OF THE PORTAL SYSTEM</strong></span></u></div>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">LIVER:</span></strong> <span style="font-size:11.0pt">Liver is normal in size, regular in outline with </span><span style="font-size:11.0pt">&nbsp;echogenicity and homogenous parenchymal echotexture. No space occupying lesion is seen. </span><span style="font-size:11.0pt">Intrahepatic bile ducts are not dilated.</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">DOPPLER STUDY OF THE PORTAL SYSTEM:</span></strong> <strong><span style="font-size:11.0pt">Portal vein is normal in caliber and show normal antegrade blood flow. Hepatic veins are normal. IVC is also normal in course and caliber with normal antegrade blood flow.</span></strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">GALLBLADDER:</span></strong> <span style="font-size:11.0pt">Normal in size measuring</span> <span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm longitudinally</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm transversely at the level of fundus. Normal wall thickness. No calculus evident.</span> <span style="font-size:11.0pt">&nbsp; &nbsp;&nbsp;</span></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">COMMON BILE DUCT:</span></strong> <span style="font-size:11.0pt">Measures approximately</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">&nbsp;mm in caliber. No calculi seen.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">PANCREAS:</span></strong> <span style="font-size:11.0pt">Normal in size. Echotexture is homogenous. No SOL seen.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">SPLEEN:</span></strong> <span style="font-size:11.0pt">Normal in size measuring </span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm in long axis. Homogenous echotexture. No SOL.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:medium"><strong>RIGHT</strong><strong> KIDNEY: </strong>Right kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is . No SOL. No calculi seen. No hydronephrotic changes.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">LEFT KIDNEY:</span></strong> <span style="font-size:11.0pt">Left kidney measures approximately</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is </span><span style="font-size:11.0pt">. No SOL. No calculi seen. No hydronephrotic changes.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
</ul>

<h5 style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>PELVIC SCAN</strong></span></h5>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">URINARY BLADDER:</span></strong> <span style="font-size:11.0pt">Urinary bladder is normal in outline, distensibility and wall thickness. No calculus evident.</span><strong> </strong><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><strong> </strong><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">UTERUS:</span></strong> <span style="font-size:11.0pt">Anteverted normal size uterus measuring approximately</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm longitudinally</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm antero-posteriorly</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm transversely at the level of fundus. Outline is regular. Normal endometrial echocomplex. No SOL.</span> <span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">ADNEXAE:</span></strong>&nbsp;<span style="font-size:11.0pt"> Both ovaries are normal.No mass noted in adnexal area.</span> <span style="font-size:11.0pt">&nbsp; &nbsp; &nbsp;</span> &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt">No <span style="font-size:11.0pt">collection in POD.</span></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt">No <span style="font-size:11.0pt">free fluid is seen in peritoneal cavity.</span></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><span style="font-size:11.0pt">No retroperitoneal or mesenteric lymphadenopathy.</span> </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><span style="font-size:11.0pt">Psoas muscles and the muscular plane are normal in both sides.</span></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong> </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Abdominal and Pelvic Scan.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Doppler Study of the Portal System. No evidence to suggest IVC Obstruction.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:50:11.757' AS DateTime), 1, CAST(N'2019-01-08T14:34:07.377' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (179, N'Radiology', N'CD - Abdomen (m)', N'CD - Abdomen (male)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>REPORT OF THE ABDOMINAL &amp;&nbsp; PELVIC ULTRASOUND WITH </strong></u></span></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>COLOR DOPPLER STUDY OF THE PORTAL SYSTEM</strong></u></span></div>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">LIVER:</span></strong> <span style="font-size:11.0pt">Liver is normal in size, regular in outline with </span><span style="font-size:11.0pt">&nbsp;echogenicity and homogenous parenchymal echotexture. No space occupying lesion is seen. </span><span style="font-size:11.0pt">Intrahepatic bile ducts are not dilated.</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">DOPPLER STUDY OF THE PORTAL SYSTEM:</span></strong> <strong><span style="font-size:11.0pt">Portal vein is normal in caliber and show normal antegrade blood flow. Hepatic veins are normal. IVC is also normal in course and caliber with normal antegrade blood flow.</span></strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">GALLBLADDER:</span></strong> <span style="font-size:11.0pt">Normal in size measuring</span> <span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm longitudinally</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm transversely at the level of fundus. Normal wall thickness. No calculus evident.</span></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">COMMON BILE DUCT:</span></strong> <span style="font-size:11.0pt">Measures approximately</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">&nbsp;mm in caliber. No calculi seen.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">PANCREAS:</span></strong> <span style="font-size:11.0pt">Normal in size. Echotexture is homogenous. No SOL seen.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">SPLEEN:</span></strong> <span style="font-size:11.0pt">Normal in size measuring </span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm in long axis. Homogenous echotexture. No SOL.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">RIGHT KIDNEY:</span></strong> <span style="font-size:11.0pt">Right kidney measures approximately</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is </span><span style="font-size:11.0pt">. No SOL. No calculi seen. No hydronephrotic changes.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">LEFT KIDNEY:</span></strong> <span style="font-size:11.0pt">Left kidney measures approximately</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is </span><span style="font-size:11.0pt">. No SOL. No calculi seen. No hydronephrotic changes.</span></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>PELVIC SCAN</strong></span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">URINARY BLADDER:</span></strong> <span style="font-size:11.0pt">Urinary bladder is normal in outline, distensibility and wall thickness. No calculus evident.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">PROSTATE:</span></strong> <span style="font-size:11.0pt">Prostate is normal in outline and measures </span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="font-size:11.0pt">cm in size, which corresponds approximately to</span><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <span style="font-size:11.0pt">grams in weight.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong> </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt">No <span style="font-size:11.0pt">free fluid is seen in peritoneal cavity.</span></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><span style="font-size:11.0pt">No retroperitoneal or mesenteric lymphadenopathy.</span> </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><span style="font-size:11.0pt">Psoas muscles and the muscular plane are normal in both sides.</span></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Abdominal and Pelvic Scan.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Doppler Study of the Portal System. No evidence to suggest IVC Obstruction.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T11:55:40.063' AS DateTime), 1, CAST(N'2019-01-08T14:36:14.633' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (180, N'Radiology', N'CD - Renal Artery', N'CD - Renal Artery', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Doppler Study of the Renal Arteries</strong></span></u></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>RIGHT KIDNEY:</strong> Right kidney measures approximately7.1x4.7cmcm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is normal. No SOL. No calculi seen. No hydronephrotic changes.<strong>&nbsp; </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LEFT KIDNEY:</strong> Left kidney measures approximately7.7x3.7cm cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is normal. No SOL. No calculi seen. No hydronephrotic changes.</span></li>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SUPRA RENAL AREA:</strong> No mass or calcification seen.</span></li>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>ABDOMINAL AORTA &amp; RENAL ARTERIES:</strong> Normal intimo-medial complex is noted in the aorta, which is normal in course and caliber. Ostium of the both renal arteries was identified with normal blood flow and spectral doppler pattern.<strong> </strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Doppler velciometric findings in Proximal and Distal Renal Artery Segments are given below:&nbsp;</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Proximal Renal Artery</span></strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid black 1.0pt; margin-left:5.4pt; width:495.55pt">
	<tbody>
		<tr>
			<td style="border-color:black; vertical-align:top; width:168.3pt">
			<h1 style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:9pt"><span style="font-size:11.0pt">Parameters</span></span></h1>
			</td>
			<td style="border-color:black; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Right Renal Artery</span></strong></span></p>
			</td>
			<td style="border-color:black; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Left Renal Artery</span></strong></span></p>
			</td>
			<td style="border-color:black; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Normal</span></strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:26.25pt; vertical-align:top; width:168.3pt">
			<h2 style="margin-left:0in; margin-right:0in"><span style="font-size:10pt"><span style="font-size:11.0pt">Peak Systolic Velocity</span></span></h2>
			</td>
			<td style="height:26.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">103</span></strong></span></p>
			</td>
			<td style="height:26.25pt; vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">133</span></strong></span></p>
			</td>
			<td style="height:26.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">&lt;150 cm/sec.</span></strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; vertical-align:top; width:168.3pt">
			<p style="margin-left:0in; margin-right:0in; text-align:left"><span style="font-size:10pt"><strong><span style="font-size:11.0pt">Renal Aortic Ratio</span></strong></span></p>

			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:102.85pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">&lt;3.5</span></strong></span></p>

			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
	</tbody>
</table>

<h4 style="margin-left:0in; margin-right:0in">&nbsp;</h4>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Distal/Intrarenal Artery</span></strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid windowtext 1.0pt; margin-left:5.4pt; width:657px">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<h1 style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:9pt"><span style="font-size:11.0pt">Parameters</span></span></h1>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Right Renal Artery</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Left Renal Artery</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Normal</span></strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="height:3.5pt; vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Flow Pattern</span></strong></span></p>
			</td>
			<td style="height:3.5pt; vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Low resistence</span></span></p>
			</td>
			<td style="height:3.5pt; vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Low resistence</span></span></p>
			</td>
			<td style="height:3.5pt; vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Low resistence</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Peak Systolic Velocity</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">49 </span><span style="font-size:11.0pt">cm/sec.</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">43</span><span style="font-size:11.0pt">cm/sec.</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&gt;20-30 cm/sec</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Doppler Wave form</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Normal</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Normal</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Normal</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Resistive Index (RI)</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">0.63</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">0.60</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Difference between RI</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&lt;5%</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Early Systolic Acceleration</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">977 cm/sec2</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">1042 cm/sec2</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&gt;3.0 m/sec2</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Acceleration time of the Systolic Peak</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">0.05</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">0.04</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&lt;0.07 sec.</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Acceleration Index (AI)</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&gt;4.0</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">AI Difference</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> </span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&lt;5%</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">ESP</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Present</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Present</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Present</span></span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Renal Artery Doppler Study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:11:23.650' AS DateTime), 1, CAST(N'2019-01-08T14:37:31.397' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (181, N'Radiology', N'CD - Venous (LL)', N'CD - Venous (LL)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Peripheral Venous Doppler Study</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px">(Lower Limbs)&nbsp;</span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>RIGHT LOWER LIMB:</strong> </span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Common/external iliac, common/superficial femoral, saphenous, popliteal vein and it&#39;s tributaries are normal in outline and wall thickness. All these veins are compressible and show normal venous blood flow in both color and spectral Doppler study. </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Respiratory phasicity is maintained.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No thrombus evident.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>LEFT LOWER LIMB:</strong> </span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Common/external iliac, common/superficial femoral, saphenous, popliteal vein and it&#39;s tributaries are normal in outline and wall thickness. All these veins are compressible and show normal venous blood flow in both color and spectral Doppler study.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Respiratory phasicity is maintained.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No thrombus evident.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Doppler Study of the Deep Venous System of Lower Limbs.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:22:57.527' AS DateTime), 1, CAST(N'2019-01-08T14:39:48.397' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (182, N'Radiology', N'CD - Venous (UL)', N'CD - Venous (UL)', N'<div style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>Peripheral Venous Doppler Study</strong></span></u></div>

<div style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:14px"><strong>(Upper Limbs)&nbsp;</strong></span></div>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>Findings:</strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>RIGHT UPPER LIMB:</strong> </span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Subclavian, axillary, brachial, radial and ulnar veins are normal in course, calibre and luminal outline. </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">All these veins are compressible and show normal venous blood flow in both color and spectral Doppler study.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No thrombus evident.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>LEFT UPPER LIMB: </strong></span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Subclavian, axillary, brachial, radial and ulnar veins are normal in course, calibre and luminal outline.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">All these veins are compressible and show normal venous blood flow in both color and spectral Doppler study.</span></li>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No thrombus evident. </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Doppler Study of the Deep Venous System of Upper Limbs.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:24:19.080' AS DateTime), 1, CAST(N'2019-01-08T14:41:27.307' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (183, N'Radiology', N'CD - Graft Kidney', N'CD - Graft Kidney', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>Doppler Study of the Graft Renal Artery</strong></u></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Doppler velciometric findings in Proximal and Distal Renal Artery Segments are given below:&nbsp;</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Proximal Renal Artery</strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid black 1.0pt; margin-left:5.4pt; width:392.7pt">
	<tbody>
		<tr>
			<td style="border-color:black; vertical-align:top; width:168.3pt">
			<h1 style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:9pt"><span style="font-size:11.0pt">Parameters</span></span></h1>
			</td>
			<td style="border-color:black; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Graft kidney renal artery</span></strong></span></p>
			</td>
			<td style="border-color:black; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Normal</span></strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="border-color:black; height:26.25pt; vertical-align:top; width:168.3pt">
			<h2 style="margin-left:0in; margin-right:0in"><span style="font-size:10pt"><span style="font-size:11.0pt">Peak Systolic Velocity</span></span></h2>
			</td>
			<td style="height:26.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></strong></span></p>
			</td>
			<td style="height:26.25pt; vertical-align:top; width:112.2pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">&lt;150 cm/sec.</span></strong></span></p>
			</td>
		</tr>
	</tbody>
</table>

<h4 style="margin-left:0in; margin-right:0in">&nbsp;</h4>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Distal/Intrarenal Artery</span></strong></span></p>

<table border="1" cellspacing="0" class="Table" style="border-collapse:collapse; border:solid windowtext 1.0pt; margin-left:5.4pt; width:519px">
	<tbody>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<h1 style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:9pt"><span style="font-size:11.0pt">Parameters</span></span></h1>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Graft kidney renal artery</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Normal</span></strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="height:3.5pt; vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Flow Pattern</span></strong></span></p>
			</td>
			<td style="height:3.5pt; vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Low resistence</span></span></p>
			</td>
			<td style="height:3.5pt; vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Low resistence</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Peak Systolic Velocity</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <span style="font-size:11.0pt">cm/sec.</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&gt;20-30 cm/sec</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Doppler Wave form</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Normal</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">Normal</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Resistive Index (RI)</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&gt;0.56</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Difference between RI</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&lt;5%</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Acceleration time of the Systolic Peak</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&lt;0.07 sec.</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:155.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:12pt"><strong><span style="font-size:11.0pt">Acceleration Index (AI)</span></strong></span></p>
			</td>
			<td style="vertical-align:top; width:129.65pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span></p>
			</td>
			<td style="vertical-align:top; width:103.9pt">
			<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:12pt"><span style="font-size:11.0pt">&gt;4.0</span></span></p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><strong>Normal Study.</strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:26:36.933' AS DateTime), 1, CAST(N'2019-01-08T14:42:36.400' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (184, N'Radiology', N'RD - Kidney (m)', N'RD - Kidney (male)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>REPORT OF THE ABDOMINAL &amp;&nbsp; PELVIC ULTRASOUND WITH </strong></span></u></p>

<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>DOPPLER STUDY OF TRANSPLANT KIDNEY</strong></span></u></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LIVER:</strong> Liver is normal in size, regular in outline with normal echogenicity and homogenous parenchymal echotexture. No space occupying lesion is seen. Portal vein is normal in caliber and show normal antegrade blood flow. Hepatic veins are normal. Intrahepatic bile ducts are not dilated.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>GALLBLADDER:</strong> Normal in size measuring &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm longitudinally&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm transversely at the level of fundus. Normal wall thickness. No calculus evident.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>COMMON BILE DUCT:</strong> Measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mm in caliber. No calculi seen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>PANCREAS:</strong> Normal in size. Echotexture is homogenous. No SOL seen. &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size measuring &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in long axis. Homogenous echotexture. No SOL.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>RIGHT KIDNEY:</strong> Right kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is decreased. Parenchymal echogenicity is increased. No SOL. No calculi seen. No hydronephrotic changes.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LEFT KIDNEY:</strong> Left kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is decreased. Parenchymal echogenicity is increased. No SOL. No calculi seen. No hydronephrotic changes. &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>GRAFT KIDNEY IN RIGHT/LEFT ILIAC FOSSA:</strong> <strong>Transplant kidney measures approximately</strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is normal. No SOL. No calculi seen. No peri and para-renal collection. No hydronephrotic changes.</strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SUPRARENAL AREA:</strong> No mass or calcification seen.<strong>&nbsp;</strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>ABDOMINAL AORTA:</strong><strong> </strong>Normal in course, calibre and luminal outline.</span></li>
</ul>

<h1 style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>DOPPLER STUDY OF THE TRANSPLANT KIDNEY: </strong></span></h1>

<ul>
	<li>
	<h1 style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Doppler study show normal main renal artery of the transplant kidney with normal blood flow.</strong><strong> </strong><strong>Spectral doppler show normal wave form with peak systolic velocity of </strong><strong>&nbsp;</strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>respectively. </strong></span></h1>
	</li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Intrarenal interlobar artery shows peak systolic velocity of<strong> </strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>respectively.</strong><strong> </strong><strong>Acceleration time of the systolic peak </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec.</strong><strong> </strong><strong>Early systolic acceleration is </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;m/sec2.</strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Power doppler study showed normal perfussion pattern.</strong></span></li>
</ul>

<h1 style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>PELVIC SCAN</strong></span></h1>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>URINARY BLADDER:</strong> Urinary bladder is normal in outline, distensibility and wall thickness. No calculus evident.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>PROSTATE:</strong> Prostate is normal in outline and measures &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size, which corresponds approximately to&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; grams in weight.<strong>&nbsp;</strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No free fluid is seen in peritoneal cavity.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No retroperitoneal or mesenteric lymphadenopathy. </span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Psoas muscles and the muscular plane are normal in both sides.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Advanced medical renal disease in native kidney. Otherwise normal abdominal and pelvic scan.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Normal Renal Doppler study of the Graft Kidney.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:32:47.020' AS DateTime), 1, CAST(N'2019-01-08T14:44:51.177' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (185, N'Radiology', N'RD - Female', N'RD - Female', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>REPORT OF THE ABDOMINAL &amp;&nbsp; PELVIC ULTRASOUND WITH RENAL DOPPLER STUDY</strong></span></u></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LIVER:</strong> Liver is normal in size, regular in outline with &nbsp;echogenicity and homogenous parenchymal echotexture. No space occupying lesion is seen. Portal vein is normal in caliber and show normal antegrade blood flow. Hepatic veins are normal. Intrahepatic bile ducts are not dilated.<strong> &nbsp; &nbsp; </strong>&nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>GALLBLADDER:</strong> Normal in size measuring &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm longitudinally&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm transversely at the level of fundus. Normal wall thickness. No calculus evident. &nbsp; &nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>COMMON BILE DUCT:</strong> Measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mm in caliber. No calculi seen. &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>PANCREAS:</strong> Normal in size. Echotexture is homogenous. No SOL seen. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size measuring &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in long axis. Homogenous echotexture. No SOL. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>RIGHT KIDNEY:</strong> Kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is. No SOL. No calculi seen. No hydronephrotic changes. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LEFT KIDNEY:</strong> Kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is . No SOL. No calculi seen. No hydronephrotic changes. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SUPRA RENAL AREA:</strong> No mass or calcification seen. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>ABDOMINAL AORTA:</strong> Normal in course, calibre &nbsp;luminal outline.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>RENAL DOPPLER STUDY:</strong> </span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Doppler study shows normal both main renal arteries with normal blood flow. Spectral doppler shows &nbsp;resistent flow and normal wave form with peak systolic velocity of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the left side and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the right and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the left side. </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Intrarenal interlobar artery shows peak systolic velocity of<strong> </strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the left and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the left side respectively. </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Acceleration time of the systolic peak is &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec. on the right and </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec. on the left side. Early systolic acceleration is </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>m/sec2 on the right and </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>m/sec2 on the left side.&nbsp; </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Peak systolic velocity in abdominal aorta is &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>cm/sec. </strong></span></li>
</ul>

<h1 style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>PELVIC SCAN</strong></span></h1>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>URINARY BLADDER:</strong> Urinary bladder is normal in outline, distensibility and wall thickness. No calculus evident.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong> </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>UTERUS:</strong> Anteverted, normal size uterus measuring approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm longitudinally&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm antero-posteriorly&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm transversely at the level of fundus. Outline is regular. Normal endometrial echocomplex. No SOL.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>
</ul>

<h1 style="margin-left:0in; margin-right:0in; text-align:left"><span style="font-size:14px"><strong>ADNEXAE</strong>: &nbsp;</span></h1>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">No mass noted in adnexal area .</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No collection in POD.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid is seen in peritoneal cavity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No retroperitoneal or mesenteric lymphadenopathy. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Psoas muscles and the muscular plane are normal in both sides.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal abdominal and pelvic scan.</span></strong></li>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal renal doppler study. No evidence to suggest renal artery stenosis.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:37:52.650' AS DateTime), 1, CAST(N'2019-01-08T14:47:13.927' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (186, N'Radiology', N'RD - Male (Normal)', N'RD - Male (Normal)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>REPORT OF THE ABDOMINAL &amp;&nbsp; PELVIC ULTRASOUND WITH RENAL DOPPLER STUDY</strong></span></u></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LIVER:</strong> Liver is normal in size, regular in outline with &nbsp;echogenicity and homogenous parenchymal echotexture. No space occupying lesion is seen. Portal vein is normal in caliber and show normal antegrade blood flow. Hepatic veins are normal. Intrahepatic bile ducts are not dilated.<strong> &nbsp; &nbsp; </strong>&nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>GALLBLADDER:</strong> Normal in size measuring &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm longitudinally&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm transversely at the level of fundus. Normal wall thickness. No calculus evident. &nbsp; &nbsp;&nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>COMMON BILE DUCT:</strong> Measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mm in caliber. No calculi seen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>PANCREAS:</strong> Normal in size. Echotexture is homogenous. No SOL seen.</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SPLEEN:</strong> Normal in size measuring &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in long axis. Homogenous echotexture. No SOL. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>RIGHT KIDNEY:</strong> Kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is . No SOL. No calculi seen. No hydronephrotic changes. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LEFT KIDNEY:</strong> Kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is . No SOL. No calculi seen. No hydronephrotic changes. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SUPRA RENAL AREA:</strong> No mass or calcification seen. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:12pt"><span style="font-size:14px"><strong>ABDOMINAL AORTA:</strong> Normal in course, calibre luminal outline.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp; </span></li>
</ul>

<h1 style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>RENAL DOPPLER STUDY: </strong></span></h1>

<ul>
	<li>
	<h1 style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>Doppler study shows normal both main renal arteries with normal blood flow. Spectral doppler shows </strong><strong>&nbsp;resistent flow and normal wave form with peak systolic velocity of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the left side and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the right and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the left side. </strong></span></h1>
	</li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Intrarenal interlobar artery shows peak systolic velocity of<strong> </strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the left and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the left side respectively. </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Acceleration time of the systolic peak is &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec. on the right and </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec on the left side. Early systolic acceleration is </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>m/sec2 on the right and </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>m/sec2 on the left side.&nbsp; </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Peak systolic velocity in abdominal aorta is &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm/sec.</strong></span></li>
</ul>

<h1 style="margin-left:0in; margin-right:0in; text-align:center"><strong><span style="font-size:11pt"><span style="font-size:12.0pt">PELVIC SCAN</span></span></strong></h1>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>URINARY BLADDER:</strong> Urinary bladder is normal in outline, distensibility and wall thickness. No calculus evident.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px"><strong>PROSTATE:</strong> </span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Prostate is normal in outline and measures &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size, which corresponds approximately to&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; grams in weight. &nbsp; &nbsp; <strong>&nbsp;</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px">No free fluid is seen in peritoneal cavity.</span></li>
	<li style="text-align:justify"><span style="font-size:14px">No retroperitoneal or mesenteric lymphadenopathy. </span></li>
	<li style="text-align:justify"><span style="font-size:14px">Psoas muscles and the muscular plane are normal in both sides.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal abdominal and pelvic scan.</span></strong></li>
	<li style="text-align:justify"><strong><span style="font-size:14px">Normal renal doppler study. No evidence to suggest renal artery stenosis.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:42:10.223' AS DateTime), 1, CAST(N'2019-01-08T14:49:12.883' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (187, N'Radiology', N'CD - Renal Doppler', N'CD - Renal Doppler', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><u><strong>REPORT OF RENAL DOPPLER STUDY</strong></u></span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>RIGHT KIDNEY:</strong> Right kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is normal. No SOL. No calculi seen. No hydronephrotic changes. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>LEFT KIDNEY:</strong> Left kidney measures approximately&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm in size. Outline is smooth and regular. Cortical thickness is normal. Parenchymal echogenicity is normal. No SOL. No calculi seen. No hydronephrotic changes. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>SUPRA RENAL AREA:</strong> No mass or calcification seen. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>ABDOMINAL AORTA:</strong> Normal in course, calibre and luminal outline.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:12pt"><strong>RENAL DOPPLER STUDY:</strong><strong> </strong></span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Doppler study shows normal both main renal arteries with normal blood flow. Spectral doppler shows low resistent flow and normal wave form with peak systolic velocity of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the left side and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the right and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the left side. </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Intrarenal interlobar artery shows peak systolic velocity of<strong> </strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>cm/sec on the left and resistive index of</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the right side and</strong><strong> </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong> </strong><strong>on the left side respectively. </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Acceleration time of the systolic peak is &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec. on the right and </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>sec on the left side. </strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </strong></span></li>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Peak systolic velocity in abdominal aorta is &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cm/sec.</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION:</strong>&nbsp;</span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px">Normal Study.</span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T14:43:44.063' AS DateTime), 1, CAST(N'2019-01-08T14:50:06.707' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (188, N'Radiology', N'USG - Anamoly (new)', N'USG - Fetal Anamoly Scan (new)', N'<p style="text-align:center"><u><span style="font-size:20px"><strong>TARGETED IMAGING FOR FETAL ANOMALIES/TIFFA (FETAL ANOMALY SCAN)</strong></span></u></p>

<p><strong><span style="font-size:16px">Findings:</span></strong></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Single live intrauterine fetus with normal fetal movement and cardiac activity.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>BPD, HC, AC, FL corresponds to &nbsp;&nbsp;weeks daysof gestation with EFW of&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;gms.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Placenta is &nbsp;&nbsp;anterior upper</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Fetal lie: Cephalic/ &nbsp;&nbsp;Breech/ &nbsp;&nbsp;Transverse</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Amniotic fluid:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Adequate/&nbsp; Inadequate</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Uterus and bilateral Adnexa are unremarkable.</strong></span></li>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Cervical length &nbsp;cm</strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Morphologic assessment:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;[N: Normal; Abn: Abnormal; NA: Not Assessed]</strong></span></p>

<table cellspacing="0" class="MsoTableGrid" style="border-collapse:collapse; border:none; width:624px">
	<tbody>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Fetal head</strong></span></p>
			</td>
			<td colspan="4" style="vertical-align:top; width:230.35pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Fetal heart and chest</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="height:6.7pt; vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Fetal skull integrity&nbsp; </span></span></p>
			</td>
			<td style="height:6.7pt; vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="height:6.7pt; vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="height:6.7pt; vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="height:6.7pt; vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Fetal heart rate</span></span></p>
			</td>
			<td colspan="3" style="height:6.7pt; vertical-align:top; width:76.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">&nbsp;. bpm</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Ventricles and choroid plexus</span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Cardiac situs</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Septum pellucidum</span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">4 chamber view</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Cerebellum and Cisterna magna</span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">3 vessel view</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Diaphragm</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Fetal face</strong></span></p>
			</td>
			<td colspan="4" style="vertical-align:top; width:230.35pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Fetal abdomen</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Profile </span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Stomach</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Orbits</span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Kidneys</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Upper lip and nose</span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abdominal wall</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Bladder</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Fetal musculoskeletal system</strong></span></p>
			</td>
			<td colspan="4" style="vertical-align:top; width:230.35pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Umbilical cord</strong></span></p>
			</td>
		</tr>
		<tr>
			<td style="vertical-align:top; width:166.25pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Spine and overlying skin </span></span></p>
			</td>
			<td style="vertical-align:top; width:17.9pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.1pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:26.15pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abdominal wall insertion</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Both hands&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Present&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp; Absent</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">3 vessel cord</span></span></p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">N</span></span></p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Abn</span></span></p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">NA</span></span></p>
			</td>
		</tr>
		<tr>
			<td colspan="4" style="vertical-align:top; width:237.4pt">
			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-size:10.0pt">Both feet&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Present&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp; Absent</span></span></p>
			</td>
			<td style="vertical-align:top; width:153.85pt">
			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:.25in">
			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:31.5pt">
			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
			<td style="vertical-align:top; width:27.0pt">
			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
			</td>
		</tr>
	</tbody>
</table>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong>Comments:</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;...........................</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;...........................</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt">&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;...........................</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li style="text-align:justify"><span style="font-size:14px"><strong>Single live intrauterine fetus of&nbsp; &nbsp;&nbsp;&nbsp;weeks 3daysof gestation with Normal targeted imaging for fetal anomalies.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T15:47:39.720' AS DateTime), 1, CAST(N'2019-01-08T14:50:25.883' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (189, N'Radiology', N'Antegrade Pyelogram', N'Antegrade Pyelogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: Antegrade pyelogram</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong><u>PROCEDURE NOTE</u>:</strong></span><span style="font-size:14px"><strong> </strong>Under all aseptic precautions,the contrast was instilled into the percutaneous nephrostomy tube and the serial images were taken.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ul>
	<li><span style="font-size:11pt"><strong><span style="font-size:12.0pt">Pyelogram</span></strong><span style="font-size:12.0pt">: B/L </span><span style="font-size:12.0pt">&nbsp;pelvicalyceal system are normal in outline including normal calyceal cupping pattern. No filling defect noted.</span></span></li>
	<li><span style="font-size:11pt"><strong><span style="font-size:12.0pt">Ureters</span></strong><span style="font-size:12.0pt">: </span><span style="font-size:12.0pt">B/L ureters are&nbsp; normal in course, outline and caliber. No e/o any filling defect or outpouching noted.</span> </span></li>
	<li><span style="font-size:11pt"><strong><span style="font-size:12.0pt">Urinary Bladder</span></strong><span style="font-size:12.0pt">: </span><span style="font-size:12.0pt">Normal in outline and distensibility. No evidence of any filling defect or outpouching noted. No significant amount of residual volume noted in post micturition film.</span></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal study</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:11:45.540' AS DateTime), 1, CAST(N'2019-01-08T14:53:24.993' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (190, N'Radiology', N'Barium Enema', N'Barium Enema', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: Double Contrast Barium Enema Study</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong><u>PROCEDURE NOTE</u>:</strong></span><span style="font-size:14px"><strong> </strong>Tube of enema kit was inserted in the anal canal and balloon was inserted with 15ml of fluid. Approximately 150ml of barium suspension was slowly instilled under fluoroscopic guidance till it reaches the mid part of transverse colon. Then air was intermittently pushed as a double contrast and spot films were taken in anteroposterior, lateral and oblique positions.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Rectum, rectosigmoid junction, descending colon , transverse colon, ascending colon and descending colon are normal in caliber with regular smooth margin with normal haustrations . No evidence of any focal lesion, narrowing or contrast extravasations.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><strong><span style="font-size:14px">Normal barium double contrast study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:16:51.590' AS DateTime), 1, CAST(N'2019-01-08T14:53:48.033' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (191, N'Radiology', N'Barium Meal', N'Barium Meal', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: BARIUM MEAL STUDY</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in; text-align:center">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>PROCEDURE NOTE</strong></span><span style="font-size:14px"><strong>: </strong>Effervescent agent was given to swallow. Then approximately 100 ml of 250 % of barium was given to the patient in left lateral position. Patient was rotated evenly to coat the stomach with barium. Then spot images were taken in right anterior oblique, right posterior oblique, right lateral and left lateral positions, prone. Contrast was allowed to pass to duodenum and spot images were taken with compression pads.</span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ul>
	<li style="text-align: justify; margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>All parts of the stomach appear normal in outline and caliber. Normal stellate folds were seen in gastric cardia radiating to gastroesophageal junction. Rugal folds and areae gastrice appears normal in size and morphology in gastric fundus and body. There is normal distensibility of antro-pyloric region of stomach with passage contrast to distal small bowel loops. Pyloric region of stomach appears normal. No stricture, filling defect or extravasation is noted. </strong></span></li>
</ul>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>
', NULL, NULL, 1, CAST(N'2018-12-28T16:17:52.967' AS DateTime), 1, CAST(N'2019-01-08T14:55:20.577' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (192, N'Radiology', N'Barium Swallow', N'Barium Swallow', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: Barium Swallow</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>PROCEDURE NOTE: </strong></span></p>

<p style="margin-left:0in; margin-right:0in; text-align:justify"><span style="font-size:14px">Control film is taken. &nbsp;Patient is asked to take ample mouthful of barium and is asked to swallow the contrast. Spot films are taken at the rate 6 frame per second in patient standing upright in Left posterior oblique and lateral position. Spot films are taken of upper and lower esophagus each time after the patient takes the contrast. Spot films were also taken in AP position with patient swallowing contrast and saying &lsquo;EEEE&rdquo;. Films, primarily of thoracic and abdominal part of esophagus were also taken with patient in prone position and supine position.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings in barium swallow: </strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Hypopharynx, cervical and thoracic esophagus appears normal in caliber and outline. </span></li>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No abnormal outpouching or abnormal narrowing noted. No extravasation of contrast noted and no communication with trachea is noted.&nbsp; </span></li>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No evidence of hiatus hernia or reflux noted. Normal peristalsis noted with no abnormal motility.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal barium swallow study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:19:47.183' AS DateTime), 1, CAST(N'2019-01-08T15:16:16.990' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (193, N'Radiology', N'Distal Loopogram', N'Distal Loopogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE:&nbsp; Distal Loopogram</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:12.0pt"><span style="font-size:16px">PROCEDURE NOTE:</span> </span></strong><span style="font-size:14px">Ileostomy site in right iliac fossa was noted. Foleys catheter was inserted via the distal loop into the ascending colon and was inflated with 15ml of air. After that barium suspension was instilled slowly via the catheter under fluoroscopic guidance. Spot films were taken in supine position.</span></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS:</strong> </span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">There is opacification of ascending colon, transverse colon, descending colon, sigmoid and rectum and anal canal distal to the catheter noted with normal outline. No abnormal dilatation, stricture or filling defect noted. No evidence of extravasations of contrast noted.&nbsp;</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION</strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Normal distal loopogram study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:21:38.397' AS DateTime), 1, CAST(N'2019-01-08T15:17:24.957' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (194, N'Radiology', N'Fistulogram', N'Fistulogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: &nbsp;&nbsp;Fistulogram</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>PROCEDURE NOTE: </strong></span><span style="font-size:14px">Small opening is noted at perianal region at 4 &lsquo;o&rsquo;clock position through which serous discharge was noted. &nbsp;Under all aseptic precautions and fluoroscopic guidance, contrast was instilled into the perianal opening via a cannula. After that spot films were taken in posteroanterior, lateral and bilateral oblique positions. </span><span style="font-size:11pt"><strong>&nbsp; &nbsp;&nbsp;</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>Findings: &nbsp;</strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;">&nbsp;</li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:25:43.593' AS DateTime), 1, CAST(N'2019-01-08T15:18:32.033' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (195, N'Radiology', N'Gastrograffin', N'Gastrograffin Follow Through', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: GASTROGRAFFIN FOLLOW THROUGH</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:12.0pt"><span style="font-size:16px">PROCEDURE NOTE:</span> <span style="font-size:14px">Approximately 500 ml of gastrograffin was given to the patient. Spot films were taken at successive 20 minutes interval for 1 hour and then every 30 mins for 1hour then hourly for the next 3 hours.</span></span></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Normal contrast opacification is noted in duodenum, jejunum, and in distal ileal loops. DJ flexure appears normal and is located in left side, left of the spine. Ileocecal junction appears normal in morphology and is noted in right side. No filling defect or narrowing is noted within. No abnormal outpouching or abnormal narrowing noted. No extravasation of contrast noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:28:08.083' AS DateTime), 1, CAST(N'2019-01-08T15:22:02.660' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (196, N'Radiology', N'Gastrograffin Enema', N'Gastrograffin Enema', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE:&nbsp; Gastrograffin enema&nbsp;</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:16px">PROCEDURE NOTE:</span> <span style="font-size:14px">8 F Foleys catheter was inserted in the lower anal canal and 100ml of contrast instilled slowly via the catheter under fluoroscopic guidance till it reached the ascending colon and spot films were taken in anteroposterior, lateral and oblique positions.</span></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">Rectum, rectosigmoid junction, sigmoid colon, descending colon, transverse colon and ascending colon are normal in caliber with regular smooth margins with normal haustrations. No evidence of any focal lesion, narrowing or contrast extravasations.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:&nbsp; </strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Gastrograffin enema study.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:30:45.847' AS DateTime), 1, CAST(N'2019-01-08T15:22:55.990' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (197, N'Radiology', N'HSG', N'Hysterosalpingogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: &nbsp;&nbsp;Hysterosalpingogram</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:12.0pt"><span style="font-size:16px">PROCEDURE NOTE</span><span style="font-size:18px">: &nbsp;</span><span style="font-size:14px">Under all aseptic precautions after visualisation of cervix. 8 F foley&rsquo;s catheter was inserted and the bulb was inflated to fix the catheter. Control film was taken. After that contrast was instilled slowly under fluoroscopic guidance. Spot images were taken at regular intervals.</span></span></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: &nbsp;</strong></span></p>

<ul>
	<li><span style="font-size:14px">Uterine cavity appears normal in outline. No evidence of any mucosal abnormality, abnormal filling defect or focal lesion is noted. </span></li>
	<li><span style="font-size:14px">All the parts of bilateral fallopian tube appears normal in outline. No evidence of any filling defect or focal lesion, abnormal narrowing or outpouching is noted. </span></li>
	<li><span style="font-size:14px">Free spillage of contrast is noted in the pelvis.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;">&nbsp;</li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:33:16.883' AS DateTime), 1, CAST(N'2019-01-08T15:23:53.453' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (198, N'Radiology', N'MCU (f)', N'MCU (female)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: MCU</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:12.0pt"><span style="font-size:16px">PROCEDURE NOTE</span><span style="font-size:18px">:</span><span style="font-size:16px"> </span></span><span style="font-size:14px">Under all aseptic precautions, 6F catheter was inserted into the bladder. After that contrast was instilled under fluoroscopic guidance and urinary bladder was filled .After the urinary bladder was filled, catheter was removed and patient allowed to micturate. Spot images were taken.</span></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ol>
	<li><span style="font-size:14px"><strong>Urinary Bladder</strong></span></li>
</ol>

<ul>
	<li><span style="font-size:14px">Bladder appears normal in outline and distensibility. No evidence of any calculus, focal lesion is noted. No evidence of any abnormal outpouching noted. No significant post micturition volume of urine is noted.</span></li>
</ul>

<ol start="2">
	<li><span style="font-size:14px"><strong>Urethra</strong></span></li>
</ol>

<ul>
	<li><span style="font-size:14px">Urethra appears normal in course, caliber and outline. There is no filling defect or extravasation of contrast noted</span>.</li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; &nbsp;&nbsp; 3. No evidence of VUR is noted<strong>.</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><strong><span style="font-size:14px">Normal study.</span></strong></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:35:58.470' AS DateTime), 1, CAST(N'2019-01-08T15:25:14.717' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (199, N'Radiology', N'MCU (m)', N'MCU (male)', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: MCU</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><strong><span style="font-size:16px">PROCEDURE NOTE</span><span style="font-size:18px">: </span><span style="font-size:14px">Under all aseptic precautions, 6F catheter was inserted into the bladder. After that contrast was instilled under fluoroscopic guidance and urinary bladder was filled .After the urinary bladder was filled, catheter was removed and patient allowed to micturate. Spot images were taken.</span></strong></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ol>
	<li><span style="font-size:14px"><strong>Urinary Bladder</strong></span></li>
</ol>

<ul>
	<li><span style="font-size:14px">Bladder appears normal in outline and distensibility. No evidence of any calculus, focal lesion is noted. No evidence of any abnormal outpouching noted. No significant post micturition volume of urine is noted.</span></li>
</ul>

<ol start="2">
	<li><span style="font-size:14px"><strong>Urethra</strong></span></li>
</ol>

<ul>
	<li><span style="font-size:14px">Urethra appears normal in course, caliber and outline. There is no filling defect or extravasation of contrast noted.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px">&nbsp; &nbsp; &nbsp; 3. No evidence of VUR is noted<strong>.</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION: </strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px"><strong>Normal study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:38:15.543' AS DateTime), 1, CAST(N'2019-01-08T15:27:20.940' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (200, N'Radiology', N'MCU + RGU', N'MCU + RGU', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: MCU+RGU</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><strong><span style="font-size:12.0pt"><span style="font-size:16px">PROCEDURE NOTE:</span> </span><span style="font-size:14px">Under all aseptic precautions, 6F catheter was inserted in distal 1 cm of urethra and balloon was filled with 2 ml of air and contrast was instilled under fluoroscopic guidance. Spot images were taken. After that the catheter was introduced into urinary bladder and contrast was instilled under fluoroscopic guidance till urinary bladder was filled and patient had urge to micturate .After that catheter was deflated and removed and patient was allowed to micturate. Spot images were taken.</span></strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS:</strong></span></p>

<ol>
	<li><span style="font-size:14px"><strong>Urinary Bladder</strong></span></li>
</ol>

<ul>
	<li><span style="font-size:14px">Bladder appears normal in outline and distensibility. No evidence of any calculus, focal lesion is noted. No evidence of any abnormal outpouching noted. No significant post micturition volume of urine is noted.</span></li>
</ul>

<ol start="2">
	<li><span style="font-size:14px"><strong>Urethra</strong></span></li>
</ol>

<ul>
	<li><span style="font-size:14px">Both posterior and anterior urethra also appears normal in course, caliber and outline. There is no any filling defect or extravasation of contrast noted</span></li>
</ul>

<ol start="3">
	<li><span style="font-size:14px"><strong>No evidence of VUR is noted.</strong></span></li>
</ol>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal study</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:43:35.523' AS DateTime), 1, CAST(N'2019-01-08T15:28:11.307' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (201, N'Radiology', N'Procedure', N'Procedure', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>USG GUIDED PROCEDURE</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Under all aseptic precautions, usg guided .............................................................................................................................................................................................................................................................................................</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;...............................................................................................................</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;...............................................................................................................</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;...............................................................................................................</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;................................................................................................................</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>No complications noted during or immediately after the procedure.</strong></span></p>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>Advice: </strong></span></p>

<ol>
	<li><span style="font-size:14px"><strong>Monitor vitals.</strong></span></li>
	<li><span style="font-size:14px"><strong>Analgesia as per required.</strong></span></li>
	<li><span style="font-size:14px"><strong>Inform on duty doctor as required if any complications arise.</strong></span></li>
</ol>
', NULL, NULL, 1, CAST(N'2018-12-28T16:46:20.520' AS DateTime), 1, CAST(N'2019-01-08T15:28:39.560' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (202, N'Radiology', N'Sialography', N'Sialography', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: &nbsp;Sialography</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>PROCEDURE NOTE:</strong>&nbsp; </span><span style="font-size:14px"><strong>Opening of the right parotid gland was identified and dilated with punctum dilator then 22 gauze iv cannula was inserted through the opening of right parotid gland and contrast was instilled under fluoroscopic guidance. Spot images were taken in anteroposterior, oblique and lateral position.</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:14px"><strong>The patient was asked to feed on lemon, and then post lemon feed spot images were taken.</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ul>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">Right parotid duct appears normal in course caliber and outline. No mucosal irregularity or filling defect noted within. No extravasation of contrast noted.</span></li>
	<li style="margin-right: 0in; margin-left: 0in;"><span style="font-size:14px">No retained contrast was noted left after lemon feed.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal sialography.</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:48:21.003' AS DateTime), 1, CAST(N'2019-01-08T15:29:38.310' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (203, N'Radiology', N'Sinogram', N'Sinogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><u><span style="font-size:20px"><strong>NAME OF THE PROCEDURE:SINOGRAM</strong></span></u></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>PROCEDURE:</strong> </span><span style="font-size:14px">Small opening is noted at perianal region at 4 &lsquo;o&rsquo;clock position through which serous discharge was noted. Then 22G cannula is inserted through the opening and contrast was injected through it and images taken in contrast view.</span></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDING</strong>:</span></p>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION</strong></span><span style="font-size:18px"><strong>: </strong></span></p>

<p style="margin-left:0in; margin-right:0in">&nbsp;</p>
', NULL, NULL, 1, CAST(N'2018-12-28T16:50:10.490' AS DateTime), 1, CAST(N'2019-01-08T15:30:20.430' AS DateTime), 1)
GO
INSERT [dbo].[RAD_CFG_ReportTemplates] ([TemplateId], [ModuleName], [TemplateCode], [TemplateName], [TemplateHTML], [FooterNote], [Remarks], [CreatedBy], [CreatedOn], [ModifiedBy], [ModifiedOn], [IsActive]) VALUES (204, N'Radiology', N'T-Tube Cholangiogram', N'T - Tube Cholangiogram', N'<p style="margin-left:0in; margin-right:0in; text-align:center"><span style="font-size:20px"><strong>NAME OF THE PROCEDURE: &nbsp;T-Tube Cholangiogram</strong></span></p>

<p style="margin-left:0in; margin-right:0in"><strong><span style="font-size:16px">PROCEDURE NOTE:<span style="font-size:18px"> </span></span><span style="font-size:14px">Under all aseptic precautions and fluoroscopic guidance, T tube was clamped and contrast was instilled from the tube and spot films were taken in anteroposterior and bilateral oblique views.</span></strong></p>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>FINDINGS: </strong></span></p>

<ul>
	<li><span style="font-size:14px">T-tube is noted insitu. There is normal opacification of common bile duct and passage of contrast is noted into the duodenum. </span></li>
	<li><span style="font-size:14px">The intrahepatic bile ducts and the common hepatic duct appears normal in course, caliber and outline.</span></li>
</ul>

<p style="margin-left:0in; margin-right:0in"><span style="font-size:16px"><strong>IMPRESSION:</strong></span></p>

<ul>
	<li><span style="font-size:14px"><strong>Normal Findings</strong></span></li>
</ul>
', NULL, NULL, 1, CAST(N'2018-12-28T16:51:58.647' AS DateTime), 1, CAST(N'2019-01-08T15:31:04.537' AS DateTime), 1)
GO
SET IDENTITY_INSERT [dbo].[RAD_CFG_ReportTemplates] OFF
GO



---3. Create Temporary table for ImagingItems and Insert the Data of UAT into it.


If OBJECT_ID('RAD_MST_ImagingItem_TEMP') IS NOT NULL
BEGIN
 DROP TABLE RAD_MST_ImagingItem_TEMP
END
GO

CREATE TABLE [dbo].[RAD_MST_ImagingItem_TEMP](
	[ImagingItemId] [int] Identity(1,1) NOT NULL,
	[ImagingTypeId] [int] ,
	[ProcedureCode] [varchar](9) NULL,
	[ImagingItemName] [varchar](200) NULL,
	[CreatedBy] [int] NULL,
	[ModifiedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedOn] [datetime] NULL,
	[IsActive] [bit] NULL,
	[TemplateId] [int] NULL,
)
GO



SET IDENTITY_INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ON
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (1, 9, NULL, N'OPERATION OF CHOLEDOCHAL CYST(WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (2, 9, NULL, N'NEPHRECTOMY FOR PYONEPHROSIS (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (3, 9, NULL, N'NEPHRECTOMY FOR HYDRONEPHROSIS (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (4, 9, NULL, N'NEPHRECTOMY FOR WILMS TUMOUR (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (5, 9, NULL, N'PARAAORTIC LYMPHADENOCTOMY WITH NEPHRECTOMY FOR WILMS TUMOUR (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (6, 9, NULL, N'SACROCOECYGEAL TERATOMA EXCISION (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (7, 9, NULL, N'NEUROOBLASTOMA DEBULKING (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (8, 9, NULL, N'NEUROBLASTOMA TOTAL EXCISION (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (9, 9, NULL, N'RHABDOMYOSARCOMA WIDE EXCISION (WITH GA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (10, 9, NULL, N'ATRESIA OF OESOPHAGUS AND TRACHEO OESOPHAGEAL FISTULA (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (11, 9, NULL, N'EXCISION OF THYROGLOSSAL DUCT/CYST(WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (12, 9, NULL, N'DIAPHRAGMATIC HERNIA REPAIR (THORACIC OR ABDOMINAL APPROACH) (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (13, 9, NULL, N'TRACHEO OESOPHAGEAL FISTULA (CORRECTION SURGERY) (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (14, 9, NULL, N'COLON REPLACEMENT OF OESOPHAGUS (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (15, 9, NULL, N'OMPHALO MESENTERIC CYST EXCISION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (16, 9, NULL, N'OMPHALO MESENTERIC DUCT EXCISION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (17, 9, NULL, N'MECKELS DIVERTICULECTOMY (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (18, 9, NULL, N'OMPHALOCELE 1ST STAGE (HERNIA REPAIR) (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (19, 9, NULL, N'OMPHALOCELE 2ND STAGE (HERNIA REPAIR) (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (20, 9, NULL, N'GASTROCHISIS REPAIR (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (21, 9, NULL, N'INGUINAL HERNIOTOMY (WITH LA) ', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (22, 9, NULL, N'CONGENITAL HYDROCELE (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (23, 9, NULL, N'HYDROCELE OF CORD (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (24, 9, NULL, N'TORSION TESTIS OPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (25, 9, NULL, N'CONGENITAL PYLORIC STENOSISOPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (26, 9, NULL, N'DUODENAL ATRESIA OPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (27, 9, NULL, N'PANCREATIC RING OPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (28, 9, NULL, N'MECONIUM ILEUS OPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (29, 9, NULL, N'MALROTATION OF INTESTINES OPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (30, 9, NULL, N'RECTAL BIOPSY (MEGACOLON) (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (31, 9, NULL, N'COLOSTOMY TRANSVERSE (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (32, 9, NULL, N'COLOSTOMY LEFT ILLAC (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (33, 9, NULL, N'ABDOMINAL PERINEAL PULL THROUGH (HIRSCHAPRUGIS DISEAS) (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (34, 9, NULL, N'IMPERFORATE ANUS LOW ANOMALY CUT BACK OPERATION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (35, 9, NULL, N'IMPERFORATE ANUS LOW ANOMALY PERINEAL ANOPLASTY (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (36, 9, NULL, N'IMPERFORATE ANUS HIGH ANOMALY SACROABDOMINO PERINEAL PULL THROUGH (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (37, 9, NULL, N'IMPERFORATE ANUS HIGH ANOMALY CLOSURE OF COLOSTOMY (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (38, 9, NULL, N'INTUSUSSCUCEPTION OPERATION CHOLEDOCHODUODENOSTOMY FOR ATRESIA OF EXTRA HEPATIC BILLIARY(WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (39, 9, NULL, N'OPERATION OF  CHOLEDOCHAL CYST (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (40, 9, NULL, N'NEPHRECTOMY FOR PYONEPHROSIS (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (41, 9, NULL, N'NEPHRECTOMY FOR HYDRONEPHROSIS (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (42, 9, NULL, N'NEPHRECTOMY FOR WILMS TUMOUR (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (43, 9, NULL, N'PARAAORTIC LYMPHADENOCTOMY WITH NEPHRECTOMY FOR WILMS TUMOUR (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (44, 9, NULL, N'SACROCOECYGEAL TERATOMA EXCISION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (45, 9, NULL, N'NEUROBLASTOMA DEBULKING (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (46, 9, NULL, N'NEUROBLASTOMA TOTAL EXCISION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (47, 9, NULL, N'RHABDOMYOSARCOMA WIDE EXCISION (WITH LA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (48, 9, NULL, N'PER QUADRENT- CUNJUNTION WITH EXT.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (49, 9, NULL, N'PER QUADRENT- NOT IN CUNJUNTION', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (50, 9, NULL, N'FRENECTOMY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (51, 8, NULL, N'CORRECTION OF NIPPLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (52, 8, NULL, N'EXCISION OF GYNAECOMASTIA', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (53, 8, NULL, N'EXCISION OF BREAST LUMPS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (54, 8, NULL, N'EXCISION OF BREAST SINUS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (55, 8, NULL, N'INCISION & DRAINAGAE OFBREAST ABSCESS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (56, 8, NULL, N'LUMPECTOMY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (57, 8, NULL, N'MICRODOCHECTOMY (HADFIELD PROCEDURES)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (58, 8, NULL, N'RADICAL MASTECTOMY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (59, 8, NULL, N'REDUCTION  MAMMOPLASTY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (60, 8, NULL, N'SECTOR MASTECTOMY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (61, 8, NULL, N'SEGMENTAL RESTECTION OF BREAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (62, 8, NULL, N'SIMPLE MASTECTOMY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (63, 8, NULL, N'MAMOGRAPH (BOTH BREST)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (64, 8, NULL, N'REDUCTION MAMMOPLASTY (PLASTIC SURGERY)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (65, 8, NULL, N'AUGMENTATION MAMMOPLASTY (PLASTIC SURGERY)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (66, 8, NULL, N'TOTAL BREAST RECONSTRUCTION', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (67, 8, NULL, N'MODIFIED RADICAL MASTECTOMY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (68, 8, NULL, N'AXILLARY DISSECTION', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (69, 8, NULL, N'EXCISION OD DUCT COMPLEX', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (70, 8, NULL, N'LIPECTOMY AXILLARY PAD OF FAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (71, 8, NULL, N'TRUCUT BIOPSY UNILATERAL BREAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (72, 8, NULL, N'USG GUIDED FNAC BREAT (SINGLE)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (73, 10, NULL, N'BHATIA B.TEST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (74, 10, NULL, N'RORSCHACH TEST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (75, 10, NULL, N'SKILLED TEST (MOTOR COORDINATION)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (76, 4, NULL, N'MRI CONTRAST CHARGES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (77, 4, NULL, N'MRI SCREENING (PER PART)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (78, 4, NULL, N'MRI ADDITIONAL FILM/CD', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (79, 4, NULL, N'MRI BRAIN VENOGRAPHY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (80, 4, NULL, N'MRI BRAIN PLAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:31:11.277' AS DateTime), 1, 152)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (81, 4, NULL, N'MRI BRAIN ANGIOGRAPHY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (82, 4, NULL, N'MRI ANGIOGRAPHY NECK/CAROTID', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (83, 4, NULL, N'MRI MRCP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:25:45.190' AS DateTime), 1, 141)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (84, 4, NULL, N'MRI UPPER ABDOMEN WITH MRCP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:27:31.420' AS DateTime), 1, 144)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (85, 4, NULL, N'MRI UROGRAPHY PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (86, 4, NULL, N'MRI ANGIO SINGLE PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (87, 4, NULL, N'MRI UROGRAPHY CONTRAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (88, 4, NULL, N'MRI ORBIT PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (89, 4, NULL, N'MRI ANGIOGRAPHYPERIPHERAL WITH CONTRAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (90, 4, NULL, N'MRI ANY SINGLE PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (91, 4, NULL, N'MRI BRAIN SCREENING WITH DIFFUSION', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:31:59.167' AS DateTime), 1, 148)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (92, 4, NULL, N'MRI BRAIN FOR PITUITARY WITH CONTRAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:31:50.867' AS DateTime), 1, 153)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (93, 4, NULL, N'MRI BRACHIAL PLEXUS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (94, 4, NULL, N'MRI UPPER ABDOMEN PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (95, 4, NULL, N'MRI CERVICAL SPINE PLAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:32:35.907' AS DateTime), 1, 149)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (96, 4, NULL, N'MRI CERVICAL SPINE CONTRAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:32:48.877' AS DateTime), 1, 149)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (97, 4, NULL, N'MRI CERVICO DORSAL SPINE (ONE STUDY)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (98, 4, NULL, N'MRI CHEST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (99, 4, NULL, N'MRI COCHLEA/ TEMPORAL BONES/ BOTH EARS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (100, 4, NULL, N'MRI CV JUNCTION', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (101, 4, NULL, N'MRI LOWER ABDOMEN PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (102, 4, NULL, N'MRI DORSAL SPINE PLAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:34:14.817' AS DateTime), 1, 155)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (103, 4, NULL, N'MRI DORSO LUMLAR SPINE (ONE STUDY)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (104, 4, NULL, N'MRI LS-SPINE PLAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:40:20.473' AS DateTime), 1, 160)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (105, 4, NULL, N'MRI WHOLE ABDOMEN PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (106, 4, NULL, N'MRI WHOLE ABDOMEN CONTRAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (107, 4, NULL, N'MRI SI JOINT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:43:46.637' AS DateTime), 1, 165)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (108, 4, NULL, N'MRI ANKLE JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:27:47.947' AS DateTime), 1, 145)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (109, 4, NULL, N'MRI ELBOW JOINT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (110, 4, NULL, N'MRI FOOT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:34:46.047' AS DateTime), 1, 156)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (111, 4, NULL, N'MRI FORE ARM SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:28:38.753' AS DateTime), 1, 146)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (112, 4, NULL, N'MRI HAND SINGLLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (113, 4, NULL, N'MRI HIP JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:35:27.943' AS DateTime), 1, 157)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (114, 4, NULL, N'MRI KNEE JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:36:00.420' AS DateTime), 1, 158)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (115, 4, NULL, N'MRI LEG SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:38:38.140' AS DateTime), 1, 159)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (116, 4, NULL, N'MRI SHOULDER JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:43:15.747' AS DateTime), 1, 164)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (117, 4, NULL, N'MRI THIGH SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:44:01.737' AS DateTime), 1, 166)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (118, 4, NULL, N'MRI ARM SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:28:45.343' AS DateTime), 1, 146)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (119, 4, NULL, N'MRI SINGLE WRIST JOINT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:44:28.493' AS DateTime), 1, 167)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (120, 4, NULL, N'MRI BRAIN WITH CONTRAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:30:22.313' AS DateTime), 1, 151)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (121, 4, NULL, N'MRI UPPER ABDOMEN CONTRAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (122, 4, NULL, N'MRI NECK PLAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:41:32.217' AS DateTime), 1, 161)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (123, 4, NULL, N'MRI LOWER ABDOMEN CONTRAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (124, 4, NULL, N'MRI PELVIS PLAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:42:32.853' AS DateTime), 1, 162)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (125, 4, NULL, N'MRI PELVIS CONTRAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:42:39.100' AS DateTime), 1, 162)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (126, 4, NULL, N'MRI PNS PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (127, 4, NULL, N'MRI TESTIS PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (128, 4, NULL, N'MRI TM JOINT PLAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (129, 4, NULL, N'MRI NECK CONTRAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:41:41.153' AS DateTime), 1, 161)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (130, 4, NULL, N'MRI WRIST JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:44:34.473' AS DateTime), 1, 167)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (131, 4, NULL, N'MRI FINGER', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (132, 4, NULL, N'MRI BRAIN CONTRAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:30:30.427' AS DateTime), 1, 151)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (133, 4, NULL, N'MRI ANY SINGLE JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (134, 4, NULL, N'MRI ANGIO CONTRAST BRAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (135, 4, NULL, N'MRI ANGIO CONTRAST NECK', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:41:53.483' AS DateTime), 1, 161)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (136, 4, NULL, N'MRI BRAIN SEIZURE PROTOCOL', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (137, 4, NULL, N'MRI TUMOR SPECTROSCOPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (138, 4, NULL, N'MRI BRAIN STROKE PROTOCOL (ANGIO)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (139, 1, NULL, N'CT ORAL CONTRAST CHARGES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (140, 1, NULL, N'CT IV CONTRAST CHARGES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (141, 1, NULL, N'NCCT CHEST/THORAX', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (142, 1, NULL, N'CECT CHEST/THORAX', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:14:06.847' AS DateTime), 1, 91)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (143, 1, NULL, N'NCCT HIPS JOINTS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (144, 1, NULL, N'NCCT KUB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:39:12.517' AS DateTime), 1, 26)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (145, 1, NULL, N'CECT KUB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:39:07.727' AS DateTime), 1, 26)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (146, 1, NULL, N'NCCT NECK', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:01:24.577' AS DateTime), 1, 46)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (147, 1, NULL, N'CECT NECK', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:13:51.280' AS DateTime), 1, 97)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (148, 1, NULL, N'NCCT LOWER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:20:04.443' AS DateTime), 1, 28)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (149, 1, NULL, N'CECT LOWER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:14:23.067' AS DateTime), 1, 87)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (150, 1, NULL, N'NCCT UPPER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:20:25.117' AS DateTime), 1, 28)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (151, 1, NULL, N'CECT UPPER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:14:31.607' AS DateTime), 1, 88)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (152, 1, NULL, N'NCCT WHOLE ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:20:52.223' AS DateTime), 1, 27)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (153, 1, NULL, N'CECT WHOLE ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:33:33.990' AS DateTime), 1, 27)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (154, 1, NULL, N'NCCT HEAD/BRAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (155, 1, NULL, N'CECT HEAD/BRAIN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:14:43.600' AS DateTime), 1, 94)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (156, 1, NULL, N'CECT UROGRAPHY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:42:08.943' AS DateTime), 1, 31)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (157, 1, NULL, N'NCCT PNS (CORONAL+AXIAL CUTS)', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:05:20.983' AS DateTime), 1, 50)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (158, 1, NULL, N'NCCT ORBITS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:50:41.230' AS DateTime), 1, 126)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (159, 1, NULL, N'NCCT TEMPORAL BONE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (160, 1, NULL, N'NCCT LUMBER SPINE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:36:23.237' AS DateTime), 1, 123)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (161, 1, NULL, N'NCCT WHOLE SPINE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (162, 1, NULL, N'NCCT CERVICAL SPINE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:36:03.187' AS DateTime), 1, 25)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (163, 1, NULL, N'NCCT DORSAL SPINE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (164, 1, NULL, N'NCCT SCANOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (165, 1, NULL, N'NCCT ANY SINGLE PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (166, 1, NULL, N'NCCT PELVIS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:41:46.423' AS DateTime), 1, 30)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (167, 1, NULL, N'CECT PELVIS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:22:35.480' AS DateTime), 1, 127)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (168, 1, NULL, N'NCCT FACE WITH 3D RECONSTRUCTION', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (169, 1, NULL, N'CT SCREENING ANY PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (170, 1, NULL, N'NCCT SINGLE JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (171, 1, NULL, N'NCCT SINGLE EXTERMITIES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (172, 1, NULL, N'NCCT SCAN ANKLE JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:10:46.907' AS DateTime), 1, 60)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (173, 1, NULL, N'NCCT SCAN ELBOW JOINT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:10:32.967' AS DateTime), 1, 59)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (174, 1, NULL, N'NCCT SCAN FOREARM SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (175, 1, NULL, N'NCCT SCAN HAND SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (176, 1, NULL, N'NCCT SCAN KNEE JOINTS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:52:50.473' AS DateTime), 1, 41)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (177, 1, NULL, N'NCCT LEG SINGLE JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (178, 1, NULL, N'NCCT SHOULDER SINGLE JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (179, 1, NULL, N'NCCT THIGH SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (180, 1, NULL, N'NCCT ARM SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (181, 1, NULL, N'NCCT WRIST SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:24:27.407' AS DateTime), 1, 132)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (182, 1, NULL, N'CT EXTRA FILM/CD', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (183, 1, NULL, N'CECT SELLA/PITUITARY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (184, 1, NULL, N'CECT ANGIOGRAPHY ANY PART', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:43:17.697' AS DateTime), 1, 32)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (185, 1, NULL, N'CECT ANGIO BRAIN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (186, 1, NULL, N'CECT ANGIOGRAPHY RENAL', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:43:33.623' AS DateTime), 1, 105)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (187, 1, NULL, N'CECT ANGIOGRAPHY PERIPHERAL', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (188, 1, NULL, N'CECT ANGIOGRAPHY PULMONARY/CHEST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:43:49.657' AS DateTime), 1, 104)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (189, 1, NULL, N'CECT ANGIOGRAPHY CAROTID/NECK', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:43:56.070' AS DateTime), 1, 103)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (190, 1, NULL, N'CECT ANGIOGRAPHY ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:21:10.183' AS DateTime), 1, 101)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (191, 1, NULL, N'NCCT BODY ANY PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (192, 2, NULL, N'USG SCREENING', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (193, 2, NULL, N'USG CD/FILM (EXTRA)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (194, 2, NULL, N'USG CHEST/THORAX', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (195, 2, NULL, N'USG CRANIUM/HEAD', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (196, 2, NULL, N'USG EMERGENCY CHARGES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (197, 2, NULL, N'USG EYE/ORBITS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (198, 2, NULL, N'USG LEVEL- II', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (199, 2, NULL, N'USG NECK', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (200, 2, NULL, N'USG NEONATAL SPINE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (201, 2, NULL, N'USG PORTABLE CHARGES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (202, 2, NULL, N'USG SCROTUM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:14:15.630' AS DateTime), 1, 69)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (203, 2, NULL, N'USG SMALL PARTS/EXTERMITIES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (204, 2, NULL, N'USG THIGH', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (205, 2, NULL, N'USG THYROID', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:12:28.537' AS DateTime), 1, 71)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (206, 2, NULL, N'USG TRUS (TRANSRECTAL)', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:09:22.203' AS DateTime), 1, 55)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (207, 2, NULL, N'USG BIO-PHYSICAL STUDY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (208, 2, NULL, N'USG FOLLICULAR STUDY (ONE MENSTRUAL CYCLE)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (209, 2, NULL, N'USG FOLUCULAR MONITORING STUDY ONE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (210, 2, NULL, N'USG GUIDED : DIAG PLEURAL / ASCITIC', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:13:02.250' AS DateTime), 1, 17)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (211, 2, NULL, N'USG THERAPEUTIC PLEURAL / ASCITIC', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (212, 2, NULL, N'USG GUIDED PROCEDURE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:58:57.187' AS DateTime), 1, 201)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (213, 2, NULL, N'USG K.U.B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (214, 2, NULL, N'USG LOWER ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (215, 2, NULL, N'USG UPPER ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (216, 2, NULL, N'USG WHOLE ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (217, 2, NULL, N'USG MUSKULOSKLETAL', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (218, 2, NULL, N'USG OBESTETRIC', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (219, 2, NULL, N'USG T.V.S', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (220, 2, NULL, N'USG TESTIS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:14:33.847' AS DateTime), 1, 70)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (221, 2, NULL, N'USG UPPER ABDOMEN PORTABLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (222, 2, NULL, N'USG BREAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:08:24.813' AS DateTime), 1, 67)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (223, 2, NULL, N'USG GUIDED FNAC/BIOSPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (224, 2, NULL, N'USG NT, NB SCAN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (225, 2, NULL, N'USG PENILE DOPPLER', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (226, 5, NULL, N'COLOR DOPPLER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:50:59.560' AS DateTime), 1, 178)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (227, 5, NULL, N'COLOR DOPPLER ARTERIAL SINGLE LIMB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:47:46.870' AS DateTime), 1, 174)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (228, 5, NULL, N'COLOR DOPPLER VENOUS SINGLE LIMB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:16:10.667' AS DateTime), 1, 20)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (229, 5, NULL, N'COLOR DOPPLER ARTERIAL BOTH LOWER LIMBS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T10:33:16.307' AS DateTime), 1, 174)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (230, 5, NULL, N'COLOR DOPPLER VANOUS BOTH LOWER LIMBS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:51:59.707' AS DateTime), 1, 181)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (231, 5, NULL, N'COLOR DOPPLER ARTERIAL BOTH UPPER LIMBS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:47:29.213' AS DateTime), 1, 175)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (232, 5, NULL, N'COLOR DOPPLER VENOUS BOTH UPPER LIMB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:16:03.393' AS DateTime), 1, 182)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (233, 5, NULL, N'COLOR DOPPLER PORTABLE CHARGES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (234, 5, NULL, N'COLOR DOPPLER CAROTID', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:50:17.807' AS DateTime), 1, 4)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (235, 5, NULL, N'COLOR DOPPLER SCROTAL/VARICOCELE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (236, 5, NULL, N'COLOR DOPPLER OBSTETRIC', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (237, 5, NULL, N'COLOR DOPPLER TVS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (238, 5, NULL, N'COLOR DOPPLER HEPATIC/PORTAL', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (239, 5, NULL, N'COLOR DOPPLER RENAL', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:49:41.520' AS DateTime), 1, 187)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (240, 5, NULL, N'COLOR DOPPLER VERTEBERAL', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:50:28.877' AS DateTime), 1, 177)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (241, 5, NULL, N'COLOR DOPPLER SINGLE PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (242, 5, NULL, N'COLOR DOPPLER TESTIS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (243, 5, NULL, N'DEXA SCAN SINGLE SIGHT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (244, 5, NULL, N'DEXA SCAN DUAL SIGHT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (245, 8, NULL, N'MAMMO SINGLE BREAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (246, 8, NULL, N'MAMMO BOTH BREAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (247, 3, NULL, N'KUB-AP', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (248, 3, NULL, N'ABDOMEN ERECT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (249, 3, NULL, N'ANKLE AP/LAT 2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:45:20.367' AS DateTime), 1, 78)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (250, 3, NULL, N'ANKLE SINGLE VIEW', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:45:12.170' AS DateTime), 1, 78)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (251, 3, NULL, N'CHEST APICOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:14:50.700' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (252, 3, NULL, N'ARM AP/LAT 2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (253, 3, NULL, N'ARM SINGLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (254, 3, NULL, N'BARIUM ENEMA', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:56:08.330' AS DateTime), 1, 190)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (255, 3, NULL, N'I.V.P', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (256, 3, NULL, N'BARIUM MEAL FOLOW THTROUG(BMFT)', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:56:39.870' AS DateTime), 1, 191)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (257, 3, NULL, N'BARIUM MEAL UPPER G.I.T', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:56:34.403' AS DateTime), 1, 191)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (258, 3, NULL, N'BARIUM SWALLOW', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:56:27.347' AS DateTime), 1, 192)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (259, 3, NULL, N'BOTH KNEES-STANDING-AP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:08:07.847' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (260, 3, NULL, N'LEG- AP/LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (261, 3, NULL, N'THIGH -AP SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (262, 3, NULL, N'SKULL-AP', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (263, 3, NULL, N'AKULL-LAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (264, 3, NULL, N'CERVICAL SPINE-AP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:58:16.177' AS DateTime), 1, 79)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (265, 3, NULL, N'CERVICAL SPINE- LAT.', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:02:59.757' AS DateTime), 1, 79)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (266, 3, NULL, N'CHEST-AP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:14:56.507' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (267, 3, NULL, N'CHEST-LAT.', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:15:01.120' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (268, 3, NULL, N'CHEST-PA', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:15:06.850' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (269, 3, NULL, N'COCYX-LAT.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (270, 3, NULL, N'DL SPINE- AP.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (271, 3, NULL, N'DL SPINE-LAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (272, 3, NULL, N'DL SPINE OBLIQUE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (273, 3, NULL, N'DORSAL SPINE -AP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:04:45.193' AS DateTime), 1, 80)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (274, 3, NULL, N'DORSAL SPINE-LAT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:07:14.730' AS DateTime), 1, 80)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (275, 3, NULL, N'DORSAL SPINE -OBLIQUE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:07:21.840' AS DateTime), 1, 80)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (276, 3, NULL, N'ELBOW- AP/LAT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:12:15.320' AS DateTime), 1, 86)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (277, 3, NULL, N'FINGER-AP/LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (278, 3, NULL, N'FOOT-AP/LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (279, 3, NULL, N'FOOT-OBLIQUE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (280, 3, NULL, N'FOREARM-AP/LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (281, 3, NULL, N'FOREARM-AP', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (282, 3, NULL, N'FOREARM-LAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (283, 3, NULL, N'H.S.G. (HYSTERO SALPINGORAPHY)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (284, 3, NULL, N'HAND - AP/OBLIQUE OR LAT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:44:10.637' AS DateTime), 1, 77)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (285, 3, NULL, N'KNEE-LAT SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:08:13.043' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (286, 3, NULL, N'LEG-AP SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (287, 3, NULL, N'LEG-LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (288, 3, NULL, N'BOTH LEGS-AP/LAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (289, 3, NULL, N'GYNAE DR. CHARGES FOR HSG', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (290, 3, NULL, N'MCU', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:58:26.630' AS DateTime), 1, 198)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (291, 3, NULL, N'LUMBOSACRAL.-AP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:09:35.967' AS DateTime), 1, 82)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (292, 3, NULL, N'LUMBOSACRAL.-LAT.', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:09:42.557' AS DateTime), 1, 82)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (293, 3, NULL, N'MANDIBLE-AP.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (294, 3, NULL, N'MANDIBLE-LAT.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (295, 3, NULL, N'MANDIBLE-OBLIGUE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (296, 3, NULL, N'MASTOIDS LATERAL/OBLIQUE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (297, 3, NULL, N'NECK LAT FOR NASOPHARYNX', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:11:39.577' AS DateTime), 1, 85)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (298, 3, NULL, N'MASTOIDS TOWN''S VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (299, 3, NULL, N'NASAL BONE LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (300, 3, NULL, N'PATELLA SKYLINE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (301, 3, NULL, N'PELVIS-AP', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:10:20.237' AS DateTime), 1, 83)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (302, 3, NULL, N'PELVIS-LAT.', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:10:27.233' AS DateTime), 1, 83)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (303, 3, NULL, N'PELVIS OBLIQUE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:10:33.237' AS DateTime), 1, 83)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (304, 3, NULL, N'THIGH-AP SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (305, 3, NULL, N'THIGH-LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (306, 3, NULL, N'PNS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:11:01.253' AS DateTime), 1, 84)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (307, 3, NULL, N'SHOULDER-AP SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (308, 3, NULL, N'SIALOGRAPHY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:59:16.497' AS DateTime), 1, 202)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (309, 3, NULL, N'SKULL-LAT.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (310, 3, NULL, N'STERNUM-LAT.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (311, 3, NULL, N'STERNUM-AP', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (312, 3, NULL, N'TM JOINT OPEN & CLOSED MOUTH (SINGLE)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (313, 3, NULL, N'TM JOINT -APTM JOINT -APTM JOINT- AP', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (314, 3, NULL, N'UROTHROGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (315, 3, NULL, N'ZYGOMATIC BONE - LEFT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (316, 3, NULL, N'ZYGOMATIC BONE - RIGHT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (317, 3, NULL, N'CHOLANGIOGRAPHY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (318, 3, NULL, N'X-RAY PER EXPOSURE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (319, 3, NULL, N'PORTABLE X-RAY SINGLE EXPOSURE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (320, 3, NULL, N'RGU', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (321, 3, NULL, N'SACRUM- AP.', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (322, 3, NULL, N'SACRUM- LAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (323, 3, NULL, N'SCAPULA - OBLIQUE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (324, 3, NULL, N'SHOULDER- LAT SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (325, 3, NULL, N'SHOULDER -OBLIQUE SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (326, 3, NULL, N'SHOULDER TENGENT VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (327, 3, NULL, N'SINOGRAMSINOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:59:40.500' AS DateTime), 1, 203)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (328, 3, NULL, N'CRYSTOGRAM (BLADDER)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (329, 3, NULL, N'WRIST -AP/LAT (SINGLE)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (330, 3, NULL, N'X-RAY ANY EXTERMITIES AP/LAT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (331, 3, NULL, N'THUMB/FINGER -AP/LAT (SINGLE)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (332, 3, NULL, N'CONTRAST CHARGES FOR ANY X-RAY PROCEDURE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (333, 3, NULL, N'COCCYX-AP', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (334, 3, NULL, N'KNEE-AP SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:08:20.440' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (335, 3, NULL, N'CEPHALOGRAM (FOR DENTAL)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (336, 3, NULL, N'X-Ray 10 * 12', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (337, 2, NULL, N'USG Neck', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:13:31.753' AS DateTime), 1, 64)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (338, 2, NULL, N'USG Abdomen', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:01:51.173' AS DateTime), 1, 6)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (339, 2, NULL, N'USG both breast', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:08:11.097' AS DateTime), 1, 16)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (340, 1, NULL, N'HR CT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (341, 3, NULL, N'Elbow Oblique', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:12:20.737' AS DateTime), 1, 86)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (342, 1, NULL, N'HRCT Temporal Bone', 1, 1, CAST(N'2018-08-03T15:57:26.990' AS DateTime), CAST(N'2019-01-18T11:52:17.120' AS DateTime), 1, 137)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (343, 3, NULL, N'X-ray 14 * 17', 1, NULL, CAST(N'2018-08-05T15:22:03.943' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (344, 3, NULL, N'Knee 1F3V (10 * 12)', 1, 1, CAST(N'2018-08-12T11:52:41.323' AS DateTime), CAST(N'2019-01-18T13:08:27.230' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (345, 2, NULL, N'USG', 1, NULL, CAST(N'2018-08-12T13:16:06.940' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (346, 2, NULL, N'USG GUIDED TRUCUT BIOSPY', 1, NULL, CAST(N'2018-08-12T18:19:11.653' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (347, 1, NULL, N'Plain CT Chest', 1, 1, CAST(N'2018-08-13T12:43:09.523' AS DateTime), CAST(N'2019-01-18T11:40:52.757' AS DateTime), 1, 29)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (348, 3, NULL, N'Lum Sac AP/Lateral', 1, NULL, CAST(N'2018-08-13T13:26:23.257' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (349, 3, NULL, N'Ankle AP/LAT/Mortise 3V', 1, 1, CAST(N'2018-08-13T13:30:56.570' AS DateTime), CAST(N'2019-01-18T12:45:49.467' AS DateTime), 1, 78)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (350, 3, NULL, N'Cervical Spine AP/LAT', 1, 1, CAST(N'2018-08-13T13:41:01.817' AS DateTime), CAST(N'2019-01-18T12:46:17.877' AS DateTime), 1, 79)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (351, 3, NULL, N'Chest AP/LAT', 21, 1, CAST(N'2018-08-14T18:34:14.307' AS DateTime), CAST(N'2019-01-18T12:14:25.893' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (352, 3, NULL, N'Knee AP/LAT', 21, 1, CAST(N'2018-08-14T18:38:31.287' AS DateTime), CAST(N'2019-01-18T13:07:48.607' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (353, 3, NULL, N'Skull AP/LAT', 21, NULL, CAST(N'2018-08-14T18:41:23.170' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (354, 3, NULL, N'10*12 DOUBLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (355, 3, NULL, N'10*12 FOUR VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (356, 3, NULL, N'10*12 SINGLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (357, 3, NULL, N'10*12 THREE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (358, 3, NULL, N'14*17 DOUBLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (359, 3, NULL, N'14*17 SINGLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (360, 3, NULL, N'14*17 STITCHING', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (361, 3, NULL, N'14*17 THREE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (362, 3, NULL, N'8*10 DOUBLE BREAST (MAMMOGRAM)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (363, 3, NULL, N'8*10 SINGLE BREAST (MAMMOGRAM)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (364, 3, NULL, N'ABDOMEN ERECT/SUPINE 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (365, 3, NULL, N'ANKLE AP/LAT 10*12-1F2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:45:41.810' AS DateTime), 1, 78)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (366, 3, NULL, N'ANKLE AP/LAT/MORTISE 14*17-1F3V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:45:28.220' AS DateTime), 1, 78)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (367, 3, NULL, N'ABDOMEN 10*12 1F 1V - PORTABLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (368, 3, NULL, N'MCU + RGU(RETROGRADE URETHROGRAM)', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:58:15.213' AS DateTime), 1, 200)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (369, 3, NULL, N'RGU', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (370, 3, NULL, N'T-TUBE CHOLANGIOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:59:57.563' AS DateTime), 1, 204)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (371, 3, NULL, N'CERVICAL SPINE AP/LAT 10*12 1F 2V - PORTABLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:46:25.503' AS DateTime), 1, 79)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (372, 3, NULL, N'CYSTOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (373, 3, NULL, N'KNEE 14*17 1F 2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:07:54.130' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (374, 3, NULL, N'SOFT TISSUE NECK 10*12 1F 1V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:11:24.787' AS DateTime), 1, 85)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (375, 3, NULL, N'SPINE 10*12 1F 1V - PORTABLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (376, 3, NULL, N'ANY STICHING CASE (LONG LEG OR WHOLE SPINE) 14*17-1F3V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (377, 3, NULL, N'ARM  AP /LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (378, 3, NULL, N'B/L ARM AP/LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (379, 3, NULL, N'B/L FOREARM AP /LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (380, 3, NULL, N'B/L HIP JOINT AP /LAT 14*17-1FV,10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (381, 3, NULL, N'B/L SHOULDR AP/ AXIAL/ SUPRA SPINATUS LET 14*17-1F3V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (382, 3, NULL, N'BARIUM MEAL/FOLLOW THIGH /ENEMA', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:56:51.413' AS DateTime), 1, 191)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (383, 3, NULL, N'BARIUM SWALLOW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (384, 3, NULL, N'CERVICAL SPINE AP/LAT 10*12-1F2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:46:32.317' AS DateTime), 1, 79)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (385, 3, NULL, N'CERVICAL SPINE EXTENSION /FLEXION / AP/ LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (386, 3, NULL, N'CHEST APICAL VIEW 10*12 -1F1V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:14:33.177' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (387, 3, NULL, N'CHEST PA (AP) /LAT 14*17-1F2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:14:40.373' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (388, 3, NULL, N'CHEST PA/AP 10*12-1F1V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:14:45.937' AS DateTime), 1, 76)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (389, 3, NULL, N'COCCYX SPINE AP / LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (390, 3, NULL, N'DORASAL / THORACIC SPINE AP /LAT 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (391, 3, NULL, N'DORASAL SPINE EXTENSION /FLEXION 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (392, 3, NULL, N'DORSAL /THORACIC SPINE EXTENSION / FLEXION /AP /LAT 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (393, 3, NULL, N'ELBOW AP/ LAT 10*12-1F2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:12:03.447' AS DateTime), 1, 86)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (394, 3, NULL, N'ELBOW AP/ LAT/OBL 14*17-1F3V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:12:10.047' AS DateTime), 1, 86)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (395, 3, NULL, N'FEMUR AP/ LAT 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (396, 3, NULL, N'FINGER  AP /LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (397, 3, NULL, N'FISTULOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:57:28.233' AS DateTime), 1, 194)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (398, 3, NULL, N'FOOT AP /LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (399, 3, NULL, N'FOOT AP/LAT/OBLIQUE 14*17-1F3V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (400, 3, NULL, N'FORE ARM AP /LAT 10*120-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (401, 3, NULL, N'FOREARM AP/LAT/OBL 14*17-1F3V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (402, 3, NULL, N'HAND AP/ LAT /OBLIQUE 14*17-1F3V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:43:59.933' AS DateTime), 1, 77)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (403, 3, NULL, N'HAND AP/LAT 10*12-1F2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:44:05.520' AS DateTime), 1, 77)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (404, 3, NULL, N'HIP FORG LEG VIEW 14*12-1F1V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (405, 3, NULL, N'HIP JOINT AP/ LAT 10*12-1F1V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (406, 3, NULL, N'HSG', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:17:23.067' AS DateTime), 1, 21)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (407, 3, NULL, N'IVU', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (408, 3, NULL, N'KNEE JOINT AP /LAT/SKYLINE 10*12-1F3V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:07:58.970' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (409, 3, NULL, N'KNEE JOINT AP/ LAT 10*12-1F2V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:08:02.920' AS DateTime), 1, 81)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (410, 3, NULL, N'LEG (TIBIA)AP /LAT 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (411, 3, NULL, N'FLURO GUIDED-LUMBAR PUNCTURE ', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (412, 3, NULL, N'LUMBAR SPINE AP/ LAT 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (413, 3, NULL, N'LUMBAR SPINE EXTENSION / FLEXION /AP /LAT 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (414, 3, NULL, N'LUMBAR SPINE EXTENSION/ FLEXION 14*17-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (415, 3, NULL, N'MCU - MICTURATING CYSTO URETHRA GRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:58:21.310' AS DateTime), 1, 199)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (416, 3, NULL, N'SINOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:59:29.280' AS DateTime), 1, 203)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (417, 3, NULL, N'MASTOID /TOWENS VIEW/B/L LATERAL 10*12-1F3V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (418, 3, NULL, N'NASAL BONE LAT 10*12-1F1V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (419, 3, NULL, N'NASOPHARYNX LATERAL 10*12-1F1V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (420, 3, NULL, N'ORBIT 10*12-1F1V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (421, 3, NULL, N'PELVIS AP 14*17-1F1V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:10:13.433' AS DateTime), 1, 83)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (422, 3, NULL, N'PNS OM 10*12-1F1V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:10:55.110' AS DateTime), 1, 84)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (423, 3, NULL, N'PORTABLE 10*12 DOUBLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (424, 3, NULL, N'PORTABLE 10*12 SINGLE VIEW', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (425, 3, NULL, N'SACCRAL SPINE AP /LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (426, 3, NULL, N'SACCRAL SPINE AP/LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (427, 3, NULL, N'SCAPHOID VIEW 10*12-1F4V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (428, 3, NULL, N'SHOULDER AP/AXIAL/SUPRA SPINATUS OUT LEY 14*17-1F3V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (429, 3, NULL, N'SIALOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:59:12.157' AS DateTime), 1, 202)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (430, 3, NULL, N'SKULL AP/ LAT 10*12-1F1V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (431, 3, NULL, N'SOFT TISSUE POF NECK 10*12-1F1V', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:11:33.430' AS DateTime), 1, 85)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (432, 3, NULL, N'SONOMAMMOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (433, 3, NULL, N'WRIST AP /LAT 10*12-1F2V', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (434, 3, NULL, N'DUCTOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (435, 3, NULL, N'DISTAL LOOPOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:57:13.497' AS DateTime), 1, 193)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (436, 2, NULL, N'USG  ABDOMEN AND PELVIS EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (437, 2, NULL, N'USG ANOMALY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T10:08:10.177' AS DateTime), 1, 2)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (438, 2, NULL, N'USG ANOMALY EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (439, 2, NULL, N'USG BED SIDE PORTABLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (440, 2, NULL, N'USG BED SIDE PORTABLE EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (441, 2, NULL, N'USG CAROTID DOPPLER', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T10:49:57.113' AS DateTime), 1, 4)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (442, 2, NULL, N'USG CAROTID DOPPLER EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (443, 2, NULL, N'USG DOPPLER ARTERIAL DOUBLE LIMB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T10:32:00.047' AS DateTime), 1, 3)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (444, 2, NULL, N'USG DOPPLER ARTERIAL DOUBLE LIMB EMERGENCY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:48:15.793' AS DateTime), 1, 3)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (445, 2, NULL, N'USG DOPPLER ARTERIAL SINGLE LIMB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T10:33:51.303' AS DateTime), 1, 174)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (446, 2, NULL, N'USG DOPPLER ARTERIAL SINGLE LIMB EMERGENCY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T14:47:55.960' AS DateTime), 1, 174)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (447, 2, NULL, N'USG FETAL DOPPLER', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (448, 2, NULL, N'USG FETAL DOPPLER EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (449, 2, NULL, N'USG GUIDED FNAC - A', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (450, 2, NULL, N'USG GUIDED FNAC - A EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (451, 2, NULL, N'USG GUIDED FNAC - B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (452, 2, NULL, N'USG GUIDED FNAC - B EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (453, 2, NULL, N'USG GUIDED FNAC - C', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (454, 2, NULL, N'USG GUIDED FNAC - C EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (455, 2, NULL, N'USG GUIDED TAPPING -A', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (456, 2, NULL, N'USG GUIDED TAPPING -A EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (457, 2, NULL, N'USG GUIDED TAPPING -C', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (458, 2, NULL, N'USG GUIDED TAPPING -C EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (459, 2, NULL, N'USG GUIDED TAPPING-B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (460, 2, NULL, N'USG GUIDED TAPPING-B EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (461, 2, NULL, N'USG GUIDED TUBE INSERTATION -A', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (462, 2, NULL, N'USG GUIDED TUBE INSERTATION -A EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (463, 2, NULL, N'USG GUIDED TUBE INSERTATION -B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (464, 2, NULL, N'USG ABDOMEN & PELVIS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (465, 2, NULL, N'USG GUIDED TUBE INSERTATION -B EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (466, 2, NULL, N'USG GUIDED TUBE INSERTATION -C', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (467, 2, NULL, N'USG GUIDED TUBE INSERTATION -C EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (468, 2, NULL, N'USG NEUROSONOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (469, 2, NULL, N'USG NEUROSONOGRAM EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (470, 2, NULL, N'USG OBSTETRIC(Early Pregnancy) ? 12 weeks', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:02:56.640' AS DateTime), 1, 65)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (471, 2, NULL, N'USG OBSTETRIC EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (472, 2, NULL, N'USG RENAL DOPPLER', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:05:01.867' AS DateTime), 1, 12)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (473, 2, NULL, N'USG OBSTETRIC (?28 weeks)', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:02:47.810' AS DateTime), 1, 9)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (474, 2, NULL, N'USG ABDOMEN & PELVIS (OPD)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (475, 2, NULL, N'USG RENAL DOPPLER EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (476, 2, NULL, N'USG SMALL PART(NECK, THYRIOD,TESTIS,MSK)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (477, 2, NULL, N'USG BREAST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:08:19.340' AS DateTime), 1, 67)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (478, 2, NULL, N'USG SMALL PART(NECK, THYRIOD,TESTIS,MSK) EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (479, 2, NULL, N'USG VENUS DOUBLE LIMB', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (480, 2, NULL, N'USG VENUS DOUBLE LIMB EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (481, 2, NULL, N'USG VENUS SINGLE LIMB', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (482, 2, NULL, N'USG VENUS SINGLE LIMB EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (483, 2, NULL, N'RENAL BIOPSY (COMPLETE) EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (484, 2, NULL, N'PCN-SINGLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (485, 2, NULL, N'PCN-SINGLE EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (486, 2, NULL, N'PCN-DOUBLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (487, 2, NULL, N'PCN-DOUBLE EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (488, 2, NULL, N'PTBD- SINGLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:04:15.923' AS DateTime), 1, 11)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (489, 2, NULL, N'PTBD-SINGLE EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (490, 2, NULL, N'PTBD-DOUBLE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:04:35.927' AS DateTime), 1, 11)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (491, 2, NULL, N'PTBD-DOUBLE EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (492, 2, NULL, N'USG GUIDED BIOPSY - A', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (493, 2, NULL, N'USG GUIDED BIOPSY - B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (494, 2, NULL, N'USG GUIDED BIOPSY - C', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (495, 2, NULL, N'USG GUIDED BIOPSY - A EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (496, 2, NULL, N'USG GUIDED BIOPSY - B EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (497, 2, NULL, N'USG GUIDED BIOPSY - C EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (498, 2, NULL, N'USG GUIDED FNAC - A', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (499, 2, NULL, N'USG GUIDED FNAC - B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (500, 2, NULL, N'USG GUIDED FNAC - C', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (501, 2, NULL, N'USG GUIDED BIOPSY - A', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (502, 2, NULL, N'USG GUIDED BIOPSY - B', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (503, 2, NULL, N'USG GUIDED BIOPSY - C', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (504, 2, NULL, N'USG GUIDED BIOPSY - A EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (505, 2, NULL, N'USG GUIDED BIOPSY - B EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (506, 2, NULL, N'USG GUIDED BIOPSY - C EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (507, 2, NULL, N'USG GUIDED FNAC - A EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (508, 2, NULL, N'USG GUIDED FNAC - B EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (509, 2, NULL, N'USG GUIDED FNAC - C EMERGENCY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (510, 1, NULL, N'CT CISTERNOGRAPHY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:16:37.257' AS DateTime), 1, 110)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (511, 1, NULL, N'PLAIN AND CONTRAST CT PNS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:06:12.093' AS DateTime), 1, 98)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (512, 1, NULL, N'PLAIN AND CONTRAST CT OF NECK', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (513, 1, NULL, N'CT ABDOMINAL ANGIOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:44:09.510' AS DateTime), 1, 101)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (514, 1, NULL, N'CT CALCIUM SCORING', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (515, 1, NULL, N'CT CAROTID ANGIOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (516, 1, NULL, N'CT CEREBRAL ANGIOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:45:24.360' AS DateTime), 1, 102)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (517, 1, NULL, N'CT CEREBRAL & CAROTID ANGIO', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (518, 1, NULL, N'CT COLONOGRAPHY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (519, 1, NULL, N'CT COLONOGRAPHY WITH CONTRAST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (520, 1, NULL, N'CT CORONARY ANGIOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (521, 1, NULL, N'CT SINGLE LIMB ANGIOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:44:44.670' AS DateTime), 1, 106)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (522, 1, NULL, N'CT DOUBLE LIMB ANIOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (523, 1, NULL, N'CT GUIDED ABSCESS DRAINAGE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (524, 1, NULL, N'CT GUIDED BIOSPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (525, 1, NULL, N'CT GUIDED DRAINAGE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (526, 1, NULL, N'CT GUIDED FNAC', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (527, 1, NULL, N'CT IVU', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:08:35.363' AS DateTime), 1, 54)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (528, 1, NULL, N'CT KUB', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:39:00.423' AS DateTime), 1, 26)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (529, 1, NULL, N'CT MYELOGRAPHY', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:20:55.210' AS DateTime), 1, 124)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (530, 1, NULL, N'PLAIN CT PNS WITH STYLOID PROCESS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (531, 1, NULL, N'CT PORTOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:23:25.603' AS DateTime), 1, 129)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (532, 1, NULL, N'CT PULMONARY ANGIOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:44:54.750' AS DateTime), 1, 104)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (533, 1, NULL, N'CT RENAL ANGIOGRAM', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:45:04.617' AS DateTime), 1, 105)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (534, 1, NULL, N'CT RENAL DONAR ANGIOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (535, 1, NULL, N'CT THORACIC ANGIOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (536, 1, NULL, N'CT TRAUMA SERIES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (537, 1, NULL, N'CT WHOLE AORTIC ANGIOGRAM', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (538, 1, NULL, N'HRCT AND CONTRAST CT TEMPROAL BONE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:52:04.407' AS DateTime), 1, 137)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (539, 1, NULL, N'HRCT CHEST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:51:54.377' AS DateTime), 1, 40)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (540, 1, NULL, N'HRCT TEMPROAL BONE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:52:10.237' AS DateTime), 1, 137)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (541, 1, NULL, N'PLAIN AND CONTRAST CT ANY SINGLE JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (542, 1, NULL, N'PLAIN AND CONTRAST CT ANY SINGLE PERIPHRAL PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (543, 1, NULL, N'PLAIN AND CONTRAST CT ANY THREE SPINES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (544, 1, NULL, N'PLAIN AND CONTRAST CT ANY TWO SPINES', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:37:03.743' AS DateTime), 1, 42)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (545, 1, NULL, N'PLAIN AND CONTRAST CT CERVICAL SPINE', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:37:13.090' AS DateTime), 1, 36)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (546, 1, NULL, N'PLAIN AND CONTRAST CT CHEST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:40:29.673' AS DateTime), 1, 29)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (547, 1, NULL, N'PLAIN AND CONTRAST CT CHEST AND WHOLE ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:21:39.727' AS DateTime), 1, 90)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (548, 1, NULL, N'PLAIN AND CONTRAST CT DORSAL SPINES', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:37:24.223' AS DateTime), 1, 57)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (549, 1, NULL, N'PLAIN AND CONTRAST CT HEAD', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:49:13.463' AS DateTime), 1, 38)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (550, 1, NULL, N'PLAIN AND CONTRAST CT HEAD AND NECK', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:46:53.897' AS DateTime), 1, 35)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (551, 1, NULL, N'PLAIN AND CONTRAST CT HEAD AND ORBIT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:49:27.037' AS DateTime), 1, 37)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (552, 1, NULL, N'PLAIN AND CONTRAST CT ORBIT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:50:54.277' AS DateTime), 1, 49)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (553, 1, NULL, N'PLAIN AND CONTRAST CT SELLA/PITUITARY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (554, 1, NULL, N'PLAIN AND CONTRAST CT HEAD AND PNS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:07:10.113' AS DateTime), 1, 39)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (555, 1, NULL, N'PLAIN AND CONTRAST CT HEAD,NECK CHEST AND ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:21:58.887' AS DateTime), 1, 47)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (556, 1, NULL, N'PLAIN AND CONTRAST CT LUMBAR SPINES', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:37:32.037' AS DateTime), 1, 123)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (557, 1, NULL, N'PLAIN AND CONTRAST CT NECK AND ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (558, 1, NULL, N'PLAIN AND CONTRAST CT NECK AND CHEST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (559, 1, NULL, N'PLAIN AND CONTRAST CT PELVIS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:22:20.303' AS DateTime), 1, 127)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (560, 1, NULL, N'PLAIN AND CONTRAST CT UPPER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:34:14.827' AS DateTime), 1, 22)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (561, 1, NULL, N'PLAIN AND CONTRAST CT WHOLE ABDOMEN (TRIPLE PHASE)', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (562, 1, NULL, N'PLAIN AND CONTRAST CT WHOLE ABDOMEN(DOUBLE PHASE)', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:34:32.333' AS DateTime), 1, 24)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (563, 1, NULL, N'PLAIN CT ANY SINGLE JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (564, 1, NULL, N'PLAIN CT ANY B/L  JOINT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (565, 1, NULL, N'PLAIN CT WHOLE SPINE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (566, 1, NULL, N'PLAIN CT ANY SINGLE PERIPHRAL PART', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (567, 1, NULL, N'PLAIN CT ANY THREE SPINES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (568, 1, NULL, N'PLAIN CT ANY TWO SPINES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (569, 1, NULL, N'PLAIN CT CERVICAL SPINES', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:37:58.133' AS DateTime), 1, 111)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (570, 1, NULL, N'PLAIN CT CHEST', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:41:10.867' AS DateTime), 1, 29)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (571, 1, NULL, N'PLAIN CT CHEST AND WHOLE ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (572, 1, NULL, N'PLAIN CT DORSAL SPINES', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (573, 1, NULL, N'PLAIN CT FACE WITH 3D RECONSTRUCTION', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (574, 1, NULL, N'PLAIN CT HEAD', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:49:42.587' AS DateTime), 1, 38)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (575, 1, NULL, N'PLAIN CT SELLA/PITUITARY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (576, 1, NULL, N'PLAIN CT ORBIT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:51:01.823' AS DateTime), 1, 49)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (577, 1, NULL, N'PLAIN CT HEAD AND ORBIT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:48:05.577' AS DateTime), 1, 37)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (578, 1, NULL, N'PLAIN CT HEAD AND PNS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:46:13.367' AS DateTime), 1, 34)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (579, 1, NULL, N'PLAIN CT LUMBAR SPINES', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:20:26.963' AS DateTime), 1, 123)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (580, 1, NULL, N'PLAIN CT NECK', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (581, 1, NULL, N'PLAIN CT NECK AND CHEST', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (582, 1, NULL, N'PLAIN CT NECK,CHEST AND ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:34:45.607' AS DateTime), 1, 47)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (583, 1, NULL, N'PLAIN CT PELVIS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:22:13.140' AS DateTime), 1, 127)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (584, 1, NULL, N'PLAIN CT HIP JOINTS', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (585, 1, NULL, N'PLAIN CT PNS', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T12:05:42.930' AS DateTime), 1, 50)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (586, 1, NULL, N'PLAIN CT UPPER ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (587, 1, NULL, N'PLAIN CT LOWER ABDOMEN', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T13:19:52.793' AS DateTime), 1, 28)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (588, 1, NULL, N'PLAIN CT WHOLE ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (589, 1, NULL, N'PLAIN AND CONTRAST  CT OF  NECK', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (590, 1, NULL, N'PLAN CT VIRTUAL BRONCHOSCOPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (591, 1, NULL, N'PLAN CT VIRTUAL COLONOSCOPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (592, 1, NULL, N'PLAN CT VIRTUAL ENDOSCOPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (593, 1, NULL, N'CT GUIDED BIOSPY', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (594, 1, NULL, N'CT GUIDED FNAC', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (595, 1, NULL, N'PLAIN AND CONTRAST HEAD & ABDOMEN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (596, 1, NULL, N'PLAIN AND CONTRAST CT ORBIT', 1, 1, CAST(N'2018-07-01T00:00:00.000' AS DateTime), CAST(N'2019-01-18T11:51:16.110' AS DateTime), 1, 126)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (597, 1, NULL, N'CT GUIDED NERVE BLOCK', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (598, 11, NULL, N'FORE ARM- DXA', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (599, 11, NULL, N'LS HIP JOINT/ FEMUR - DXA', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (600, 11, NULL, N'WHOLE BODY- DXA', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (601, 12, NULL, N'USG SERVICE CHARGE FOR PRGF', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (602, 12, NULL, N'SCREENING CT ANKLE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (603, 12, NULL, N'THYROID SCAN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (604, 12, NULL, N'DTPA SCAN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (605, 12, NULL, N'DRAINAGE TUBE CHECK & CHANGE', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (606, 12, NULL, N'NEPHROSTOMY PCN TUBE PLACEMENT', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (607, 12, NULL, N'BONE SCAN', 1, NULL, CAST(N'2018-07-01T00:00:00.000' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (608, 3, NULL, N'Clavicle AP', 1, NULL, CAST(N'2018-08-27T10:55:49.817' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (609, 3, NULL, N'KUB', 1, NULL, CAST(N'2018-08-28T13:32:22.643' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (610, 3, NULL, N'Shoulder AP/LAT 1F2V', 1, NULL, CAST(N'2018-08-28T13:33:30.763' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (611, 3, NULL, N'Pelvic AP/Lateral', 1, NULL, CAST(N'2018-08-30T12:37:23.873' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (612, 2, NULL, N'TVS', 20, 1, CAST(N'2018-09-13T12:52:46.780' AS DateTime), CAST(N'2019-01-18T12:12:49.913' AS DateTime), 1, 74)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (613, 4, NULL, N'MRI knee joint single', 19, 1, CAST(N'2018-10-14T17:50:01.040' AS DateTime), CAST(N'2019-01-18T13:35:53.670' AS DateTime), 1, 158)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (614, 4, NULL, N'Dorsal LUmber Spine', 21, 1, CAST(N'2018-10-19T11:20:47.357' AS DateTime), CAST(N'2019-01-18T13:33:40.880' AS DateTime), 1, 154)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (615, 4, NULL, N'L-S Spine  Plain', 21, NULL, CAST(N'2018-10-21T17:34:57.583' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (616, 4, NULL, N'MRI ANGIOGRAPHY PERIPHERAL WITH CONTRAST', 1, NULL, CAST(N'2018-10-25T13:02:06.113' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (617, 4, NULL, N'MRA', 1, 1, CAST(N'2018-10-25T13:02:44.077' AS DateTime), CAST(N'2019-01-18T13:25:18.137' AS DateTime), 1, 140)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (618, 4, NULL, N'MRV', 1, 1, CAST(N'2018-10-25T13:03:05.720' AS DateTime), CAST(N'2019-01-18T13:29:41.470' AS DateTime), 1, 170)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (619, 4, NULL, N'MRCP', 1, 1, CAST(N'2018-10-25T13:04:04.443' AS DateTime), CAST(N'2019-01-18T13:25:37.820' AS DateTime), 1, 141)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (620, 4, NULL, N'MRI 2 SYSTEM PLAIN', 1, NULL, CAST(N'2018-10-25T13:04:43.320' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (621, 4, NULL, N'MRI 2 SYSTEM PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T13:05:53.023' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (622, 4, NULL, N'MRI ABDOMEN AND PELVIS PLAIN', 1, NULL, CAST(N'2018-10-25T13:07:04.057' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (623, 4, NULL, N'MRI ABDOMEN AND PELVIS PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T13:08:29.563' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (624, 4, NULL, N'MRI FISTULOGRAM', 1, NULL, CAST(N'2018-10-25T13:09:24.803' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (625, 4, NULL, N'MRI UROGRAM', 1, NULL, CAST(N'2018-10-25T13:10:08.220' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (626, 4, NULL, N'MRI BILATERAL HIP', 1, 1, CAST(N'2018-10-25T13:10:51.650' AS DateTime), CAST(N'2019-01-18T13:35:11.137' AS DateTime), 1, 157)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (627, 4, NULL, N'MRI SINGLE HIP', 1, 1, CAST(N'2018-10-25T13:11:24.717' AS DateTime), CAST(N'2019-01-18T13:35:16.433' AS DateTime), 1, 157)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (628, 4, NULL, N'MRI ANY JOINT PLAIN', 1, NULL, CAST(N'2018-10-25T13:12:44.987' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (629, 4, NULL, N'MRI ANY JOINT PLAIN', 1, NULL, CAST(N'2018-10-25T13:12:45.003' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (630, 4, NULL, N'MRI ANY JOINT PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T13:14:13.753' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (631, 4, NULL, N'MRI BREAST PLAIN', 1, NULL, CAST(N'2018-10-25T13:14:59.163' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (632, 4, NULL, N'MRI BREAST PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T13:15:53.700' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (633, 4, NULL, N'MRI C-SPINE PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T13:16:51.717' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (634, 4, NULL, N'MRI C-SPINE PLAIN', 1, NULL, CAST(N'2018-10-25T13:18:06.370' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (635, 4, NULL, N'MRI D-SPINE PLAIN', 1, NULL, CAST(N'2018-10-25T13:18:54.697' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (636, 4, NULL, N'MRI D-SPINE PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T13:19:42.670' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (637, 4, NULL, N'MRI DYNAMIC/FUNCTIONAL/TRACTOGRAPHY ', 1, NULL, CAST(N'2018-10-25T13:21:28.347' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (638, 4, NULL, N'MRI HEAD PLAIN', 1, NULL, CAST(N'2018-10-25T13:22:05.060' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (639, 4, NULL, N'MRI HEAD PLAIN AND CONTRAST ', 1, NULL, CAST(N'2018-10-25T13:22:50.773' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (640, 4, NULL, N'MRI HEAD WITH STROKE/EPILEPSY PROTOCOL', 1, NULL, CAST(N'2018-10-25T13:24:19.443' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (641, 4, NULL, N'MRI LEG/THIGH/ARM PLAIN', 1, 1, CAST(N'2018-10-25T13:26:05.633' AS DateTime), CAST(N'2019-01-18T14:39:04.583' AS DateTime), 1, 159)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (642, 4, NULL, N'MRI LEG/THIGH/ARM PLAIN AND CONTRAST', 1, 1, CAST(N'2018-10-25T13:27:30.080' AS DateTime), CAST(N'2019-01-18T14:39:14.923' AS DateTime), 1, 159)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (643, 4, NULL, N'MRI LS-SPINE PLAIN AND CONTRAST', 1, 1, CAST(N'2018-10-25T14:17:05.037' AS DateTime), CAST(N'2019-01-18T14:40:06.843' AS DateTime), 1, 160)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (644, 4, NULL, N'MRI LS-SPINE PLAIN', 1, 1, CAST(N'2018-10-25T14:17:36.983' AS DateTime), CAST(N'2019-01-18T14:40:14.240' AS DateTime), 1, 160)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (645, 4, NULL, N'MRI NECK PLAIN', 1, 1, CAST(N'2018-10-25T14:18:06.323' AS DateTime), CAST(N'2019-01-18T14:41:10.603' AS DateTime), 1, 161)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (646, 4, NULL, N'MRI NECK PLAIN AND CONTRAST', 1, 1, CAST(N'2018-10-25T14:18:33.273' AS DateTime), CAST(N'2019-01-18T14:41:17.573' AS DateTime), 1, 161)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (647, 4, NULL, N'MRI ORBIT/PNS PLAIN', 1, NULL, CAST(N'2018-10-25T14:19:28.717' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (648, 4, NULL, N'MRI BRAIN AND SPINE', 1, 1, CAST(N'2018-10-25T14:19:49.947' AS DateTime), CAST(N'2019-01-18T13:30:10.310' AS DateTime), 1, 148)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (649, 4, NULL, N'MRI BRACHIAL PLEXUS/LAUMBERARAL PLEXUS', 1, NULL, CAST(N'2018-10-25T14:20:53.877' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (650, 4, NULL, N'MRI ORBIT/PNS PLAIN AND CONTRAST', 1, NULL, CAST(N'2018-10-25T14:21:25.467' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (651, 4, NULL, N'MRI PELVIS PLAIN', 1, 1, CAST(N'2018-10-25T14:21:52.947' AS DateTime), CAST(N'2019-01-18T14:42:21.990' AS DateTime), 1, 162)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (652, 4, NULL, N'MRI PELVIS PLAIN AND CONSTRAST', 1, 1, CAST(N'2018-10-25T14:22:21.607' AS DateTime), CAST(N'2019-01-18T14:42:27.247' AS DateTime), 1, 162)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (653, 4, NULL, N'MRI SCREENING ANY PART', 1, NULL, CAST(N'2018-10-25T14:22:53.193' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (654, 4, NULL, N'MRI BRAIN AND SPECTROSCOPY', 1, NULL, CAST(N'2018-10-25T14:24:32.937' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (655, 4, NULL, N'MRI WHOLE SPINE PLAIN', 1, 1, CAST(N'2018-10-25T14:25:02.660' AS DateTime), CAST(N'2019-01-18T13:26:45.850' AS DateTime), 1, 143)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (656, 4, NULL, N'MRI WHOLE SPINE PLAIN AND CONTRAST', 1, 1, CAST(N'2018-10-25T14:27:06.957' AS DateTime), CAST(N'2019-01-18T13:26:37.083' AS DateTime), 1, 143)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (657, 4, NULL, N'MRI WHOLE SPINE SCREENING ONLY', 1, 1, CAST(N'2018-10-25T14:28:01.350' AS DateTime), CAST(N'2019-01-18T13:26:29.743' AS DateTime), 1, 142)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (658, 4, NULL, N'MRI WITH CONTRAST - EXTRA', 1, NULL, CAST(N'2018-10-25T14:29:32.563' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (659, 4, NULL, N'Screening si joints', 21, NULL, CAST(N'2018-10-25T18:18:43.753' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (660, 4, NULL, N'MRI L-S Spine Plain', 21, NULL, CAST(N'2018-10-26T07:53:59.653' AS DateTime), NULL, 1, NULL)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (661, 1, NULL, N'Wrist  Single', 21, 1, CAST(N'2018-10-26T11:08:53.953' AS DateTime), CAST(N'2019-01-18T13:24:31.570' AS DateTime), 1, 132)
GO
INSERT [dbo].[RAD_MST_ImagingItem_TEMP] ([ImagingItemId], [ImagingTypeId], [ProcedureCode], [ImagingItemName], [CreatedBy], [ModifiedBy], [CreatedOn], [ModifiedOn], [IsActive], [TemplateId]) VALUES (662, 4, NULL, N'MRI Shoulder joint Single', 21, 1, CAST(N'2018-10-28T15:36:05.700' AS DateTime), CAST(N'2019-01-18T14:43:10.260' AS DateTime), 1, 164)
GO

SET IDENTITY_INSERT [dbo].[RAD_MST_ImagingItem_TEMP] OFF
GO


----4. ImagingItem -> Update TemplateId of existing table by those from Temporary Table--
Update itm
SET Itm.TemplateId = itmNew.TemplateId
From RAD_MST_ImagingItem itm, RAD_MST_ImagingItem_Temp itmNew
where itm.ImagingItemId=itmNew.ImagingItemId  and itm.ImagingItemName=itmNew.ImagingItemName
GO


---	5. Delete Temporary table created for ImagingItem--- 
If OBJECT_ID('RAD_MST_ImagingItem_TEMP') IS NOT NULL
BEGIN
 DROP TABLE RAD_MST_ImagingItem_TEMP
END
GO

