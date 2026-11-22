import jsPDF from 'jspdf';

import { collegeReport } from '../config/collegeReport';
import { sanitizeFilePart } from './fileExport';
import { blankStr, loadImageAsDataUrl } from './pdfHelpers';
import { formatStudentMedium, formatStudentType } from './studentDisplay';

export const BULK_MARKS_CARD_MAX = 200;

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const BORDER = 22;
const LEFT = 40;
const RIGHT = PAGE_W - 40;
const CENTER_X = PAGE_W / 2;

/** Blue theme with gold accents from the college crest. */
const C = {
  primary: [24, 78, 160],
  primaryDeep: [14, 48, 108],
  gold: [226, 152, 22],
  goldSoft: [255, 247, 228],
  tint: [228, 239, 252],
  headerWash: [238, 245, 253],
  zebra: [246, 250, 254],
  line: [150, 180, 220],
  text: [25, 35, 55],
  muted: [70, 90, 120],
  accent: [20, 95, 190],
  white: [255, 255, 255],
  fail: [185, 35, 45],
};

const setFill = (doc, rgb) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
const setDraw = (doc, rgb) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
const setText = (doc, rgb) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

/** Subjects whose first word is one of these are listed under Part-I Languages. */
const LANGUAGE_SUBJECTS = new Set([
  'kannada', 'english', 'hindi', 'sanskrit', 'urdu', 'tamil', 'telugu',
  'malayalam', 'marathi', 'arabic', 'french', 'german',
]);

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const ONES = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
  'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN',
];
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}

/** Integer to uppercase English words, Indian grouping: 331 → "THREE HUNDRED AND THIRTY ONE". */
export function numberToWords(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 0) return '';
  if (n === 0) return 'ZERO';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor(n / 100000) % 100;
  const thousand = Math.floor(n / 1000) % 100;
  const hundred = Math.floor(n / 100) % 10;
  const rest = n % 100;
  const parts = [];
  if (crore) parts.push(`${numberToWords(crore)} CRORE`);
  if (lakh) parts.push(`${twoDigits(lakh)} LAKH`);
  if (thousand) parts.push(`${twoDigits(thousand)} THOUSAND`);
  if (hundred) parts.push(`${ONES[hundred]} HUNDRED`);
  if (rest) parts.push(`${parts.length ? 'AND ' : ''}${twoDigits(rest)}`);
  return parts.join(' ');
}

/** 79 → "Seventy Nine" */
function numberToTitleWords(value) {
  return numberToWords(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, 'and');
}

export function isLanguageSubject(name) {
  const first = String(name ?? '').trim().toLowerCase().split(/[\s\-(/]+/)[0];
  return LANGUAGE_SUBJECTS.has(first);
}

function parseDateOnly(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(blankStr(value));
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null;
}

function formatMonthYear(value) {
  const d = parseDateOnly(value);
  return d ? `${MONTHS[d.m - 1]} ${d.y}` : '—';
}

function formatYearMonth(value) {
  const d = parseDateOnly(value);
  return d ? `${d.y}/${MONTHS[d.m - 1]}` : '—';
}

function formatDdMmYyyy(value) {
  const d = parseDateOnly(value);
  if (!d) return '—';
  return `${String(d.d).padStart(2, '0')}/${String(d.m).padStart(2, '0')}/${d.y}`;
}

/** "I PUC" → "first", "II PUC" → "second"; null when the class name doesn't say. */
function puYearWord(className) {
  const name = blankStr(className);
  if (/\bII\b|\b2nd\b|second/i.test(name)) return 'second';
  if (/\bI\b|\b1st\b|first/i.test(name)) return 'first';
  return null;
}

/**
 * Per-subject rows + totals for one student. Part B subjects are left out;
 * absent counts as 0 and fails the subject when it has a pass mark.
 */
export function computeMarksCardSummary(subjects, resultRow) {
  const marksById = new Map(
    (Array.isArray(resultRow?.marks) ? resultRow.marks : []).map((m) => [String(m.subject_id), m])
  );
  const rows = (Array.isArray(subjects) ? subjects : [])
    .filter((s) => !s.is_part_b)
    .map((s) => {
      const entry = marksById.get(String(s.id));
      const absent = Boolean(entry?.is_absent);
      const mark = absent || entry?.mark == null || entry.mark === '' ? null : Number(entry.mark);
      const passing = s.passing_marks == null ? null : Number(s.passing_marks);
      return {
        id: s.id,
        name: blankStr(s.name),
        examDate: s.exam_date,
        max: Number(s.max_marks) || 0,
        mark: Number.isFinite(mark) ? mark : null,
        absent,
        failed: passing != null && (absent || mark == null || mark < passing),
        isLanguage: isLanguageSubject(s.name),
      };
    });
  const maxTotal = rows.reduce((sum, r) => sum + r.max, 0);
  const obtained = rows.reduce((sum, r) => sum + (r.mark ?? 0), 0);
  return {
    rows,
    maxTotal,
    obtained,
    percentage: maxTotal > 0 ? (obtained / maxTotal) * 100 : null,
    passed: rows.length > 0 && rows.every((r) => !r.failed),
  };
}

/** Transparent crest so it blends into the tinted header (the PDF logo has a white square). */
export async function loadMarksCardLogo() {
  return (await loadImageAsDataUrl('/logo.png?v=3')) ?? loadImageAsDataUrl(collegeReport.logoUrl);
}

function fitFontSize(doc, text, maxWidth, start, min) {
  let size = start;
  doc.setFontSize(size);
  while (size > min && doc.getTextWidth(text) > maxWidth) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  return size;
}

function cell(doc, x, y, w, h, text, { fill, color = C.text, bold = false, align = 'center', size = 10.5 } = {}) {
  setDraw(doc, C.line);
  doc.setLineWidth(0.6);
  if (fill) {
    setFill(doc, fill);
    doc.rect(x, y, w, h, 'FD');
  } else {
    doc.rect(x, y, w, h);
  }
  const value = blankStr(text);
  if (!value) return;
  doc.setFont('times', bold ? 'bold' : 'normal');
  setText(doc, color);
  fitFontSize(doc, value, w - 8, size, 7);
  const tx = align === 'left' ? x + 5 : x + w / 2;
  doc.text(value, tx, y + h / 2 + 3.6, { align: align === 'left' ? 'left' : 'center' });
}

/** "Label: value" with a coloured label; `align` is where the whole pair is anchored. */
function labelValue(doc, label, value, x, y, align = 'left', size = 10.5) {
  doc.setFontSize(size);
  doc.setFont('times', 'bold');
  const labelText = `${label}: `;
  const lw = doc.getTextWidth(labelText);
  const vw = doc.getTextWidth(value);
  const start = align === 'right' ? x - lw - vw : align === 'center' ? x - (lw + vw) / 2 : x;
  setText(doc, C.primary);
  doc.text(labelText, start, y);
  setText(doc, C.text);
  doc.text(value, start + lw, y);
}

function drawPageFrame(doc) {
  setDraw(doc, C.primaryDeep);
  doc.setLineWidth(2);
  doc.rect(16, 16, PAGE_W - 32, PAGE_H - 32);
  setDraw(doc, C.gold);
  doc.setLineWidth(1.1);
  doc.rect(BORDER - 1, BORDER - 1, PAGE_W - (BORDER - 1) * 2, PAGE_H - (BORDER - 1) * 2);

  setFill(doc, C.headerWash);
  doc.rect(BORDER, BORDER, PAGE_W - BORDER * 2, 88, 'F');
  setFill(doc, C.gold);
  doc.rect(BORDER, BORDER + 88, PAGE_W - BORDER * 2, 3, 'F');
}

function drawHeader(doc, logo) {
  const logoSize = 64;
  const logoX = BORDER + 8;
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', logoX, 34, logoSize, logoSize, undefined, 'FAST');
    } catch {
      /* skip broken logo */
    }
  }
  const textX = CENTER_X + 20;
  const textW = 2 * Math.min(textX - (logoX + logoSize + 6), RIGHT - textX);
  setText(doc, C.muted);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text(collegeReport.association, textX, 49, { align: 'center' });

  setText(doc, C.primaryDeep);
  fitFontSize(doc, collegeReport.collegeName, textW, 18.5, 12);
  doc.text(collegeReport.collegeName, textX, 72, { align: 'center' });

  setText(doc, C.accent);
  doc.setFont('times', 'normal');
  fitFontSize(doc, collegeReport.address, textW, 14, 10);
  doc.text(collegeReport.address, textX, 93, { align: 'center' });

  if (collegeReport.collegeCode) {
    labelValue(doc, 'College Code', collegeReport.collegeCode, RIGHT - 4, BORDER + 106, 'right', 11);
  }
}

function drawTitle(doc, title, y) {
  doc.setFont('times', 'bold');
  const size = fitFontSize(doc, title, RIGHT - LEFT - 40, 13.5, 10);
  const w = doc.getTextWidth(title) + 30;
  const h = size + 14;
  setFill(doc, C.primary);
  setDraw(doc, C.gold);
  doc.setLineWidth(1.6);
  doc.roundedRect(CENTER_X - w / 2, y, w, h, 3, 3, 'FD');
  setText(doc, C.white);
  doc.text(title, CENTER_X, y + h / 2 + size * 0.35, { align: 'center' });
  return y + h;
}

function drawDetails(doc, rows, y) {
  const lineH = 21;
  const h = rows.length * lineH + 10;
  setFill(doc, C.headerWash);
  setDraw(doc, C.line);
  doc.setLineWidth(0.9);
  doc.roundedRect(LEFT, y, RIGHT - LEFT, h, 3, 3, 'FD');
  const columns = [LEFT + 8, CENTER_X + 40];
  rows.forEach((pair, i) => {
    const baseline = y + 19 + i * lineH;
    pair.forEach(([label, value], col) => {
      const x = columns[col];
      const maxW = (col === 0 ? columns[1] - 12 : RIGHT - 4) - x;
      doc.setFont('times', 'bold');
      doc.setFontSize(11.5);
      setText(doc, C.primary);
      const labelText = `${label}:`;
      doc.text(labelText, x, baseline);
      const lw = doc.getTextWidth(labelText) + 4;
      setText(doc, C.text);
      fitFontSize(doc, value, maxW - lw, 11.5, 8);
      doc.text(value, x + lw, baseline);
    });
  });
  return y + h;
}

function drawMarksTable(doc, summary, examDate, y) {
  const widths = [150, 90, 80, 80, RIGHT - LEFT - 400];
  const xs = widths.reduce((acc, w, i) => [...acc, acc[i] + w], [LEFT]);
  const headH = 22;
  const rowH = 20;
  const top = y;
  const head = { fill: C.primary, color: C.white, bold: true, size: 11.5 };

  cell(doc, xs[0], y, widths[0], headH * 2, 'Subjects', head);
  cell(doc, xs[1], y, widths[1], headH * 2, 'Month/Year', head);
  cell(doc, xs[2], y, widths[2], headH * 2, 'Max Marks', head);
  cell(doc, xs[3], y, widths[3] + widths[4], headH, 'Marks Obtained', head);
  cell(doc, xs[3], y + headH, widths[3], headH, 'In Figures', { ...head, size: 11 });
  cell(doc, xs[4], y + headH, widths[4], headH, 'In Words', { ...head, size: 11 });
  y += headH * 2;

  let rowIndex = 0;
  for (const r of summary.rows) {
    const figures = r.absent ? 'AB' : r.mark == null ? '—' : String(r.mark);
    const words = r.absent ? 'Absent' : r.mark == null ? '—' : numberToTitleWords(r.mark);
    const fill = rowIndex % 2 === 1 ? C.zebra : C.white;
    const markColor = r.failed ? C.fail : C.accent;
    cell(doc, xs[0], y, widths[0], rowH, r.name, { fill, color: C.primaryDeep, bold: true, align: 'left', size: 11.5 });
    cell(doc, xs[1], y, widths[1], rowH, formatMonthYear(r.examDate || examDate), { fill, size: 10 });
    cell(doc, xs[2], y, widths[2], rowH, String(r.max || '—'), { fill, size: 10 });
    cell(doc, xs[3], y, widths[3], rowH, figures, { fill, color: markColor, bold: true, size: 10.5 });
    cell(doc, xs[4], y, widths[4], rowH, words, { fill, color: r.failed ? C.fail : C.text, size: 10 });
    y += rowH;
    rowIndex += 1;
  }

  const pct = summary.percentage == null ? '—' : `${Math.round(summary.percentage)} %`;
  const total = { fill: C.tint, color: C.primaryDeep, bold: true, size: 11 };
  cell(doc, xs[0], y, widths[0], rowH + 2, '', total);
  cell(doc, xs[1], y, widths[1], rowH + 2, 'Total Marks', total);
  cell(doc, xs[2], y, widths[2], rowH + 2, String(summary.maxTotal), total);
  cell(doc, xs[3], y, widths[3], rowH + 2, String(summary.obtained), { ...total, color: C.accent });
  cell(doc, xs[4], y, widths[4], rowH + 2, `Percentage: ${pct}`, total);
  y += rowH + 2;

  cell(doc, xs[0], y, widths[0], rowH + 6, 'Marks in Words', {
    fill: C.tint,
    color: C.primaryDeep,
    bold: true,
    size: 11.5,
  });
  cell(doc, xs[1], y, RIGHT - xs[1], rowH + 6, `${numberToWords(summary.obtained)} ONLY`, {
    fill: C.tint,
    color: C.accent,
    bold: true,
    size: 12.5,
  });
  y += rowH + 6;

  setDraw(doc, C.primary);
  doc.setLineWidth(1.2);
  doc.rect(LEFT, top, RIGHT - LEFT, y - top);
  return y;
}

function drawFooter(doc, { studentType, medium, resultDate }, y) {
  labelValue(doc, 'Student type', studentType, LEFT + 4, y, 'left');
  labelValue(doc, 'Medium', medium, CENTER_X, y, 'center');
  labelValue(doc, 'Date of result', resultDate, RIGHT - 4, y, 'right');

  const lineY = PAGE_H - 112;
  setDraw(doc, C.primaryDeep);
  doc.setLineWidth(0.8);
  doc.line(LEFT + 4, lineY, LEFT + 170, lineY);
  doc.line(RIGHT - 200, lineY, RIGHT - 4, lineY);
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  setText(doc, C.primaryDeep);
  doc.text('Signature of the candidate', LEFT + 4, lineY + 16);
  doc.text('Signature of the Principal with seal', RIGHT - 4, lineY + 16, { align: 'right' });
}

/**
 * One A4 marks card for a result row from `/examinations/:id/results/full`.
 * @returns {Promise<{ blob?: Blob, filename: string }>}
 */
export async function exportMarksCardPdf({
  exam,
  subjects,
  resultRow,
  className,
  resultDate,
  logo,
  returnBlob = false,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const summary = computeMarksCardSummary(subjects, resultRow);
  const examDate = exam?.exam_date;
  const studentName = blankStr(resultRow?.student_name).toUpperCase() || '—';
  const registerNumber = blankStr(resultRow?.register_number);

  drawPageFrame(doc);
  drawHeader(doc, logo === undefined ? await loadMarksCardLogo() : logo);

  const title = [blankStr(className), blankStr(exam?.test_name || exam?.exam_type_name), 'MARKS CARD']
    .filter(Boolean)
    .join(' ')
    .toUpperCase();
  let y = drawTitle(doc, title, 138) + 26;

  const yearWord = puYearWord(className);
  const course = yearWord ? `the ${yearWord} year pre-university` : 'the pre-university course';
  const sentence = summary.passed
    ? `This is to certify that the candidate mentioned below has completed the course and passed ${course} with the following details:`
    : `This is to certify that the candidate mentioned below has appeared for ${course} examination with the following details:`;
  doc.setFont('times', 'italic');
  doc.setFontSize(11.5);
  setText(doc, C.text);
  for (const line of doc.splitTextToSize(sentence, RIGHT - LEFT - 20)) {
    doc.text(line, CENTER_X, y, { align: 'center' });
    y += 18;
  }

  y = drawDetails(
    doc,
    [
      [["Candidate's Name", studentName], ['Register Number', registerNumber || '—']],
      [["Father's Name", blankStr(resultRow?.father_name).toUpperCase() || '—'], ['SATS Number', blankStr(resultRow?.sats_number) || '—']],
      [["Mother's Name", blankStr(resultRow?.mother_name).toUpperCase() || '—'], ['Exam Year/Month', formatYearMonth(examDate)]],
    ],
    y + 6
  );

  y = drawMarksTable(doc, summary, examDate, y + 24);

  const typeLabel = formatStudentType(resultRow?.student_type);
  const mediumLabel = formatStudentMedium(resultRow?.medium);
  drawFooter(
    doc,
    {
      studentType: typeLabel,
      medium: mediumLabel,
      resultDate: formatDdMmYyyy(resultDate),
    },
    y + 28
  );

  const idPart = sanitizeFilePart(registerNumber || resultRow?.roll_number || 'student', 40);
  const filename = `MarksCard_${idPart}_${sanitizeFilePart(studentName, 40)}.pdf`;
  if (returnBlob) return { blob: doc.output('blob'), filename };
  doc.save(filename);
  return { filename };
}
