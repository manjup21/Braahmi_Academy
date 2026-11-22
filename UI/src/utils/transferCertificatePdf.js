import jsPDF from 'jspdf';

import { buildTransferCertificateRecord } from '../pages/downloads/transferCertificateData';
import { sanitizeFilePart } from './fileExport';
import { blankStr, blobToDataUrl } from './pdfHelpers';

/** Authorised Government of Karnataka emblem (PNG/JPEG). A dashed placeholder is drawn while it is missing. */
export const TC_EMBLEM_URL = '/karnataka-emblem.png';

const KN_FONT = {
  family: 'TC Noto Sans Kannada',
  files: { 400: '/fonts/noto-sans-kannada-400.woff2', 700: '/fonts/noto-sans-kannada-700.woff2' },
};

/** Kannada wording of the government form. */
const KN = {
  title: 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ',
  collegeName: 'ಕಾಲೇಜಿನ ಹೆಸರು :',
  admissionNo: 'ಪ್ರವೇಶ ಸಂಖ್ಯೆ :',
  studentName: 'ವಿದ್ಯಾರ್ಥಿಯ ಪೂರ್ಣ ಹೆಸರು :',
  placeOfBirth: 'ಹುಟ್ಟಿದ ಸ್ಥಳ :',
  district: 'ಜಿಲ್ಲೆ :',
  taluk: 'ತಾಲ್ಲೂಕು :',
  state: 'ರಾಜ್ಯ :',
  sex: 'ಲಿಂಗ :',
  religion: 'ಧರ್ಮ :',
  nationality: 'ರಾಷ್ಟ್ರೀಯತೆ :',
  subCaste: 'ಉಪ ಜಾತಿ :',
  caste: 'ಜಾತಿ :',
  father: 'ತಂದೆಯ ಹೆಸರು :',
  mother: 'ತಾಯಿಯ ಹೆಸರು :',
  scSt: 'ವಿದ್ಯಾರ್ಥಿ ಪರಿಶಿಷ್ಟ ಜಾತಿ ಅಥವಾ ಪರಿಶಿಷ್ಟ ಪಂಗಡಕ್ಕೆ ಸೇರಿದವರಾಗಿರುವರೇ?',
  promotion: 'ಮುಂದಿನ ತರಗತಿಗೆ ಉತ್ತೀರ್ಣರಾಗಲು ಅರ್ಹರಾಗಿರುವರೇ?',
  dob: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ (ಅಂಕಗಳಲ್ಲಿ ಮತ್ತು ಅಕ್ಷರಗಳಲ್ಲಿ)',
  standard: 'ಕಾಲೇಜನ್ನು ಬಿಡುವಾಗ ವಿದ್ಯಾರ್ಥಿಯು ಓದುತ್ತಿದ್ದ ತರಗತಿ (ಅಕ್ಷರಗಳಲ್ಲಿ)',
  first: 'ಪ್ರಥಮ',
  second: 'ದ್ವಿತೀಯ',
  puc: 'ಪಿ.ಯು.ಸಿ.',
  subjects: 'ಪ್ರಥಮ / ದ್ವಿತೀಯ ಪಿ.ಯು.ಸಿ. ತರಗತಿಯಲ್ಲಿ ವ್ಯಾಸಂಗ ಮಾಡಿದ ವಿಷಯಗಳು',
  part1: 'ಭಾಗ-I',
  part2: 'ಭಾಗ-II',
  languages: 'ಅಧ್ಯಯನ ಮಾಡಿದ ಭಾಷೆ(ಗಳು) :',
  optional: 'ಅಧ್ಯಯನ ಮಾಡಿದ ಐಚ್ಛಿಕ ವಿಷಯಗಳು :',
  medium: 'ಬೋಧನಾ ಮಾಧ್ಯಮ :',
  feesPaid: 'ಬಾಕಿಯಾದ ಎಲ್ಲಾ ಶುಲ್ಕಗಳನ್ನು, ವಿದ್ಯಾರ್ಥಿಯು ಪಾವತಿಸಿರುವರೇ?',
  concession: 'ಶುಲ್ಕ ವಿನಾಯಿತಿ ಯಾವುದಾದರೂ ಇದ್ದರೆ (ಸ್ವರೂಪ ಮತ್ತು ಅವಧಿಯನ್ನು',
  scholarship: 'ವಿದ್ಯಾರ್ಥಿ ವೇತನ ಯಾವುದಾದರೂ ಇದ್ದರೆ (ಸ್ವರೂಪ ಮತ್ತು ಅವಧಿಯನ್ನು',
  specify: 'ನಿರ್ದಿಷ್ಟಪಡಿಸಬೇಕು)',
  lastAttendance: 'ವಿದ್ಯಾರ್ಥಿಯ ಕಾಲೇಜಿಗೆ ಹಾಜರಾದ ಕೊನೆಯ',
  dateColon: 'ದಿನಾಂಕ :',
  application: 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರಕ್ಕಾಗಿ ಅರ್ಜಿ ಪಡೆದ ದಿನಾಂಕ',
  issued: 'ವರ್ಗಾವಣೆ ಪ್ರಮಾಣ ಪತ್ರ ನೀಡಿದ ದಿನಾಂಕ :',
  daysAttended: 'ವಿದ್ಯಾರ್ಥಿಯು ಕಾಲೇಜಿಗೆ ಹಾಜರಾದ ಒಟ್ಟು ದಿನಗಳು',
  conduct: 'ಶೀಲ ಮತ್ತು ಚಾರಿತ್ರ್ಯ',
  place: 'ಸ್ಥಳ',
  date: 'ದಿನಾಂಕ',
};

/** Blurred in the reference scan; proofread against the printed government form. */
const KN_UNCLEAR = {
  collegeCode: 'ಕಾಲೇಜು ಸಂಕೇತ ಸಂಖ್ಯೆ :',
  admissionDate: 'ಆ ತರಗತಿ ಅಥವಾ ತರಗತಿಗೆ ಪ್ರವೇಶ ಪಡೆದ ಅಥವಾ ಉತ್ತೀರ್ಣರಾದ ದಿನಾಂಕ :',
  collegeDays: 'ಕಾಲೇಜು ಬಿಟ್ಟ ದಿನಾಂಕದವರೆಗಿನ ಕೆಲಸದ ದಿನಗಳ ಸಂಖ್ಯೆ',
};

/* ------------------------------------------------------------------ */
/* Layout configuration (millimetres, A3 portrait)                     */
/* ------------------------------------------------------------------ */

const PT = 25.4 / 72;
const FRAME = { left: 10, top: 10, right: 287, bottom: 410, line: 0.5 };
const GRID_LINE = 0.3;

/** Geometry of the reference form in scan pixels; positions and row heights are scaled onto FRAME. */
const REF = { left: 19.5, top: 17, right: 702.5, bottom: 1012.5, divider: 380, tableTop: 148 };
const SX = (FRAME.right - FRAME.left) / (REF.right - REF.left);
const SY = (FRAME.bottom - FRAME.top) / (REF.bottom - REF.top);
const refX = (px) => FRAME.left + (px - REF.left) * SX;
const refY = (px) => FRAME.top + (px - REF.top) * SY;

const COLS = { left: FRAME.left, divider: refX(REF.divider), right: FRAME.right };
const TABLE_TOP = refY(REF.tableTop);
const FOOTER = {
  minHeight: 16,
  labelX: refX(41),
  placeDy: 6.1,
  dateDy: 13.3,
  placeDotsTo: refX(222),
  dateDotsTo: refX(251),
  signature: 'Signature / Signature',
  signatureX: refX(611),
  signatureDy: 10.9,
};

const CELL = {
  numX: 3.8,
  labelX: 16.6,
  padX: 2.5,
  padY: 0.8,
  valueGap: 2.5,
  minInlineWidth: 22,
  collegeCodeX: refX(440) - COLS.divider,
  collegeCodeDotsTo: refX(633) - COLS.divider,
  dottedFrom: refX(390) - COLS.divider,
  dottedTo: refX(615) - COLS.divider,
  standardX: refX(390) - COLS.divider,
};

/** Font sizes in pt. Kannada runs print at size × knScale (calibrated against the scan once the font loads). */
const TYPE = {
  label: 16,
  small: 14,
  tiny: 12.5,
  minLabel: 9,
  value: 15,
  minValue: 12,
  standard: 18,
  enPitch: 1.2,
  knPitch: 1.38,
  /** Whole-table font scales tried in order until long entries fit on the page. */
  fitScales: [1, 0.95, 0.9, 0.85, 0.8, 0.75],
  knScale: 0.8,
  /** "ಕಾಲೇಜಿನ ಹೆಸರು" spans this many mm at TYPE.label in the scan. */
  knCalibration: { text: 'ಕಾಲೇಜಿನ ಹೆಸರು', width: 30.6, min: 0.65, max: 1 },
};

const HEADER = {
  emblem: { cx: refX(82), cy: refY(62), size: 33 },
  centerX: refX(399),
  lines: [
    { text: 'Government of Karnataka', size: 19.3, bold: true, y: refY(36.7) },
    { text: 'Department of School Education Pre University', size: 19.3, bold: true, y: refY(56.5) },
    { text: '(For Pre University College)', size: 18, bold: false, y: refY(100) },
  ],
  title: { text: 'TRANSFER CERTIFICATE', size: 23, knWidth: 86, gap: 4, centerX: refX(413), y: refY(79) },
  codeKnY: refY(120),
  codeY: refY(137),
  labelX: refX(41),
  codeDotsTo: refX(265),
  dateRight: refX(681.5),
  dateDotsWidth: 48,
};

/**
 * Table rows top to bottom; `h` is the row height in scan pixels.
 * Cell keys: `no`, label `lines` (string or { text, size, indent, marker }), and where the value goes:
 * `inline` (after the last label line), `below` (new line under the label), `side` (beside label lines),
 * `value` (whole value cell), or a special `kind`. `right` may be a stack of { h, cell } parts or null.
 */
const ROWS = [
  { h: 52, left: { no: '1.', lines: ['Name of the College', KN.collegeName] }, right: { kind: 'college' } },
  { h: 38, left: { no: '2.', lines: ['Admission No.', KN.admissionNo] }, right: { kind: 'dotted', field: 'admissionNo' } },
  { h: 39, left: { no: '3.', lines: ['Name of the Student in full', KN.studentName] }, right: { value: ['studentName'] } },
  {
    h: 28,
    left: { no: '4.', lines: [`Place of Birth  ${KN.placeOfBirth}`], inline: 'placeOfBirth' },
    right: { no: '6.', lines: [`District  ${KN.district}`], inline: 'district' },
  },
  {
    h: 26,
    left: { no: '5.', lines: [`Taluk  ${KN.taluk}`], inline: 'taluk' },
    right: { no: '7.', lines: [`State  ${KN.state}`], inline: 'state' },
  },
  {
    h: 26,
    left: { no: '8.', lines: [`Sex  ${KN.sex}`], inline: 'sex' },
    right: { no: '11.', lines: [`Religion  ${KN.religion}`], inline: 'religion' },
  },
  {
    h: 28.5,
    left: { no: '9.', lines: [`Nationality  ${KN.nationality}`], inline: 'nationality' },
    right: { no: '12.', lines: [`Sub Caste  ${KN.subCaste}`], inline: 'subCaste' },
  },
  { h: 27.5, left: { no: '10.', lines: [`Caste  ${KN.caste}`], inline: 'caste' }, right: {} },
  { h: 27, left: { no: '13.', lines: [`Name of the Father  ${KN.father}`] }, right: { value: ['fatherName'] } },
  { h: 28.5, left: { no: '14.', lines: [`Name of the Mother  ${KN.mother}`] }, right: { value: ['motherName'] } },
  {
    h: 39.5,
    left: {
      no: '15.',
      lines: [{ text: 'Whether the candidate belongs to Scheduled Caste/Scheduled Tribe', size: 'small' }, KN.scSt],
      below: 'scSt',
    },
    right: {
      no: '16.',
      lines: [{ text: 'Whether qualified for promotion to the next standard.', size: 'small' }, KN.promotion],
      below: 'qualifiedForPromotion',
    },
  },
  {
    h: 43,
    left: { no: '17.', lines: ['Date of Birth (In figures and words)', KN.dob] },
    right: { value: ['dobFigures', 'dobWords'] },
  },
  {
    h: 53.5,
    left: {
      no: '18.',
      lines: [
        { text: 'Standard in which the student was study at the time of leaving', size: 'small' },
        { text: 'the College (in words)', size: 'small' },
        KN.standard,
      ],
    },
    right: { kind: 'standard' },
  },
  {
    h: 144,
    left: {
      no: '19.',
      lines: [
        { text: 'Details of Subjects studied in I / II PUC', size: 'small' },
        KN.subjects,
        { text: `Part-I - ${KN.part1}`, size: 'small', indent: 8.5 },
        { text: 'Language Studied :', size: 'small', marker: '(a)', indent: 13 },
        { text: KN.languages, indent: 13 },
        { text: `Part-II - ${KN.part2}`, size: 'small', indent: 8.5 },
        { text: 'Opt. Subjects Studied :', size: 'small', marker: '(b)', indent: 13 },
        { text: KN.optional, indent: 13 },
      ],
      side: [
        { field: 'languages', lines: [3, 4] },
        { field: 'optionalSubjects', lines: [6, 7] },
      ],
    },
    right: [
      {
        h: 60.5,
        cell: {
          no: '25.',
          lines: [{ text: 'Date of Students last attendance at College', size: 'small' }, KN.lastAttendance, KN.dateColon],
          inline: 'lastAttendanceDate',
        },
      },
      {
        h: 83.5,
        cell: {
          no: '26.',
          lines: [
            { text: 'Date on which the application for the Transfer Certificate was received', size: 'tiny' },
            KN.application,
          ],
          below: 'applicationDate',
        },
      },
    ],
  },
  {
    h: 41.5,
    left: { no: '20.', lines: ['Medium of Instruction :', KN.medium], side: [{ field: 'medium', lines: [0, 1] }] },
    right: { no: '27.', lines: ['Date of issued Transfer Certificate', KN.issued], inline: 'issueDate' },
  },
  {
    h: 40.5,
    left: {
      no: '21.',
      lines: [{ text: 'Date of Admission or Promotion to that Class or Standard :', size: 'small' }, KN_UNCLEAR.admissionDate],
      below: 'admissionDate',
    },
    right: {
      no: '28.',
      lines: [{ text: 'Number of College days up to the date of leaving', size: 'small' }, KN_UNCLEAR.collegeDays],
      inline: 'collegeDays',
    },
  },
  {
    h: 42,
    left: { no: '22.', lines: ['Whether all Balance of fees paid or not', KN.feesPaid], below: 'feesPaid' },
    right: { no: '29.', lines: ['Total Number of days the student attended', KN.daysAttended], inline: 'daysAttended' },
  },
  {
    h: 53,
    left: {
      no: '23.',
      lines: [{ text: 'Fee concessions, if any (nature and period to be specified)', size: 'small' }, KN.concession, KN.specify],
      inline: 'feeConcession',
    },
    right: { no: '30.', lines: ['Character and Conduct', KN.conduct], inline: 'conduct' },
  },
  {
    h: 47,
    left: {
      no: '24.',
      lines: [{ text: 'Scholarship if any (nature and period to be specified)', size: 'small' }, KN.scholarship, KN.specify],
      inline: 'scholarship',
    },
    right: null,
  },
];

const OVERFLOW_MESSAGE =
  'Transfer Certificate content does not fit on one A3 page. Please shorten the longer entries.';

/* ------------------------------------------------------------------ */
/* Kannada text: shaped by the browser canvas, embedded as images      */
/* ------------------------------------------------------------------ */

const KN_CHAR = /[\u0C80-\u0CFF\u200C\u200D]/;
const KN_PX_PER_MM = 16;
let kannadaFontReady = null;

/** jsPDF cannot shape Kannada conjuncts, so Kannada runs are rendered with a bundled Noto Sans Kannada. */
function ensureKannadaFont() {
  if (!kannadaFontReady) {
    kannadaFontReady = (async () => {
      if (typeof document === 'undefined' || typeof FontFace === 'undefined') {
        throw new Error('Kannada text needs a browser to render.');
      }
      const faces = Object.entries(KN_FONT.files).map(
        ([weight, url]) => new FontFace(KN_FONT.family, `url(${url}) format('woff2')`, { weight })
      );
      await Promise.all(faces.map((f) => f.load()));
      faces.forEach((f) => document.fonts.add(f));
    })().catch((err) => {
      kannadaFontReady = null;
      throw new Error(`Kannada font could not be loaded (${err?.message || err}).`);
    });
  }
  return kannadaFontReady;
}

function createKannadaRenderer() {
  const canvas = document.createElement('canvas');
  const measureCtx = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const font = (sizePt, bold) =>
    `${bold ? 700 : 400} ${sizePt * PT * KN_PX_PER_MM}px "${KN_FONT.family}", "Times New Roman", serif`;

  return {
    width(text, sizePt, bold) {
      measureCtx.font = font(sizePt, bold);
      return measureCtx.measureText(text).width / KN_PX_PER_MM;
    },
    /** PNG of `text` with its baseline offset; cached so repeated labels embed once. */
    image(text, sizePt, bold) {
      const key = `${bold ? 'b' : 'n'}|${sizePt.toFixed(2)}|${text}`;
      if (cache.has(key)) return cache.get(key);
      measureCtx.font = font(sizePt, bold);
      const m = measureCtx.measureText(text);
      const em = sizePt * PT * KN_PX_PER_MM;
      const ascent = Math.ceil(Math.max(m.fontBoundingBoxAscent ?? 0, m.actualBoundingBoxAscent ?? 0, em)) + 2;
      const descent = Math.ceil(Math.max(m.fontBoundingBoxDescent ?? 0, m.actualBoundingBoxDescent ?? 0, em * 0.5)) + 2;
      const pad = Math.ceil(em * 0.15);
      const c = document.createElement('canvas');
      c.width = Math.ceil(m.width) + pad * 2;
      c.height = ascent + descent;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.font = font(sizePt, bold);
      ctx.fillStyle = '#000';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, pad, ascent);
      const img = {
        alias: `tc-kn-${cache.size}`,
        url: c.toDataURL('image/png'),
        width: c.width / KN_PX_PER_MM,
        height: c.height / KN_PX_PER_MM,
        ascent: ascent / KN_PX_PER_MM,
        pad: pad / KN_PX_PER_MM,
      };
      cache.set(key, img);
      return img;
    },
  };
}

/** Splits text into Kannada and Latin runs; a space stays with the run before it. */
function splitRuns(text) {
  const runs = [];
  for (const ch of Array.from(String(text ?? ''))) {
    const last = runs[runs.length - 1];
    const kn = ch === ' ' && last ? last.kn : KN_CHAR.test(ch);
    if (last && last.kn === kn) last.text += ch;
    else runs.push({ kn, text: ch });
  }
  return runs;
}

const hasKannada = (text) => KN_CHAR.test(String(text ?? ''));
const isKannadaLine = (text) => hasKannada(text) && !/[A-Za-z]/.test(text);

/* ------------------------------------------------------------------ */
/* Drawing helpers                                                     */
/* ------------------------------------------------------------------ */

function setLatin(doc, style) {
  doc.setFont('times', style.bold ? 'bold' : 'normal');
  doc.setFontSize(style.size);
}

/** Kannada vowel signs overhang their advance, so punctuation directly after Kannada needs a little room. */
const KN_TAIL_GAP = 0.3;
const runGap = (prev, run) => (prev?.kn && !run.kn && !/^\s/.test(run.text) ? KN_TAIL_GAP : 0);

function textWidth(ctx, text, style) {
  return splitRuns(text).reduce((sum, run, i, runs) => {
    const gap = runGap(runs[i - 1], run);
    if (run.kn) return sum + ctx.kn.width(run.text, style.size * TYPE.knScale, style.bold);
    setLatin(ctx.doc, style);
    return sum + gap + ctx.doc.getTextWidth(run.text);
  }, 0);
}

/** Mixed English/Kannada text on one baseline; returns the drawn width. */
function drawText(ctx, text, x, baseline, style) {
  let cx = x;
  let prev = null;
  for (const run of splitRuns(text)) {
    cx += runGap(prev, run);
    prev = run;
    if (run.kn) {
      const img = ctx.kn.image(run.text, style.size * TYPE.knScale, style.bold);
      ctx.doc.addImage(img.url, 'PNG', cx - img.pad, baseline - img.ascent, img.width, img.height, img.alias, 'FAST');
      cx += img.width - img.pad * 2;
    } else {
      setLatin(ctx.doc, style);
      ctx.doc.text(run.text, cx, baseline);
      cx += ctx.doc.getTextWidth(run.text);
    }
  }
  return cx - x;
}

function fitSize(ctx, text, maxWidth, size) {
  let s = size;
  while (s > TYPE.minLabel && textWidth(ctx, text, { size: s }) > maxWidth) s -= 0.25;
  return s;
}

/** Base letter with its vowel signs and virama-joined consonants. */
function splitClusters(word) {
  const out = [];
  for (const ch of Array.from(word)) {
    const prev = out[out.length - 1];
    if (prev && (/[\p{M}\u200C\u200D]/u.test(ch) || /[\u0CCD\u200D]$/.test(prev))) out[out.length - 1] = prev + ch;
    else out.push(ch);
  }
  return out;
}

/** Greedy word wrap; the first line may be narrower than the rest. */
function wrapText(ctx, text, firstWidth, restWidth, style) {
  const lines = [];
  let line = '';
  const limit = () => (lines.length ? restWidth : firstWidth);
  const fits = (s) => textWidth(ctx, s, style) <= limit();
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (fits(candidate)) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    if (fits(word)) {
      line = word;
      continue;
    }
    for (const piece of splitClusters(word)) {
      if (line && !fits(line + piece)) {
        lines.push(line);
        line = piece;
      } else {
        line += piece;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawDots(doc, x1, x2, y) {
  if (x2 - x1 < 2) return;
  doc.setLineWidth(0.35);
  doc.setLineCap('round');
  doc.setLineDashPattern([0, 1.05], 0);
  doc.line(x1, y, x2, y);
  doc.setLineDashPattern([], 0);
  doc.setLineCap('butt');
}

function strokeRect(doc, x, y, w, h, width = GRID_LINE) {
  doc.setLineWidth(width);
  doc.rect(x, y, w, h, 'S');
}

/* ------------------------------------------------------------------ */
/* Cell layout: a cell is a stack of lines, each holding drawn items   */
/* ------------------------------------------------------------------ */

const VALUE_STYLE = { size: TYPE.value, bold: true };

function linePitch(size, kn) {
  return kn ? size * TYPE.knScale * PT * TYPE.knPitch : size * PT * TYPE.enPitch;
}

function textLine(ctx, items, { size, kn = false }) {
  const end = items.reduce((m, it) => Math.max(m, it.x + (it.dots ?? textWidth(ctx, it.text, it.style))), 0);
  return { items, pitch: linePitch(size, kn), baseRatio: kn ? 0.64 : 0.76, end };
}

function valueLine(ctx, text, x, style) {
  return textLine(ctx, [{ x, text, style }], { size: style.size, kn: isKannadaLine(text) });
}

/** Largest value size (down to TYPE.minValue) giving the fewest wrapped lines. */
function fitValue(ctx, text, firstWidth, restWidth) {
  let best = null;
  for (let size = TYPE.value * ctx.scale; size >= TYPE.minValue * ctx.scale - 1e-6; size -= 0.5) {
    const style = { size, bold: true };
    const lines = wrapText(ctx, text, firstWidth, restWidth, style);
    if (!best || lines.length < best.lines.length) best = { style, lines };
    if (lines.length === 1) break;
  }
  return best;
}

function labelLines(ctx, cell, width) {
  return (cell.lines ?? []).map((spec, i) => {
    const s = typeof spec === 'string' ? { text: spec } : spec;
    const kn = isKannadaLine(s.text);
    const x = CELL.labelX + (s.indent ?? 0);
    const size = fitSize(ctx, s.text, width - CELL.padX - x, (TYPE[s.size] ?? TYPE.label) * ctx.scale);
    const items = [];
    if (i === 0 && cell.no) items.push({ x: CELL.numX, text: cell.no, style: { size: TYPE.label * ctx.scale } });
    if (s.marker) items.push({ x: CELL.labelX, text: s.marker, style: { size } });
    items.push({ x, text: s.text, style: { size } });
    return textLine(ctx, items, { size, kn });
  });
}

function addBelow(ctx, lines, text, width, x = CELL.labelX) {
  const w = width - CELL.padX - x;
  const { style, lines: pieces } = fitValue(ctx, text, w, w);
  pieces.forEach((piece) => lines.push(valueLine(ctx, piece, x, style)));
}

function addInline(ctx, lines, text, width) {
  const last = lines[lines.length - 1];
  const x = last ? last.end + CELL.valueGap : CELL.labelX;
  const avail = width - CELL.padX - x;
  const restWidth = width - CELL.padX - CELL.labelX;
  const minStyle = { size: TYPE.minValue * ctx.scale, bold: true };
  const firstWord = String(text).split(/\s+/)[0];
  if (!last || avail < CELL.minInlineWidth || textWidth(ctx, firstWord, minStyle) > avail) {
    addBelow(ctx, lines, text, width);
    return;
  }
  const { style, lines: [first, ...rest] } = fitValue(ctx, text, avail, restWidth);
  last.items.push({ x, text: first, style });
  last.end = x + textWidth(ctx, first, style);
  rest.forEach((piece) => lines.push(valueLine(ctx, piece, CELL.labelX, style)));
}

/**
 * Value at column x beside line `a` onward; extra lines continue next to (or are inserted before) the following lines.
 * @returns {{ inserted: number, next: number }} lines added before later indices, and the first line still free.
 */
function addSide(ctx, lines, text, width, a, x) {
  const avail = width - CELL.padX - x;
  if (avail < CELL.minInlineWidth) {
    addBelow(ctx, lines, text, width);
    return { inserted: 0, next: a };
  }
  const { style, lines: pieces } = fitValue(ctx, text, avail, avail);
  let at = a;
  let inserted = 0;
  for (const piece of pieces) {
    const host = lines[at];
    if (host && host.end + CELL.valueGap <= x) {
      host.items.push({ x, text: piece, style });
      host.end = x + textWidth(ctx, piece, style);
    } else {
      lines.splice(at, 0, valueLine(ctx, piece, x, style));
      inserted += 1;
    }
    at += 1;
  }
  return { inserted, next: at };
}

function collegeLines(ctx, data, width) {
  const lines = [];
  const labelStyle = { size: TYPE.label * ctx.scale };
  if (data.collegeName) addBelow(ctx, lines, data.collegeName, width);
  else lines.push({ items: [], pitch: linePitch(labelStyle.size), baseRatio: 0.76, end: 0 });
  const label = 'College Code : ';
  const vx = CELL.collegeCodeX + textWidth(ctx, label, labelStyle);
  const items = [{ x: CELL.collegeCodeX, text: label, style: labelStyle }];
  if (data.collegeCode) items.push({ x: vx, text: data.collegeCode, style: { ...VALUE_STYLE, size: TYPE.value * ctx.scale } });
  else items.push({ x: vx, dots: CELL.collegeCodeDotsTo - vx });
  lines.push(textLine(ctx, items, { size: labelStyle.size }));
  return lines;
}

function dottedLines(ctx, value, width) {
  const lines = [];
  if (value) addBelow(ctx, lines, value, width, CELL.dottedFrom);
  else {
    const item = { x: CELL.dottedFrom, dots: CELL.dottedTo - CELL.dottedFrom };
    lines.push(textLine(ctx, [item], { size: TYPE.label * ctx.scale }));
  }
  return lines;
}

/** "ಪ್ರಥಮ / ದ್ವಿತೀಯ ಪಿ.ಯು.ಸಿ." with the option that does not apply struck out, then the standard in words. */
function standardLines(ctx, data, width) {
  const style = { size: TYPE.standard * ctx.scale };
  const parts = [
    { text: KN.first, strike: data.standardYear === 'second' },
    { text: '  /  ' },
    { text: KN.second, strike: data.standardYear === 'first' },
    { text: ` ${KN.puc}` },
  ];
  let x = CELL.standardX;
  const items = parts.map((p) => {
    const item = { x, text: p.text, style, strike: p.strike };
    x += textWidth(ctx, p.text, style);
    return item;
  });
  const lines = [textLine(ctx, items, { size: style.size })];
  if (data.standardInWords) addBelow(ctx, lines, data.standardInWords, width, CELL.standardX);
  return lines;
}

function planCell(ctx, cell, width, data) {
  if (!cell) return null;
  let lines;
  if (cell.kind === 'college') lines = collegeLines(ctx, data, width);
  else if (cell.kind === 'dotted') lines = dottedLines(ctx, data[cell.field], width);
  else if (cell.kind === 'standard') lines = standardLines(ctx, data, width);
  else {
    lines = labelLines(ctx, cell, width);
    (cell.value ?? []).forEach((field) => data[field] && addBelow(ctx, lines, data[field], width));
    if (cell.inline && data[cell.inline]) addInline(ctx, lines, data[cell.inline], width);
    if (cell.below && data[cell.below]) addBelow(ctx, lines, data[cell.below], width);
    const side = cell.side ?? [];
    if (side.length) {
      const covered = side.flatMap((s) => lines.slice(s.lines[0], s.lines[1] + 1));
      const x = Math.max(...covered.map((l) => l.end)) + CELL.valueGap * 2;
      let shift = 0;
      let next = 0;
      [...side]
        .sort((p, q) => p.lines[0] - q.lines[0])
        .forEach((spec) => {
          if (!data[spec.field]) return;
          const placed = addSide(ctx, lines, data[spec.field], width, Math.max(spec.lines[0] + shift, next), x);
          shift += placed.inserted;
          next = placed.next;
        });
    }
  }
  const content = lines.reduce((sum, l) => sum + l.pitch, 0);
  return { lines, need: content + CELL.padY * 2, content };
}

/** Lines are centred vertically in the cell, matching the printed form. */
function drawCell(ctx, plan, x, y, h) {
  if (!plan) return;
  let top = y + (h - plan.content) / 2;
  for (const line of plan.lines) {
    const baseline = top + line.pitch * line.baseRatio;
    for (const item of line.items) {
      if (item.dots != null) {
        drawDots(ctx.doc, x + item.x, x + item.x + item.dots, baseline);
        continue;
      }
      const w = drawText(ctx, item.text, x + item.x, baseline, item.style);
      if (item.strike) {
        ctx.doc.setLineWidth(0.35);
        const sy = baseline - item.style.size * TYPE.knScale * PT * 0.32;
        ctx.doc.line(x + item.x - 0.5, sy, x + item.x + w + 0.5, sy);
      }
    }
    top += line.pitch;
  }
}

/* ------------------------------------------------------------------ */
/* Table geometry                                                      */
/* ------------------------------------------------------------------ */

/** Splits `total` over parts: at least their need, growth to the last part, shrinkage from slack. */
function distribute(parts, total) {
  const heights = parts.map((p) => Math.max(p.ref, p.need));
  const diff = total - heights.reduce((s, h) => s + h, 0);
  if (diff >= 0) {
    heights[heights.length - 1] += diff;
    return heights;
  }
  const slack = heights.map((h, i) => h - parts[i].need);
  const totalSlack = slack.reduce((s, v) => s + v, 0);
  return heights.map((h, i) => h + (diff * slack[i]) / (totalSlack || 1));
}

function layoutTable(ctx, data) {
  for (const scale of TYPE.fitScales) {
    const rows = layoutTableAt({ ...ctx, scale }, data);
    if (rows) return { rows, scale };
  }
  throw new Error(OVERFLOW_MESSAGE);
}

/** Row geometry at one font scale, or null when the rows cannot fit above the footer. */
function layoutTableAt(ctx, data) {
  const leftW = COLS.divider - COLS.left;
  const rightW = COLS.right - COLS.divider;
  const rows = ROWS.map((spec) => {
    const left = planCell(ctx, spec.left, leftW, data);
    const stack = Array.isArray(spec.right)
      ? spec.right.map((p) => ({ ref: p.h * SY, plan: planCell(ctx, p.cell, rightW, data) }))
      : null;
    const right = !stack && spec.right ? planCell(ctx, spec.right, rightW, data) : null;
    const rightNeed = stack ? stack.reduce((s, p) => s + p.plan.need, 0) : right?.need ?? 0;
    return { spec, left, right, stack, ref: spec.h * SY, need: Math.max(left.need, rightNeed) };
  });

  const available = FRAME.bottom - FOOTER.minHeight - TABLE_TOP;
  const heights = distribute(rows, Math.max(available, rows.reduce((s, r) => s + Math.max(r.ref, r.need), 0)));
  const total = heights.reduce((s, h) => s + h, 0);
  if (total > available + 0.01) {
    const shrunk = distribute(rows, available);
    if (shrunk.some((h, i) => h < rows[i].need - 0.01)) return null;
    heights.splice(0, heights.length, ...shrunk);
  }

  let y = TABLE_TOP;
  return rows.map((row, i) => {
    const out = { ...row, y, height: heights[i] };
    if (row.stack) {
      const parts = row.stack.map((p) => ({ ref: p.ref, need: p.plan.need }));
      out.stackHeights = distribute(parts, heights[i]);
    }
    y += heights[i];
    return out;
  });
}

function drawTable(ctx, rows) {
  const { doc } = ctx;
  const leftW = COLS.divider - COLS.left;
  const rightW = COLS.right - COLS.divider;
  doc.setDrawColor(0);
  for (const row of rows) {
    strokeRect(doc, COLS.left, row.y, leftW, row.height);
    drawCell(ctx, row.left, COLS.left, row.y, row.height);
    if (row.stack) {
      let sy = row.y;
      row.stack.forEach((part, i) => {
        const h = row.stackHeights[i];
        strokeRect(doc, COLS.divider, sy, rightW, h);
        drawCell(ctx, part.plan, COLS.divider, sy, h);
        sy += h;
      });
    } else if (row.spec.right) {
      strokeRect(doc, COLS.divider, row.y, rightW, row.height);
      drawCell(ctx, row.right, COLS.divider, row.y, row.height);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Header and footer                                                   */
/* ------------------------------------------------------------------ */

async function loadEmblem() {
  try {
    const res = await fetch(TC_EMBLEM_URL);
    const blob = res.ok ? await res.blob() : null;
    if (!blob || !/^image\/(png|jpe?g)$/.test(blob.type)) return null;
    return { url: await blobToDataUrl(blob), format: blob.type === 'image/png' ? 'PNG' : 'JPEG' };
  } catch {
    return null;
  }
}

function drawEmblem(doc, emblem) {
  const { cx, cy, size } = HEADER.emblem;
  if (emblem) {
    try {
      const props = doc.getImageProperties(emblem.url);
      const scale = Math.min(size / props.width, size / props.height);
      const w = props.width * scale;
      const h = props.height * scale;
      doc.addImage(emblem.url, emblem.format, cx - w / 2, cy - h / 2, w, h, undefined, 'FAST');
      return;
    } catch {
      /* fall through to the placeholder */
    }
  }
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.circle(cx, cy, size / 2, 'S');
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(['EMBLEM', 'placeholder'], cx, cy - 0.5, { align: 'center' });
  doc.setTextColor(0);
  doc.setDrawColor(0);
}

function drawHeader(ctx, data, emblem) {
  const { doc } = ctx;
  drawEmblem(doc, emblem);
  for (const line of HEADER.lines) {
    setLatin(doc, line);
    doc.text(line.text, HEADER.centerX, line.y, { align: 'center' });
  }

  const t = HEADER.title;
  const titleStyle = { size: t.size, bold: true };
  setLatin(doc, titleStyle);
  const enW = doc.getTextWidth(t.text);
  const knSize = (t.size * t.knWidth) / ctx.kn.width(KN.title, t.size, true);
  const knW = ctx.kn.width(KN.title, knSize, true);
  const startX = t.centerX - (enW + t.gap + knW) / 2;
  doc.text(t.text, startX, t.y);
  const img = ctx.kn.image(KN.title, knSize, true);
  doc.addImage(img.url, 'PNG', startX + enW + t.gap - img.pad, t.y - img.ascent, img.width, img.height, img.alias, 'FAST');

  const labelStyle = { size: TYPE.label };
  drawText(ctx, KN_UNCLEAR.collegeCode, HEADER.labelX, HEADER.codeKnY, labelStyle);
  const codeLabel = 'College Code : ';
  const codeX = HEADER.labelX + drawText(ctx, codeLabel, HEADER.labelX, HEADER.codeY, labelStyle);
  if (data.collegeCode) drawText(ctx, data.collegeCode, codeX, HEADER.codeY, VALUE_STYLE);
  else drawDots(doc, codeX, HEADER.codeDotsTo, HEADER.codeY);

  const dateLabel = 'Date : ';
  if (data.issueDate) {
    const vw = textWidth(ctx, data.issueDate, VALUE_STYLE);
    const lx = HEADER.dateRight - vw - textWidth(ctx, dateLabel, labelStyle);
    drawText(ctx, dateLabel, lx, HEADER.codeY, labelStyle);
    drawText(ctx, data.issueDate, HEADER.dateRight - vw, HEADER.codeY, VALUE_STYLE);
  } else {
    const dotsFrom = HEADER.dateRight - HEADER.dateDotsWidth;
    drawText(ctx, dateLabel, dotsFrom - textWidth(ctx, dateLabel, labelStyle), HEADER.codeY, labelStyle);
    drawDots(doc, dotsFrom, HEADER.dateRight, HEADER.codeY);
  }
}

function drawFooterField(ctx, label, value, baseline, dotsTo, maxX) {
  const x = FOOTER.labelX + drawText(ctx, label, FOOTER.labelX, baseline, { size: TYPE.label });
  if (!value) {
    drawDots(ctx.doc, x, dotsTo, baseline);
    return;
  }
  const avail = maxX - x;
  const style = { ...VALUE_STYLE };
  while (style.size > TYPE.minLabel && textWidth(ctx, value, style) > avail) style.size -= 0.25;
  let text = String(value);
  while (text.length > 1 && textWidth(ctx, text, style) > avail) text = `${text.slice(0, -2).trimEnd()}…`;
  drawText(ctx, text, x, baseline, style);
}

function drawFooter(ctx, data, tableBottom) {
  setLatin(ctx.doc, { size: TYPE.label });
  const maxX = FOOTER.signatureX - ctx.doc.getTextWidth(FOOTER.signature) / 2 - CELL.valueGap * 2;
  drawFooterField(ctx, `${KN.place} / Place : `, data.place, tableBottom + FOOTER.placeDy, FOOTER.placeDotsTo, maxX);
  drawFooterField(ctx, `${KN.date} / Date : `, data.issueDate, tableBottom + FOOTER.dateDy, FOOTER.dateDotsTo, maxX);
  setLatin(ctx.doc, { size: TYPE.label });
  ctx.doc.text(FOOTER.signature, FOOTER.signatureX, tableBottom + FOOTER.signatureDy, { align: 'center' });
}

function calibrateKannadaScale(kn) {
  const c = TYPE.knCalibration;
  const measured = kn.width(c.text, TYPE.label, false);
  if (measured > 0) TYPE.knScale = Math.min(c.max, Math.max(c.min, c.width / measured));
}

/**
 * Karnataka PU Transfer Certificate on one A3 portrait page.
 * `form` comes from the Transfer Certificate dialog; omit it for a blank form to fill by hand.
 * @returns {Promise<{ blob?: Blob, filename: string }>}
 */
export async function exportTransferCertificatePdf({ form = null, returnBlob = false } = {}) {
  const [, emblem] = await Promise.all([ensureKannadaFont(), loadEmblem()]);
  const data = buildTransferCertificateRecord(form);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a3', compress: true });
  const ctx = { doc, kn: createKannadaRenderer() };
  calibrateKannadaScale(ctx.kn);

  const { rows } = layoutTable(ctx, data);
  const last = rows[rows.length - 1];
  const tableBottom = last.y + last.height;

  doc.setTextColor(0);
  drawHeader(ctx, data, emblem);
  drawTable(ctx, rows);
  drawFooter(ctx, data, tableBottom);
  doc.setDrawColor(0);
  strokeRect(doc, FRAME.left, FRAME.top, FRAME.right - FRAME.left, FRAME.bottom - FRAME.top, FRAME.line);

  const filename = form
    ? `Transfer_Certificate_${sanitizeFilePart(blankStr(data.rollNumber) || 'NA')}_${sanitizeFilePart(
        blankStr(data.studentName) || 'Student'
      )}.pdf`
    : 'Transfer_Certificate_Blank.pdf';
  if (returnBlob) return { blob: doc.output('blob'), filename };
  doc.save(filename);
  return { filename };
}
