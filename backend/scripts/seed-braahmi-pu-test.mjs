/**
 * Braahmi Academy — light PU test seed for PDF / exam flows.
 *
 * Creates (idempotent-ish: clears only Braahmi PU test roll numbers / exams first):
 * - Class: I PUC (PCMB)
 * - Section: A
 * - Subjects: English, Kannada, Physics, Chemistry, Mathematics, Biology
 * - Exam type: PUC
 * - 5 students
 * - 1 completed exam (published marks for all 5)
 * - 1 scheduled exam (subjects only, no results)
 *
 * Usage (from backend/):
 *   node scripts/seed-braahmi-pu-test.mjs
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

const SUBJECTS = [
  { name: 'English', code: 'ENG', sort: 1 },
  { name: 'Kannada', code: 'KAN', sort: 2 },
  { name: 'Physics', code: 'PHY', sort: 3 },
  { name: 'Chemistry', code: 'CHE', sort: 4 },
  { name: 'Mathematics', code: 'MAT', sort: 5 },
  { name: 'Biology', code: 'BIO', sort: 6 },
];

const STUDENTS = [
  {
    roll: 'BA-IPUC-A01',
    first: 'Aditi',
    last: 'Shetty',
    gender: 'female',
    father: 'Ramesh Shetty',
    mother: 'Lakshmi Shetty',
    dob: '2008-04-12',
    phone: '9901000001',
    marks: [78, 72, 81, 76, 85, 79],
  },
  {
    roll: 'BA-IPUC-A02',
    first: 'Karthik',
    last: 'Gowda',
    gender: 'male',
    father: 'Suresh Gowda',
    mother: 'Sunita Gowda',
    dob: '2008-07-03',
    phone: '9901000002',
    marks: [65, 68, 70, 62, 74, 71],
  },
  {
    roll: 'BA-IPUC-A03',
    first: 'Nidhi',
    last: 'Patil',
    gender: 'female',
    father: 'Mahesh Patil',
    mother: 'Anita Patil',
    dob: '2008-01-22',
    phone: '9901000003',
    marks: [88, 84, 90, 86, 92, 89],
  },
  {
    roll: 'BA-IPUC-A04',
    first: 'Rahul',
    last: 'Naik',
    gender: 'male',
    father: 'Prakash Naik',
    mother: 'Geeta Naik',
    dob: '2008-11-15',
    phone: '9901000004',
    marks: [55, 58, 61, 52, 64, 59],
  },
  {
    roll: 'BA-IPUC-A05',
    first: 'Sneha',
    last: 'Hegde',
    gender: 'female',
    father: 'Anand Hegde',
    mother: 'Kavitha Hegde',
    dob: '2008-09-08',
    phone: '9901000005',
    marks: [72, 75, 69, 73, 80, 77],
  },
];

async function ensureSubject(client, { name, code, sort }, actorId) {
  const {
    rows: [existing],
  } = await client.query(
    `SELECT id, name, code FROM subjects
     WHERE is_deleted = FALSE AND LOWER(name) = LOWER($1)
     LIMIT 1`,
    [name]
  );
  if (existing) return existing;

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

async function ensureExamType(client, name) {
  const {
    rows: [existing],
  } = await client.query(`SELECT id, name FROM exam_types WHERE LOWER(name) = LOWER($1) LIMIT 1`, [name]);
  if (existing) return existing;

  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO exam_types (name, is_system) VALUES ($1, FALSE) RETURNING id, name`,
    [name]
  );
  return row;
}

async function ensureClass(client, name, actorId) {
  const {
    rows: [existing],
  } = await client.query(`SELECT id, name FROM classes WHERE LOWER(name) = LOWER($1) LIMIT 1`, [name]);
  if (existing) return existing;

  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO classes (name, is_active, created_by, updated_by)
     VALUES ($1, TRUE, $2::uuid, $2::uuid)
     RETURNING id, name`,
    [name, actorId]
  );
  return row;
}

async function ensureSection(client, classId, sectionCode, actorId) {
  const {
    rows: [existing],
  } = await client.query(
    `SELECT id, class_id, section_code FROM sections
     WHERE class_id = $1::uuid AND LOWER(section_code) = LOWER($2)
     LIMIT 1`,
    [classId, sectionCode]
  );
  if (existing) return existing;

  const {
    rows: [row],
  } = await client.query(
    `INSERT INTO sections (class_id, section_code, is_active, created_by, updated_by)
     VALUES ($1::uuid, $2, TRUE, $3::uuid, $3::uuid)
     RETURNING id, class_id, section_code`,
    [classId, sectionCode, actorId]
  );
  return row;
}

async function main() {
  const pool = new pg.Pool({ ...buildPoolConfig(), max: 5 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      rows: [userRow],
    } = await client.query(
      `SELECT id, email FROM users ORDER BY created_at ASC NULLS LAST LIMIT 1`
    );
    if (!userRow?.id) throw new Error('No users found — create a login user first.');
    const actorId = userRow.id;
    console.log(`Using actor: ${userRow.email ?? actorId}`);

    // Promote first user for admin screens if needed
    await client.query(
      `UPDATE users
       SET is_admin = TRUE, is_super_admin = TRUE, role = 'lecturer'
       WHERE id = $1::uuid`,
      [actorId]
    );

    const classRow = await ensureClass(client, 'I PUC', actorId);
    const section = await ensureSection(client, classRow.id, 'A', actorId);
    console.log(`Class/section: ${classRow.name} / ${section.section_code}`);

    const subjectRows = [];
    for (const s of SUBJECTS) {
      subjectRows.push(await ensureSubject(client, s, actorId));
    }
    const examType = await ensureExamType(client, 'PUC');

    // Remove previous Braahmi PU test students + their exam links (by roll prefix)
    const rolls = STUDENTS.map((s) => s.roll);
    await client.query(
      `DELETE FROM examination_results
       WHERE student_id IN (
         SELECT id FROM students WHERE roll_number = ANY($1::varchar[])
       )`,
      [rolls]
    );
    await client.query(
      `DELETE FROM students WHERE roll_number = ANY($1::varchar[])`,
      [rolls]
    );

    // Remove previous Braahmi seed exams by name prefix
    await client.query(
      `DELETE FROM examinations
       WHERE test_name LIKE 'Braahmi PU — %'`
    );

    const studentIds = [];
    for (const st of STUDENTS) {
      const {
        rows: [row],
      } = await client.query(
        `INSERT INTO students (
          gender, first_name, last_name, roll_number, class_id, section_id,
          father_name, mother_name, guardian_phone, residence_type, date_of_birth,
          address_city, address_state, address_pin, specialisation, student_type, medium,
          is_active, is_deleted, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5::uuid, $6::uuid,
          $7, $8, $9, 'day_scholar', $10::date,
          'Davangere', 'Karnataka', '577004', 'PCMB', 'fresher', 'english',
          TRUE, FALSE, $11::uuid, $11::uuid
        ) RETURNING id, roll_number, first_name, last_name`,
        [
          st.gender,
          st.first,
          st.last,
          st.roll,
          classRow.id,
          section.id,
          st.father,
          st.mother,
          st.phone,
          st.dob,
          actorId,
        ]
      );
      studentIds.push({ ...row, marks: st.marks });
      console.log(`  Student ${row.roll_number}: ${row.first_name} ${row.last_name}`);
    }

    const perMax = subjectRows.map(() => 100);
    const perPass = subjectRows.map(() => 35);
    const totalMax = perMax.reduce((a, b) => a + b, 0);
    const totalPass = perPass.reduce((a, b) => a + b, 0);

    // Completed exam (last week)
    const completedDate = new Date();
    completedDate.setDate(completedDate.getDate() - 7);
    const completedDateStr = completedDate.toISOString().slice(0, 10);

    const {
      rows: [completedExam],
    } = await client.query(
      `INSERT INTO examinations (
        test_name, exam_type_id, exam_status, class_id, section_id,
        exam_date, start_time, end_time, max_marks, passing_marks,
        invigilator, instructions, created_by, updated_by
      ) VALUES (
        $1, $2::uuid, 'completed', $3::uuid, $4::uuid,
        $5::date, '09:00', '12:00', $6, $7,
        'Sreenivasa Goud', 'Braahmi PU mid-term — use for marks card / PDF testing.',
        $8::uuid, $8::uuid
      ) RETURNING id, test_name, exam_status`,
      [
        'Braahmi PU — I PUC Mid-Term (Completed)',
        examType.id,
        classRow.id,
        section.id,
        completedDateStr,
        totalMax,
        totalPass,
        actorId,
      ]
    );

    await client.query(
      `INSERT INTO examination_sections (examination_id, section_id)
       VALUES ($1::uuid, $2::uuid) ON CONFLICT DO NOTHING`,
      [completedExam.id, section.id]
    );

    for (let i = 0; i < subjectRows.length; i++) {
      const subDate = new Date(completedDate);
      subDate.setDate(subDate.getDate() + i);
      await client.query(
        `INSERT INTO examination_subjects (
           examination_id, subject_id, max_marks, passing_marks,
           exam_date, start_time, end_time, is_part_b
         ) VALUES (
           $1::uuid, $2::uuid, $3, $4,
           $5::date, '09:00', '12:00', FALSE
         )`,
        [completedExam.id, subjectRows[i].id, perMax[i], perPass[i], subDate.toISOString().slice(0, 10)]
      );
    }

    for (const st of studentIds) {
      const {
        rows: [res],
      } = await client.query(
        `INSERT INTO examination_results (
          examination_id, student_id, total_marks, result_status, created_by, updated_by
        ) VALUES ($1::uuid, $2::uuid, NULL, 'published', $3::uuid, $3::uuid)
        RETURNING id`,
        [completedExam.id, st.id, actorId]
      );

      let total = 0;
      for (let i = 0; i < subjectRows.length; i++) {
        const mark = st.marks[i];
        total += mark;
        await client.query(
          `INSERT INTO examination_result_marks (result_id, subject_id, mark, is_absent)
           VALUES ($1::uuid, $2::uuid, $3, FALSE)`,
          [res.id, subjectRows[i].id, mark]
        );
      }
      await client.query(`UPDATE examination_results SET total_marks = $2 WHERE id = $1::uuid`, [
        res.id,
        total,
      ]);
    }

    // Scheduled exam (next week)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7);
    const scheduledDateStr = scheduledDate.toISOString().slice(0, 10);

    const {
      rows: [scheduledExam],
    } = await client.query(
      `INSERT INTO examinations (
        test_name, exam_type_id, exam_status, class_id, section_id,
        exam_date, start_time, end_time, max_marks, passing_marks,
        invigilator, instructions, created_by, updated_by
      ) VALUES (
        $1, $2::uuid, 'scheduled', $3::uuid, $4::uuid,
        $5::date, '09:30', '12:30', $6, $7,
        'K Vinay Kumar', 'Braahmi PU unit test — scheduled for hall ticket / PDF testing.',
        $8::uuid, $8::uuid
      ) RETURNING id, test_name, exam_status`,
      [
        'Braahmi PU — I PUC Unit Test (Scheduled)',
        examType.id,
        classRow.id,
        section.id,
        scheduledDateStr,
        totalMax,
        totalPass,
        actorId,
      ]
    );

    await client.query(
      `INSERT INTO examination_sections (examination_id, section_id)
       VALUES ($1::uuid, $2::uuid) ON CONFLICT DO NOTHING`,
      [scheduledExam.id, section.id]
    );

    for (let i = 0; i < subjectRows.length; i++) {
      const subDate = new Date(scheduledDate);
      subDate.setDate(subDate.getDate() + i);
      await client.query(
        `INSERT INTO examination_subjects (
           examination_id, subject_id, max_marks, passing_marks,
           exam_date, start_time, end_time, is_part_b
         ) VALUES (
           $1::uuid, $2::uuid, $3, $4,
           $5::date, '09:30', '12:30', FALSE
         )`,
        [scheduledExam.id, subjectRows[i].id, perMax[i], perPass[i], subDate.toISOString().slice(0, 10)]
      );
    }

    await client.query('COMMIT');
    console.log('Done.');
    console.log({
      class: classRow.name,
      section: section.section_code,
      students: studentIds.length,
      subjects: subjectRows.map((s) => s.name),
      completedExam: completedExam.test_name,
      scheduledExam: scheduledExam.test_name,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
