////////////////////////// Age

// Chooses August 1st of the current year based on current date
var text recentAugust = "August 1, " & (If(Month(Today())>=8, Year(Today()), Month(Today())<=7, Year(Today())-1));

// Calculates the age of a student as of correct August 1st date.
var number age = Floor((Year(ToDate($recentAugust))-Year([Date of Birth])-1)+
If(Month(ToDate($recentAugust))>Month([Date of Birth]),1,0)+
If(Month(ToDate($recentAugust))=Month([Date of Birth]) and Day(ToDate($recentAugust))>=Day([Date of Birth]),1,0));

// Determines eligibility under age rule
// HS must be <=18. MS must be <=14. OL must be between 16-22. ES must be in grades 4-5
var bool ageOverride = If([Override - Age] = true and [Override - Age - Expiration]>=Today(), true, false);
var bool ageOverrideOL = If(
  [Override - Age (OL)] = true and [Override - Age (OL) - Expiration Date]>=Today(), true, false);

var bool ageEligibilityHS = If($ageOverride=true or $age<=18, true, false);
var bool ageEligibilityMS = If($ageOverride=true or $age<=14, true, false);
var bool ageEligibilityES = If($ageOverride=true or [Grade]="4" or [Grade]="5", true, false);
var bool ageEligibilityOL = If(
  $ageOverrideOL=true, true,
  $age>=16 and $age<=22, true,
  false);


////////////////////// Semesters

// Converts SYs to an actual year (ex. SY2016-17 --> 2017)
var number firstNinthSy = ToNumber(Right([First Ninth Grade Year], 2)) + 2000;
var number firstSixthSy = ToNumber(Right([First Sixth Grade Year], 2)) + 2000;
var number currentSy = If(Month(Today())<=7, Year(Today()), Month(Today())>=8, Year(Today())+1);
var number nextSy = $currentSy + 1;

// Calculates the number of years in HS or MS as a proxy for number of semesters.
// Assumes continuous enrollment from beginning of First 6th/9th grade year.
var number yearsHS = $currentSy - $firstNinthSy + 1;
var number yearsMS = $currentSy- $firstSixthSy + 1;

// Determines age & semesters eligibility
// MS kids are assumed eligible if they're <=13. MS students age=14 must be hand-verified
// The overall status field will catch MS kids that are age=14 for closer review
var bool semesterOverride = If(
  [Override - Semesters] = true and [Override - Semesters - Expiration Date]>=Today(), true,
  false);

var bool semesterEligibilityHS = If(
  $semesterOverride=true or $yearsHS<=4, true,
  false);
var text semesterEligibilityMS = If(
  $yearsMS>=4, "ineligible",
  $semesterOverride=true or $age<=13, "eligible",
  "requires hand verification");




//////////////////// Academics

// Determines which term's grades should be evaluated based on the current date.
// Values below are based mark entry deadlines for SY22-23
// QB generally looks at a new term two weeks after the end-of-term date
// Term 4 = Jul 1 - Nov 20
// Term 1 = Nov 21 - Feb 8
// Term 2 = Feb 9 - May 1
// Term 3 = May 2 - Jun 30
var text currentTerm = If(
  Month(Today())=7 or Month(Today())=8 or Month(Today())=9 or Month(Today())=10 or Month(Today())=11 and Day(Today())<=20, "Term 4",
  Month(Today())=11 and Day(Today())>=21 or Month(Today())=12 or Month(Today())=1 or Month(Today())=2 and Day(Today())<=8, "Term 1",
  Month(Today())=2 and Day(Today())>=9 or Month(Today())=3  or Month(Today())=4 or Month(Today())=5 and Day(Today())<=1, "Term 2",
  Month(Today())=5 and Day(Today())>=2 or Month(Today())=6, "Term 3");


// Check for academic eligibility.
// OL: Students must have no F's on prior report card
var bool academicOverrideOL = If(
  [Override - Grades (OL)]=true and [Override - Grades (OL) - Expiration Date]>=Today(), true);

var bool academicEligibilityOL = If(
  $academicOverrideOL=true, true,
  $currentTerm="Term 1" and [# of Fs in Term 1]=0, true,
  $currentTerm="Term 2" and [# of Fs in Term 2]=0, true,
  $currentTerm="Term 3" and [# of Fs in Term 3]=0, true,
  $currentTerm="Term 4" and [# of Fs in Term 4]=0, true,
  $currentTerm="Term 4" and [# of Fs in Final Marks]=0, true,
  $currentTerm="Term 1" and IsNull([# of Fs in Term 1]), true,
  $currentTerm="Term 2" and IsNull([# of Fs in Term 2]), true,
  $currentTerm="Term 3" and IsNull([# of Fs in Term 3]), true,
  $currentTerm="Term 4" and IsNull([# of Fs in Term 4]), true,
  $currentTerm="Term 4" and IsNull([# of Fs in Final Marks]), true,
  false);



/////////////////////// Participation Forms

// Converts current date to a SY value that can be matched against what is entered in the [Consent Form - Valid School Year] field. Example: "October 10, 2018" becomes "2018-19". The SY transitions on July 1. This variable is different from the one called earlier in the script ($currentSy)
var text currentSYwithHyphen = If(
  Month(Today())>=7, Year(Today()) &"-" & Right(ToText(Year(AdjustYear(Today(),1))), 2),
  Month(Today())<=6, Year(AdjustYear(Today(),-1)) & "-" & Right(ToText(Year(Today())),2)
  );
var text nextSYwithHyphen = If(
  Month(Today())>=7, AdjustYear(Today(),1) &"-" & Right(ToText(Year(AdjustYear(Today(),2))), 2),
  Month(Today())<=6, Year(AdjustYear(Today(),0)) & "-" & Right(ToText(AdjustYear(Today(),1)),2)
  );

// Must have a UHC <1 year old and an uploaded Consent and Medical Packet with a valid school year value
var bool paperworkOverride = If(
  [Override - Missing Paperwork]=true and [Override - Missing Paperwork - Expiration]>=Today(), true,
  false);

var bool participationForms = If(
  $paperworkOverride=true, true,
  [Consent and Medical Packet]<>"" and [Consent Packet - Valid School Year]=$currentSYwithHyphen and [UHC Form - Date of Exam]>=(Today()-Days(365)), true,
  [Consent and Medical Packet]<>"" and [Consent Packet - Valid School Year]=$nextSYwithHyphen and [UHC Form - Date of Exam]>=(Today()-Days(365)), true,
  false);





/////////////////////// Transfer

// Checks if supporting documents for a transfer waiver have been uploaded in last 365 days
var bool hasAllTransferForms = If(
  [Supporting Documentation]<>"" and [Supporting Documentation - Upload Date]>=(Today()-Days(366)), true,
  false);

// Checks if a student has an override
var bool transferOverride = If(
  [Override - Transfer Status]=true and [Override - Transfer Status - Expiration Date]>=Today(), true,
  false);

// Checks if a student is a transfer
var bool isTransferStudent = If(
  $transferOverride=true, false,
  // meet requirement if true freshman
  $yearsHS<=1, false,
  // meet requiremnt if not HS-age student
  [Competition Level] <> "HS", false,
  // meet requirement if enrolled at school for at least one calendar year OR enrolled prior to Aug 31 of prior school year
  $yearsHS>1 and [Date First Enrolled at Current School]>=(Today()-Days(365)) and [Date First Enrolled at Current School]>= Date($currentSY - 2, 8, 31), true
  );




/////////////////////// Overall Status

var text overallOL = If(
  // age, grades, or semesters will automatically make ineligible
  $ageEligibilityOL = false or $academicEligibilityOL = false, "Ineligible",
  // everything required to be eligible
  $participationForms = true and $ageEligibilityOL = true and $academicEligibilityOL = true, "Eligible",
  // Ready for AT Review
  $participationForms = false and [Paperwork Ready for Review] = true and $ageEligibilityOL = true and $academicEligibilityOL = true, "Ready for AT Review",
  // Missing Paperwork
  $participationForms = false and $ageEligibilityOL = true and $academicEligibilityOL = true, "Missing Paperwork",
  // anything unexpected throws error
  "Error");

var text plaintextStatus = If(
  // overall overrides that Mike uses for DCSAA Review process
  [Override - Overall Eligibility]="Eligible" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Eligible",
  [Override - Overall Eligibility]="Ineligible - Denied by DCIAA" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Denied by DCIAA",
  [Override - Overall Eligibility]="Ineligible - Approved for Select Sports" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Approved for Select Sports",
  [Override - Overall Eligibility]="Ineligible - Denied by DCSAA" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Denied by DCSAA",
  [Override - Overall Eligibility]="Ineligible - Must Apply for DCSAA Waiver" and [Override - Overall Eligibility - Expiration Date]>=Today() and [DCSAA Packet - Ready for Central Office Review]=true, "Ineligible - Ready for DCSAA Review",
  [Override - Overall Eligibility]="Ineligible - Must Apply for DCSAA Waiver" and [Override - Overall Eligibility - Expiration Date]>=Today() and [DCSAA Packet - Date Emailed to OSSE]>=Today()-Days(60), "Ineligible - Under Review By DCSAA",
  [Override - Overall Eligibility]="Ineligible - Must Apply for DCSAA Waiver" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Must Apply for DCSAA Waiver",
  // status for students by comptition rules
  $overallOL);

$plaintextStatus
