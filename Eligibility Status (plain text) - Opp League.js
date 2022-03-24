
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
// Values below are based mark entry deadlines for SY19-20
// QB generally looks at a new term two weeks after the end-of-term date
// Term 4 = Jul 1 - Nov 12
// Term 1 = Nov 13 - Feb 7
// Term 2 = Feb 8 - Apr 21
// Term 3 = Apr 22 - Jun 30
var text currentTerm = If(
  Month(Today())=7 or Month(Today())=8 or Month(Today())=9 or Month(Today())=10 or Month(Today())=11 and Day(Today())<=12, "Term 4",
  Month(Today())=11 and Day(Today())>=13 or Month(Today())=12 or Month(Today())=1 or Month(Today())=2 and Day(Today())<=7, "Term 1",
  Month(Today())=2 and Day(Today())>=8 or Month(Today())=3  or Month(Today())=4 and Day(Today())<=21, "Term 2",
  Month(Today())=4 and Day(Today())>=22 or Month(Today())=5 or Month(Today())=6, "Term 3");


// Check for academic eligibility.
// HS: Students with a value of NA or 0.00 will be determined academically eligible. This is because Aspen typically does not calculate grades from prior schools into the GPA fields until after the student's first full term in DCPS. Any students in the beginning of their first year of HS will be determined academically eligible.
// MS: Students will determine in two ways. First, by the True/False fields of [MS Passing]. Second, by the numeric count fields of [# of Fs]. Passing either test will mark the student as eligible. This will allow a smooth transition when the new [# of Fs] fields come online in Aug 20, 2018.
// OL: Students must have no F's on prior report card
var bool academicOverride = If(
  [Override - Grades]=true and [Override - Grades - Expiration Date]>=Today(), true);

var bool academicOverrideOL = If(
  [Override - Grades (OL)]=true and [Override - Grades (OL) - Expiration Date]>=Today(), true);

var bool academicEligibilityHS = If(
  $academicOverride=true, true,
  $currentTerm="Term 1" and IsNull([GPA - Term 1]), true,
  $currentTerm="Term 2" and IsNull([GPA - Term 2]), true,
  $currentTerm="Term 3" and IsNull([GPA - Term 3]), true,
  $currentTerm="Term 4" and IsNull([GPA - Term 4]), true,
  $currentTerm="Term 4" and IsNull([GPA - Full Year]), true,
  $currentTerm="Term 1" and [GPA - Term 1]=0, true,
  $currentTerm="Term 2" and [GPA - Term 2]=0, true,
  $currentTerm="Term 3" and [GPA - Term 3]=0, true,
  $currentTerm="Term 4" and [GPA - Term 4]=0, true,
  $currentTerm="Term 4" and [GPA - Full Year]=0, true,
  $currentTerm="Term 1" and [GPA - Term 1]>=2, true,
  $currentTerm="Term 2" and [GPA - Term 2]>=2, true,
  $currentTerm="Term 3" and [GPA - Term 3]>=2, true,
  $currentTerm="Term 4" and [GPA - Term 4]>=2, true,
  $currentTerm="Term 4" and [GPA - Full Year]>=2, true,
  $currentTerm="Term 4" and $yearsHS=1, true,
  false);

var bool academicEligibilityMS = If(
  $academicOverride=true, true,
  $currentTerm="Term 1" and [# of Fs in Term 1]<=1, true,
  $currentTerm="Term 2" and [# of Fs in Term 2]<=1, true,
  $currentTerm="Term 3" and [# of Fs in Term 3]<=1, true,
  $currentTerm="Term 4" and [# of Fs in Term 4]<=1, true,
  $currentTerm="Term 4" and [# of Fs in Final Marks]<=1, true,
  false);

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


// Temporary overwrite for covid-19 grading policies
// Beginning in 2nd semester 2020, DCPS only assigned grades of A, B, P, or I. Under this grading scheme, all students will be academically eligible (MS, HS, and OL) despite data that may be available in Aspen. See here for more details: "https://dcpsreopenstrong.com/resources/grading/"
var bool academicEligibilityHS = true;
var bool academicEligibilityMS = true;
var bool academicEligibilityOL = true;



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

// Checks if a student is a transfer.
var bool transferOverride = If(
  [Override - Transfer Status]=true and [Override - Transfer Status - Expiration Date]>=Today(), true,
  false);

var bool isTransferStudent = If(
  $transferOverride=true, false,
  $yearsHS<=1, false,
  [Competition Level] <> "HS", false,
  $yearsHS>1 and [Date First Enrolled at Current School]>=(Today()-Days(365)), true
  );





//////////////////// Attendance

// Determines which term's grades should be evaluated based on the current date. Values below are based mark entry deadlines for SY19-20 (both calendars use the same dates). QB looks at exact dates. THESE ARE DIFFERENT TERM DATES THAN WHAT'S USED FOR ACADEMIC ELIGIBILITY.
// Term 1 = Jul 1 - Nov 1
// Term 2 = Nov 2 - Jan 24
// Term 3 = Jan 25 - Apr 7
// Term 4 = Apr 8 - Jun 30
var text currentTermForAttendance = If(
  Month(Today())=7 or Month(Today())=8 or Month(Today())=9 or Month(Today())=10 or Month(Today())=11 and Day(Today())<=1, "Term 1",
  Month(Today())=11 and Day(Today())>=2 or Month(Today())=12 or Month(Today())=1 and Day(Today())<=24, "Term 2",
  Month(Today())=1 and Day(Today())>=25 or Month(Today())=2  or Month(Today())=3 or Month(Today())=4 and Day(Today())<=7, "Term 3",
  Month(Today())=4 and Day(Today())>=8 or Month(Today())=5 or Month(Today())=6, "Term 4");


// Calculate attendnace eligibility. Students may have <=6 unexcused absences per term.
var bool attendanceOverride = If(
  [Override - Absences]=true and [Override - Absences - Expiration Date]>=Today(), true,
  false);

var bool attendanceEligibility = If(
  $attendanceOverride=true, true,
  $currentTermForAttendance="Term 1" and [Unexcused Absences - Term 1]<=6, true,
  $currentTermForAttendance="Term 2" and [Unexcused Absences - Term 2]<=6, true,
  $currentTermForAttendance="Term 3" and [Unexcused Absences - Term 3]<=6, true,
  $currentTermForAttendance="Term 4" and [Unexcused Absences - Term 4]<=6, true,
  false);






/////////////////////// Overall Status (traditional rules)

var text overallES = If(
  $ageEligibilityES = false, "Ineligible",
  $participationForms = true and $ageEligibilityES = true, "Eligible",
  $participationForms = false and $ageEligibilityES = true, "Missing Paperwork",
  $participationForms = false and [Paperwork Ready for review] = true and $ageEligibilityES = true, "Ready for AT Review");

var text overallMS = If(
  // age, grades, or semesters will automatically make ineligible
  $ageEligibilityMS = false or $academicEligibilityMS = false or $semesterEligibilityMS = "ineligible",
    "Ineligible",
  // everything required to be eligible
  $participationForms = true and $ageEligibilityMS = true and $academicEligibilityMS = true and
    $semesterEligibilityMS = "eligible", "Eligible",
  // intermediary statuses
  $participationForms = true and $ageEligibilityMS = true and $academicEligibilityMS = true and
    $semesterEligibilityMS = "requires hand verification", "Age 14 – Requires CO Approval",
  $participationForms = false and [paperwork ready for review] = true and $ageEligibilityMS = true and
    $academicEligibilityMS = true, "Ready for AT Review",
  $participationForms = false and $ageEligibilityMS = true and $academicEligibilityMS = true,
    "Missing Paperwork"
);

var text overallHS = If(
  // age, grades, semesters, or attendance will automatically make ineligible
  $ageEligibilityHS = false or $academicEligibilityHS = false or $semesterEligibilityHS = false
    or $attendanceEligibility = false, "Ineligible",
  // everything required to be eligible. 6 things: forms, grades, attendance, age, transfer status, and semesters
  $participationForms = true and $academicEligibilityHS = true and $attendanceEligibility = true and
    $ageEligibilityHS = true and $isTransferStudent = false and $semesterEligibilityHS = true, "Eligible",
  // missing paperwork
  $ageEligibilityHS = true and $academicEligibilityHS = true and $semesterEligibilityHS = true
    and $attendanceEligibility = true and $participationForms = false, "Missing Paperwork",
  // transfer student - missing Paperwork
  $ageEligibilityHS = true and $academicEligibilityHS = true and $semesterEligibilityHS = true
    and $attendanceEligibility = true and $participationForms = true and $isTransferStudent = true and $hasAllTransferForms = false, "Transfer Student - Missing Paperwork",
  // transfer student - ready for review
  $ageEligibilityHS = true and $academicEligibilityHS = true and $semesterEligibilityHS = true
    and $attendanceEligibility = true and $participationForms = true and $isTransferStudent = true and $hasAllTransferForms = true, "Transfer Student - On Track"
);

var text overallOL = If(
  // age, grades, or semesters will automatically make ineligible
  $ageEligibilityOL = false or $academicEligibilityOL = false, "Ineligible",
  // everything required to be eligible
  $participationForms = true and $ageEligibilityOL = true and $academicEligibilityOL = true, "Eligible",
  // intermediary statuses
  $participationForms = false and $ageEligibilityOL = true and $academicEligibilityOL = true, "Missing Paperwork",
  "error");

var text plaintextStatus = If(
  // overall overrides that Mike uses for DCSAA Review process
  [Central Office Override Determination]="Eligible" and [Override Expiration Date]>=Today(), "Eligible",
  [Central Office Override Determination]="Ineligible - Denied by DCIAA" and [Override Expiration Date]>=Today(), "Ineligible - Denied by DCIAA",
  [Central Office Override Determination]="Ineligible - Approved for Select Sports" and [Override Expiration Date]>=Today(), "Ineligible - Approved for Select Sports",
  [Central Office Override Determination]="Ineligible - Denied by DCSAA" and [Override Expiration Date]>=Today(), "Ineligible - Denied by DCSAA",
  [Central Office Override Determination]="Ineligible - Must Apply for DCSAA Waiver" and [Override Expiration Date]>=Today() and [DCSAA Packet - Ready for Central Office Review]=true, "Ineligible - Ready for DCSAA Review",
  [Central Office Override Determination]="Ineligible - Must Apply for DCSAA Waiver" and [Override Expiration Date]>=Today() and [DCSAA Packet - Date Emailed to OSSE]>=Today()-Days(60), "Ineligible - Under Review By DCSAA",
  [Central Office Override Determination]="Ineligible - Must Apply for DCSAA Waiver" and [Override Expiration Date]>=Today(), "Ineligible - Must Apply for DCSAA Waiver",
  // status for students by comptition rules
  $overallOL);

$plaintextStatus
