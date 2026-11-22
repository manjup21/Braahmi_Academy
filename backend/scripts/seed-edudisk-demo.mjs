/**
 * EduDisk Demo seed — wipe all data except users (+ lecturers linked to users),
 * then load school + college subjects, classes, sections, students, exam types/exams + marks.
 *
 * School: Class 10 only, section A, 30 students
 * College: Class 11, section A, 30 students
 *
 * Usage (from backend/): node scripts/seed-edudisk-demo.mjs
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function buildPoolConfig() {
  const url = (process.env.DATABASE_URL ?? '').trim();
  if (url) {
    return {
      connectionString: url,
      ssl:
        process.env.PGSSL === 'true'
          ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
          : false,
    };
  }
  return {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER ?? '',
    password: process.env.PGPASSWORD ?? '',
    database: process.env.PGDATABASE ?? '',
    ssl:
      process.env.PGSSL === 'true'
        ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
        : false,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Aadhya', 'Diya', 'Myra', 'Sara', 'Anvi', 'Pari', 'Navya', 'Kiara', 'Ira',
  'Rohan', 'Kabir', 'Dev', 'Yash', 'Om', 'Meera', 'Riya', 'Sneha', 'Pooja', 'Nisha',
];
const LAST_NAMES = [
  'Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Khan', 'Gupta', 'Singh', 'Joshi', 'Desai',
  'Rao', 'Mehta', 'Pillai', 'Shetty', 'Kulkarni', 'Verma', 'Das', 'Chopra', 'Bhat', 'Hegde',
];
const FATHER_FIRST = ['Ramesh', 'Suresh', 'Mahesh', 'Prakash', 'Anand', 'Vijay', 'Rajesh', 'Sunil', 'Ashok', 'Mohan'];
const MOTHER_FIRST = ['Lakshmi', 'Sunita', 'Geeta', 'Anita', 'Kavitha', 'Priya', 'Rekha', 'Shobha', 'Padma', 'Savitha'];

const SCHOOL_SUBJECTS = [
  { name: 'English', code: 'ENG', sort: 1 },
  { name: 'Kannada', code: 'KAN', sort: 2 },
  { name: 'Hindi', code: 'HIN', sort: 3 },
  { name: 'Mathematics', code: 'MAT', sort: 4 },
  { name: 'EVS', code: 'EVS', sort: 5 },
  { name: 'Science', code: 'SCI', sort: 6 },
  { name: 'Social Science', code: 'SST', sort: 7 },
  { name: 'Computer Science', code: 'CS', sort: 8 },
  { name: 'Physical Education', code: 'PE', sort: 9 },
  { name: 'Art & Craft', code: 'ART', sort: 10 },
];

const COLLEGE_SUBJECTS = [
  { name: 'English Core', code: 'ENGC', sort: 11 },
  { name: 'Physics', code: 'PHY', sort: 12 },
  { name: 'Chemistry', code: 'CHE', sort: 13 },
  { name: 'Biology', code: 'BIO', sort: 14 },
  { name: 'Accountancy', code: 'ACC', sort: 15 },
  { name: 'Business Studies', code: 'BST', sort: 16 },
  { name: 'Economics', code: 'ECO', sort: 17 },
  { name: 'Computer Applications', code: 'CAP', sort: 18 },
  { name: 'Kannada Elective', code: 'KANE', sort: 19 },
];

const SCHOOL_EXAM_TYPES = ['Unit Test', 'Formative Assessment', 'Mid-Term', 'Summative Assessment'];
const COLLEGE_EXAM_TYPES = ['Internal Assessment', 'College Mid-Term', 'Final Exam', 'Practical Exam'];

const SCHOOL_CLASSES = ['Class 10'];
const COLLEGE_CLASSES = ['Class 11'];

async function wipeExceptUsers(client) {
  console.log('Flushing non-user data (keeping users + lecturers)...');
  // Child → parent. examinations CASCADE many exam_* tables.
  await client.query('DELETE FROM notification_recipients');
  await client.query('DELETE FROM notification_logs');
  await client.query('DELETE FROM fee_payments');
  await client.query('DELETE FROM student_fee_items');
  await client.query('DELETE FROM student_fees');
  await client.query('DELETE FROM student_absences');
  await client.query('DELETE FROM cancelled_slots');
  await client.query('DELETE FROM examination_result_marks');
  await client.query('DELETE FROM examination_results');
  await client.query('DELETE FROM examination_subjects');
  await client.query('DELETE FROM examination_sections');
  await client.query('DELETE FROM examinations');
  await client.query('DELETE FROM exam_types WHERE is_system IS DISTINCT FROM TRUE');
  await client.query(`
    INSERT INTO exam_types (name, is_system)
    SELECT 'Others', TRUE
    WHERE NOT EXISTS (SELECT 1 FROM exam_types WHERE is_system = TRUE)
  `);
  await client.query('DELETE FROM students');
  await client.query('DELETE FROM attendance_patterns'); // cascades days/slots
  await client.query('DELETE FROM school_holidays');
  await client.query('DELETE FROM sections');
  await client.query('DELETE FROM classes');
  await client.query('DELETE FROM subjects'); // full replace
  console.log('Flush complete.');
}

async function insertSubject(client, { name, code, sort }, actorId) {
  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO subjects (name, code, sort_order, is_active, is_deleted, created_by, updated_by)
     VALUES ($1, $2, $3, TRUE, FALSE, $4::uuid, $4::uuid)
     RETURNING id, name, code`,
    [name, code, sort, actorId]
  );
  return row;
}

async function insertClass(client, name, actorId) {
  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO classes (name, is_active, created_by) VALUES ($1, TRUE, $2::uuid) RETURNING id, name`,
    [name, actorId]
  );
  return row;
}

async function insertSection(client, classId, code, actorId) {
  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO sections (class_id, section_code, is_active, created_by)
     VALUES ($1::uuid, $2, TRUE, $3::uuid)
     RETURNING id, class_id, section_code`,
    [classId, code, actorId]
  );
  return row;
}

async function insertStudent(client, { classId, sectionId, roll, first, last, gender, idx }, actorId) {
  const dobYear = 2015 - Math.floor(idx / 30); // rough age spread by class batch
  const dob = `${dobYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
  const phoneTail = String(9000000000 + idx).slice(-10);
  await client.query(
    `INSERT INTO students (
      gender, first_name, last_name, date_of_birth, roll_number,
      class_id, section_id,
      address_location, address_city, address_district, address_state, address_pin,
      father_name, mother_name, guardian_email, guardian_phone,
      blood_group, residence_type, is_active, is_deleted, created_by, updated_by
    ) VALUES (
      $1, $2, $3, $4::date, $5,
      $6::uuid, $7::uuid,
      'Demo Layout', 'Davanagere', 'Davanagere', 'Karnataka', '577001',
      $8, $9, $10, $11,
      $12, 'day_scholar', TRUE, FALSE, $13::uuid, $13::uuid
    )`,
    [
      gender,
      first,
      last,
      dob,
      roll,
      classId,
      sectionId,
      `${FATHER_FIRST[idx % FATHER_FIRST.length]} ${last}`,
      `${MOTHER_FIRST[idx % MOTHER_FIRST.length]} ${last}`,
      `parent${idx}@edudisk.demo`,
      `+91${phoneTail}`,
      ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-'][idx % 6],
      actorId,
    ]
  );
}

async function ensureExamType(client, name) {
  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO exam_types (name, is_system)
     SELECT $1::varchar, FALSE
     WHERE NOT EXISTS (SELECT 1 FROM exam_types WHERE LOWER(name) = LOWER($1::varchar))
     RETURNING id, name`,
    [name]
  );
  if (row) return row;
  const {
    rows: [existing],
  } = await client.query(`SELECT id, name FROM exam_types WHERE LOWER(name) = LOWER($1) LIMIT 1`, [name]);
  return existing;
}

async function seedExamsForSection(client, { classRow, section, subjects, examTypeNames, examTypeMap, actorId, label }) {
  const { rows: students } = await client.query(
    `SELECT id FROM students
     WHERE is_deleted = FALSE AND class_id = $1::uuid AND section_id = $2::uuid
     ORDER BY roll_number`,
    [classRow.id, section.id]
  );

  let examCount = 0;
  let resultRows = 0;

  // 3 completed exams suitable for progress / report cards
  for (let i = 0; i < 3; i++) {
    const typeName = examTypeNames[i % examTypeNames.length];
    const typeId = examTypeMap.get(typeName);
    const picked = shuffle(subjects).slice(0, Math.min(5, subjects.length));
    const perMax = picked.map(() => 100);
    const perPass = picked.map(() => 35);
    const totalMax = perMax.reduce((a, b) => a + b, 0);
    const totalPass = perPass.reduce((a, b) => a + b, 0);

    const examDate = new Date();
    examDate.setDate(examDate.getDate() - (3 - i) * 25 - randInt(0, 3));
    const dateStr = examDate.toISOString().slice(0, 10);
    const testName = `${typeName} — ${classRow.name} ${section.section_code} (${label})`;

    const {
      rows: [exam],
    } = await client.query(
      `INSERT INTO examinations (
        test_name, exam_type_id, exam_status, class_id, section_id,
        exam_date, start_time, end_time, max_marks, passing_marks,
        invigilator, instructions, created_by, updated_by
      ) VALUES (
        $1, $2::uuid, 'completed', $3::uuid, $4::uuid,
        $5::date, '09:00', '12:00', $6, $7,
        'Demo Invigilator', 'EduDisk demo examination.', $8::uuid, $8::uuid
      ) RETURNING id`,
      [testName, typeId, classRow.id, section.id, dateStr, totalMax, totalPass, actorId]
    );

    await client.query(
      `INSERT INTO examination_sections (examination_id, section_id) VALUES ($1::uuid, $2::uuid)
       ON CONFLICT DO NOTHING`,
      [exam.id, section.id]
    );

    for (let j = 0; j < picked.length; j++) {
      await client.query(
        `INSERT INTO examination_subjects (
           id, examination_id, subject_id, max_marks, passing_marks,
           exam_date, start_time, end_time
         ) VALUES (
           uuid_generate_v4(), $1::uuid, $2::uuid, $3, $4,
           $5::date, '09:00', '12:00'
         )`,
        [exam.id, picked[j].id, perMax[j], perPass[j], dateStr]
      );
    }

    const subjRows = await client.query(
      `SELECT subject_id, max_marks, passing_marks FROM examination_subjects WHERE examination_id = $1::uuid`,
      [exam.id]
    );

    for (const st of students) {
      const {
        rows: [resRow],
      } = await client.query(
        `INSERT INTO examination_results (
          examination_id, student_id, total_marks, result_status, created_by, updated_by
        ) VALUES ($1::uuid, $2::uuid, NULL, 'published', $3::uuid, $3::uuid)
        RETURNING id`,
        [exam.id, st.id, actorId]
      );
      resultRows++;
      let total = 0;
      for (const es of subjRows.rows) {
        const absent = Math.random() < 0.05;
        let mark = null;
        if (!absent) {
          mark = randInt(Math.max(20, es.passing_marks - 5), es.max_marks);
          total += mark;
        }
        await client.query(
          `INSERT INTO examination_result_marks (id, result_id, subject_id, mark, is_absent)
           VALUES (uuid_generate_v4(), $1::uuid, $2::uuid, $3, $4)`,
          [resRow.id, es.subject_id, mark, absent]
        );
      }
      await client.query(`UPDATE examination_results SET total_marks = $2 WHERE id = $1::uuid`, [resRow.id, total]);
    }
    examCount++;
  }

  return { examCount, resultRows };
}

async function main() {
  const pool = new pg.Pool({ ...buildPoolConfig(), max: 5 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      rows: [userRow],
    } = await client.query(`SELECT id, email FROM users ORDER BY created_at ASC NULLS LAST LIMIT 1`);
    if (!userRow?.id) throw new Error('No users found — keep at least one admin user.');
    const actorId = userRow.id;
    console.log(`Actor user: ${userRow.email ?? userRow.id}`);

    await wipeExceptUsers(client);

    console.log('Inserting school + college subjects...');
    const schoolSubjects = [];
    for (const s of SCHOOL_SUBJECTS) schoolSubjects.push(await insertSubject(client, s, actorId));
    const collegeSubjects = [];
    for (const s of COLLEGE_SUBJECTS) collegeSubjects.push(await insertSubject(client, s, actorId));
    // Math shared for college exams too
    const math = schoolSubjects.find((s) => s.name === 'Mathematics');
    if (math) collegeSubjects.unshift(math);

    console.log('Inserting exam types...');
    const examTypeMap = new Map();
    for (const name of [...SCHOOL_EXAM_TYPES, ...COLLEGE_EXAM_TYPES]) {
      const row = await ensureExamType(client, name);
      examTypeMap.set(row.name, row.id);
      // normalize key by intended name
      examTypeMap.set(name, row.id);
    }

    console.log('Creating Class 10 (school) + Class 11 (college)...');
    const schoolClassRows = [];
    for (const name of SCHOOL_CLASSES) schoolClassRows.push(await insertClass(client, name, actorId));
    const collegeClassRows = [];
    for (const name of COLLEGE_CLASSES) collegeClassRows.push(await insertClass(client, name, actorId));

    let studentIdx = 0;
    let totalStudents = 0;
    let totalExams = 0;
    let totalResults = 0;

    const createClassBundle = async (classRow, subjects, examTypes, label, classNumPad) => {
      const section = await insertSection(client, classRow.id, 'A', actorId);
      console.log(`  ${classRow.name} / ${section.section_code}: 30 students...`);
      for (let n = 1; n <= 30; n++) {
        studentIdx++;
        const first = FIRST_NAMES[(studentIdx + n) % FIRST_NAMES.length];
        const last = LAST_NAMES[(studentIdx * 3 + n) % LAST_NAMES.length];
        const gender = studentIdx % 2 === 0 ? 'female' : 'male';
        const roll = `${classNumPad}A${String(n).padStart(2, '0')}`;
        await insertStudent(
          client,
          {
            classId: classRow.id,
            sectionId: section.id,
            roll,
            first,
            last,
            gender,
            idx: studentIdx,
          },
          actorId
        );
        totalStudents++;
      }
      const { examCount, resultRows } = await seedExamsForSection(client, {
        classRow,
        section,
        subjects,
        examTypeNames: examTypes,
        examTypeMap,
        actorId,
        label,
      });
      totalExams += examCount;
      totalResults += resultRows;
    };

    const schoolSubjectsForExam = schoolSubjects.filter((s) =>
      ['English', 'Kannada', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer Science'].includes(s.name)
    );
    for (const classRow of schoolClassRows) {
      await createClassBundle(classRow, schoolSubjectsForExam, SCHOOL_EXAM_TYPES, 'School', 'C10');
    }

    for (const classRow of collegeClassRows) {
      await createClassBundle(classRow, collegeSubjects, COLLEGE_EXAM_TYPES, 'College', 'C11');
    }

    console.log('Inserting global attendance pattern...');
    const {
      rows: [pat],
    } = await client.query(
      `INSERT INTO attendance_patterns (
        name, scope, class_id, section_id, start_date, end_date, is_active, created_by, updated_by
      ) VALUES (
        'Demo — Global 2 slots',
        'global',
        NULL, NULL,
        DATE '2026-01-01', DATE '2028-12-31',
        TRUE, $1::uuid, $1::uuid
      ) RETURNING id`,
      [actorId]
    );
    for (let dow = 0; dow <= 6; dow++) {
      await client.query(
        `INSERT INTO attendance_pattern_days (id, pattern_id, day_of_week)
         VALUES (uuid_generate_v4(), $1::uuid, $2)`,
        [pat.id, dow]
      );
    }
    await client.query(
      `INSERT INTO attendance_pattern_slots (id, pattern_id, slot_index, slot_time) VALUES
       (uuid_generate_v4(), $1::uuid, 1, TIME '09:00'),
       (uuid_generate_v4(), $1::uuid, 2, TIME '14:00')`,
      [pat.id]
    );

    await client.query('COMMIT');

    const counts = await client.query(`
      SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM lecturers) AS lecturers,
        (SELECT count(*)::int FROM subjects WHERE is_deleted = FALSE) AS subjects,
        (SELECT count(*)::int FROM classes) AS classes,
        (SELECT count(*)::int FROM sections) AS sections,
        (SELECT count(*)::int FROM students WHERE is_deleted = FALSE) AS students,
        (SELECT count(*)::int FROM exam_types) AS exam_types,
        (SELECT count(*)::int FROM examinations) AS examinations,
        (SELECT count(*)::int FROM examination_results) AS results
    `);
    console.log('\nSeed complete.');
    console.log(counts.rows[0]);
    console.log(`Inserted this run: students=${totalStudents}, exams=${totalExams}, result rows=${totalResults}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
