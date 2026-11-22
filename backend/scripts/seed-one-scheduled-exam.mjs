/**
 * Adds one scheduled PU exam for I PUC / A (Braahmi test data).
 * Usage: node scripts/seed-one-scheduled-exam.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const TEST_NAME = 'Braahmi PU — I PUC Preparatory (Scheduled)';

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      rows: [user],
    } = await client.query(`SELECT id FROM users ORDER BY created_at ASC NULLS LAST LIMIT 1`);
    const {
      rows: [cls],
    } = await client.query(`SELECT id, name FROM classes WHERE name = 'I PUC' LIMIT 1`);
    const {
      rows: [sec],
    } = await client.query(
      `SELECT id, section_code FROM sections WHERE class_id = $1::uuid AND section_code = 'A' LIMIT 1`,
      [cls.id]
    );
    const {
      rows: [examType],
    } = await client.query(`SELECT id FROM exam_types WHERE LOWER(name) = 'puc' LIMIT 1`);
    const { rows: subjects } = await client.query(
      `SELECT id, name FROM subjects
       WHERE is_deleted = FALSE
         AND name = ANY($1::text[])
       ORDER BY sort_order`,
      [['English', 'Kannada', 'Physics', 'Chemistry', 'Mathematics', 'Biology']]
    );

    if (!user || !cls || !sec || !examType || subjects.length < 6) {
      throw new Error('Missing class/section/subjects/users — run seed:braahmi-pu-test first.');
    }

    const perMax = subjects.map(() => 100);
    const perPass = subjects.map(() => 35);
    const totalMax = perMax.reduce((a, b) => a + b, 0);
    const totalPass = perPass.reduce((a, b) => a + b, 0);

    const d = new Date();
    d.setDate(d.getDate() + 14);
    const dateStr = d.toISOString().slice(0, 10);

    await client.query(`DELETE FROM examinations WHERE test_name = $1`, [TEST_NAME]);

    const {
      rows: [exam],
    } = await client.query(
      `INSERT INTO examinations (
        test_name, exam_type_id, exam_status, class_id, section_id,
        exam_date, start_time, end_time, max_marks, passing_marks,
        invigilator, instructions, created_by, updated_by
      ) VALUES (
        $1, $2::uuid, 'scheduled', $3::uuid, $4::uuid,
        $5::date, '10:00', '13:00', $6, $7,
        'Ganesh Patel', 'Braahmi PU preparatory exam — scheduled for testing.',
        $8::uuid, $8::uuid
      ) RETURNING id, test_name, exam_status, exam_date`,
      [TEST_NAME, examType.id, cls.id, sec.id, dateStr, totalMax, totalPass, user.id]
    );

    await client.query(
      `INSERT INTO examination_sections (examination_id, section_id)
       VALUES ($1::uuid, $2::uuid) ON CONFLICT DO NOTHING`,
      [exam.id, sec.id]
    );

    for (let i = 0; i < subjects.length; i++) {
      const subDate = new Date(d);
      subDate.setDate(subDate.getDate() + i);
      await client.query(
        `INSERT INTO examination_subjects (
           examination_id, subject_id, max_marks, passing_marks,
           exam_date, start_time, end_time, is_part_b
         ) VALUES (
           $1::uuid, $2::uuid, $3, $4,
           $5::date, '10:00', '13:00', FALSE
         )`,
        [exam.id, subjects[i].id, perMax[i], perPass[i], subDate.toISOString().slice(0, 10)]
      );
    }

    await client.query('COMMIT');
    console.log('Added scheduled exam:', exam);
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
