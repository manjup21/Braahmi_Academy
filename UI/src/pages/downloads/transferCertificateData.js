import { collegeReport } from '../../config/collegeReport';
import { todayDateOnly } from '../../utils/dateOnly';
import { formatDateOfBirthInWordsTc, formatDobNumeric } from '../../utils/dateToWordsEn';
import { blankStr as blank } from '../../utils/pdfHelpers';
import { formatStudentGender, formatStudentMedium } from '../../utils/studentDisplay';

export const TC_YES_NO_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const TC_STANDARD_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'first', label: 'I PUC (Pratham)' },
  { value: 'second', label: 'II PUC (Dwitiya)' },
];

export const TC_MEDIUM_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'English', label: 'English' },
  { value: 'Kannada', label: 'Kannada' },
];

/** Every field the certificate prints; values not on the student record are asked in the dialog. */
export function createEmptyTcForm() {
  return {
    studentName: '',
    admissionNo: '',
    gender: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    placeOfBirth: '',
    taluk: '',
    district: '',
    state: '',
    nationality: '',
    religion: '',
    caste: '',
    subCaste: '',
    scSt: '',
    qualifiedForPromotion: '',
    standardYear: '',
    standardInWords: '',
    languages: '',
    optionalSubjects: '',
    medium: '',
    admissionDate: '',
    feesPaid: '',
    feeConcession: '',
    scholarship: '',
    lastAttendanceDate: '',
    applicationDate: '',
    issueDate: todayDateOnly(),
    collegeDays: '',
    daysAttended: '',
    conduct: '',
    place: collegeReport.place,
  };
}

/** "I PUC Science" → { year: 'first', words: 'First Year PUC (Science)' }. */
export function standardFromClassName(className) {
  const name = blank(className);
  const m = /^(II|I|1st|2nd|first|second)\s*(?:PUC|PU)?\b\s*[-–]?\s*(.*)$/i.exec(name);
  if (!m) return { year: '', words: '' };
  const year = /^(II|2nd|second)$/i.test(m[1]) ? 'second' : 'first';
  const stream = blank(m[2]);
  const words = `${year === 'second' ? 'Second' : 'First'} Year PUC${stream ? ` (${stream})` : ''}`;
  return { year, words };
}

export function prefillTcFormFromStudent(student, className = '') {
  const { year, words } = standardFromClassName(className);
  return {
    ...createEmptyTcForm(),
    studentName: [blank(student?.first_name), blank(student?.last_name)].filter(Boolean).join(' '),
    admissionNo: blank(student?.roll_number),
    gender: blank(student?.gender),
    dateOfBirth: blank(student?.date_of_birth).slice(0, 10),
    fatherName: blank(student?.father_name),
    motherName: blank(student?.mother_name),
    district: blank(student?.address_district),
    state: blank(student?.address_state),
    standardYear: year,
    standardInWords: words,
    optionalSubjects: blank(student?.specialisation),
    medium: student?.medium ? formatStudentMedium(student.medium) : '',
  };
}

const yesNo = (v) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '');
const genderLabel = (v) => (blank(v) ? formatStudentGender(v) : '');

/**
 * Values printed on the certificate. `null` form → blank form for hand filling
 * (only the college's own name and code are pre-printed).
 */
export function buildTransferCertificateRecord(form) {
  const base = { collegeName: collegeReport.collegeName, collegeCode: collegeReport.collegeCode };
  if (!form) return base;
  const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, blank(v)]));
  return {
    ...base,
    admissionNo: f.admissionNo,
    studentName: f.studentName.toUpperCase(),
    placeOfBirth: f.placeOfBirth,
    district: f.district,
    taluk: f.taluk,
    state: f.state,
    sex: genderLabel(f.gender),
    nationality: f.nationality,
    religion: f.religion,
    caste: f.caste,
    subCaste: f.subCaste,
    fatherName: f.fatherName.toUpperCase(),
    motherName: f.motherName.toUpperCase(),
    scSt: yesNo(f.scSt),
    qualifiedForPromotion: yesNo(f.qualifiedForPromotion),
    dobFigures: formatDobNumeric(f.dateOfBirth),
    dobWords: formatDateOfBirthInWordsTc(f.dateOfBirth),
    standardYear: f.standardYear,
    standardInWords: f.standardInWords,
    languages: f.languages,
    optionalSubjects: f.optionalSubjects,
    medium: f.medium,
    admissionDate: formatDobNumeric(f.admissionDate),
    feesPaid: yesNo(f.feesPaid),
    feeConcession: f.feeConcession,
    scholarship: f.scholarship,
    lastAttendanceDate: formatDobNumeric(f.lastAttendanceDate),
    applicationDate: formatDobNumeric(f.applicationDate),
    issueDate: formatDobNumeric(f.issueDate),
    collegeDays: f.collegeDays,
    daysAttended: f.daysAttended,
    conduct: f.conduct,
    place: f.place,
    rollNumber: f.admissionNo,
  };
}
