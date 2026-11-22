/**
 * Clears examination + attendance seed tables and refills:
 * - Deletes all examinations (CASCADE: examination_subjects, examination_results, examination_result_marks)
 * - Resets exam_types to system "Others" plus JEE, NEET, PUC (removes all other catalog rows)
 * - Deletes student_absences and attendance_patterns (CASCADE: pattern days + slots)
 * - One active global attendance pattern with 2 slots/day, all days of week
 * - 5 examinations per class section using random subsets of existing subjects
 * - Published results for every exam (marks + optional absent subject), for dashboard / reports
 * - Random absences: 1–3 students per section per calendar day (last 30 days) per slot
 *
 * Usage (from backend/): node scripts/seed-exams-attendance.mjs
 * Requires DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE and at least one user row.
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

function dateRangeDays(endDate, numDays) {
  const out = [];
  const d = new Date(endDate);
  for (let i = 0; i < numDays; i++) {
    const x = new Date(d);
    x.setDate(x.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

/** Labels used when creating seeded examinations (rotated per exam). */
const EXAM_TYPES = ['JEE', 'NEET', 'PUC'];
const INVIGILATORS = ['Dr. Rao', 'Prof. Mehta', 'Ms. Iyer', 'Mr. Khan', 'Dr. Patel'];

async function main() {
  const pool = new pg.Pool({ ...buildPoolConfig(), max: 5 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Deleting examinations (cascade results + subjects)...');
    await client.query('DELETE FROM examinations');

    console.log('Resetting exam_types: keep system "Others", remove other types…');
    await client.query(`DELETE FROM exam_types WHERE is_system IS DISTINCT FROM TRUE`);
    await client.query(`
      INSERT INTO exam_types (name, is_system)
      SELECT 'Others', TRUE
      WHERE NOT EXISTS (SELECT 1 FROM exam_types WHERE is_system = TRUE)
    `);

    console.log('Adding catalog exam types: JEE, NEET, PUC…');
    for (const label of EXAM_TYPES) {
      await client.query(
        `INSERT INTO exam_types (name, is_system)
         SELECT $1::varchar, FALSE
         WHERE NOT EXISTS (SELECT 1 FROM exam_types WHERE LOWER(name) = LOWER($1::varchar))`,
        [label]
      );
    }

    console.log('Deleting student absences...');
    await client.query('DELETE FROM student_absences');

    console.log('Deleting attendance patterns (cascade days + slots)...');
    await client.query('DELETE FROM attendance_patterns');

    const {
      rows: [userRow],
    } = await client.query(`SELECT id FROM users ORDER BY created_at ASC NULLS LAST LIMIT 1`);
    if (!userRow?.id) {
      throw new Error('No users found — create a user before running this seed.');
    }
    const actorId = userRow.id;

    const { rows: subjects } = await client.query(
      `SELECT id, name FROM subjects WHERE is_deleted = FALSE AND is_active = TRUE ORDER BY name`
    );
    if (subjects.length < 2) {
      throw new Error('Need at least 2 active subjects in the database for seeded exams.');
    }

    const { rows: sections } = await client.query(`
      SELECT s.id AS section_id, s.class_id, c.name AS class_name, s.section_code
      FROM sections s
      JOIN classes c ON c.id = s.class_id
      WHERE COALESCE(s.is_active, TRUE) = TRUE AND COALESCE(c.is_active, TRUE) = TRUE
      ORDER BY c.name, s.section_code
    `);

    if (!sections.length) {
      throw new Error('No sections found — add classes and sections before seeding.');
    }

    const { rows: examTypeRows } = await client.query(`SELECT id, name FROM exam_types ORDER BY is_system DESC, name`);
    const examTypeIdForLabel = (label) => {
      const hit = examTypeRows.find((r) => String(r.name).toLowerCase() === String(label).toLowerCase());
      if (!hit) throw new Error(`Missing exam_types row for label: ${label}`);
      return hit.id;
    };

    console.log('Inserting global attendance pattern (2 slots, all weekdays + weekend)...');
    const {
      rows: [pat],
    } = await client.query(
      `INSERT INTO attendance_patterns (
        name, scope, class_id, section_id, start_date, end_date, is_active, created_by, updated_by
      ) VALUES (
        'Seed — Global 2 slots',
        'global',
        NULL,
        NULL,
        DATE '2026-01-01',
        DATE '2028-12-31',
        TRUE,
        $1::uuid,
        $1::uuid
      ) RETURNING id`,
      [actorId]
    );
    const patternId = pat.id;

    for (let dow = 0; dow <= 6; dow++) {
      await client.query(
        `INSERT INTO attendance_pattern_days (id, pattern_id, day_of_week)
         VALUES (uuid_generate_v4(), $1::uuid, $2)`,
        [patternId, dow]
      );
    }
    await client.query(
      `INSERT INTO attendance_pattern_slots (id, pattern_id, slot_index, slot_time) VALUES
       (uuid_generate_v4(), $1::uuid, 1, TIME '09:00'),
       (uuid_generate_v4(), $1::uuid, 2, TIME '14:00')`,
      [patternId]
    );

    const days = dateRangeDays(new Date(), 30);
    let examCount = 0;
    let absenceCount = 0;
    let resultRows = 0;
    let markRows = 0;

    for (const sec of sections) {
      const { rows: students } = await client.query(
        `SELECT id FROM students
         WHERE is_deleted = FALSE AND class_id = $1::uuid AND section_id = $2::uuid
         ORDER BY roll_number`,
        [sec.class_id, sec.section_id]
      );

      for (let i = 0; i < 5; i++) {
        const nSubjects = randInt(2, Math.min(5, subjects.length));
        const picked = shuffle(subjects).slice(0, nSubjects);
        const perMax = picked.map(() => randInt(40, 100));
        const perPass = picked.map((_, idx) => randInt(12, Math.floor(perMax[idx] * 0.45)));
        const totalMax = perMax.reduce((a, b) => a + b, 0);
        const totalPass = perPass.reduce((a, b) => a + b, 0);

        const examDate = new Date();
        examDate.setDate(examDate.getDate() - (4 - i) * 21 - randInt(0, 5));
        const dateStr = examDate.toISOString().slice(0, 10);

        const startH = 8 + (i % 3);
        const startTime = `${String(startH).padStart(2, '0')}:30:00`;
        const endTime = `${String(startH + 3).padStart(2, '0')}:00:00`;

        const statusPool = ['completed', 'completed', 'completed', 'scheduled', 'scheduled'];
        const examStatus = statusPool[i] ?? 'scheduled';

        const typeLabel = EXAM_TYPES[i % EXAM_TYPES.length];
        const testName = `${typeLabel} — ${sec.class_name} ${sec.section_code} #${i + 1}`;

        const {
          rows: [exam],
        } = await client.query(
          `INSERT INTO examinations (
            test_name, exam_type_id, exam_status, class_id, section_id,
            exam_date, start_time, end_time, max_marks, passing_marks,
            invigilator, instructions, created_by, updated_by
          ) VALUES ($1,$2::uuid,$3,$4::uuid,$5::uuid,$6::date,$7::time,$8::time,$9,$10,$11,$12,$13::uuid,$13::uuid)
          RETURNING id`,
          [
            testName,
            examTypeIdForLabel(typeLabel),
            examStatus,
            sec.class_id,
            sec.section_id,
            dateStr,
            startTime,
            endTime,
            totalMax,
            totalPass,
            INVIGILATORS[i % INVIGILATORS.length],
            'Seeded examination for development and demos.',
            actorId,
          ]
        );
        const examId = exam.id;
        examCount++;

        for (let j = 0; j < picked.length; j++) {
          await client.query(
            `INSERT INTO examination_subjects (id, examination_id, subject_id, max_marks, passing_marks)
             VALUES (uuid_generate_v4(), $1::uuid, $2::uuid, $3, $4)`,
            [examId, picked[j].id, perMax[j], perPass[j]]
          );
        }

        if (students.length) {
          const subjRows = await client.query(
            `SELECT subject_id, max_marks, passing_marks FROM examination_subjects WHERE examination_id = $1::uuid`,
            [examId]
          );

          for (const st of students) {
            const {
              rows: [resRow],
            } = await client.query(
              `INSERT INTO examination_results (
                examination_id, student_id, total_marks, result_status, created_by, updated_by
              ) VALUES ($1::uuid, $2::uuid, NULL, 'published', $3::uuid, $3::uuid)
              RETURNING id`,
              [examId, st.id, actorId]
            );
            resultRows++;

            let total = 0;
            for (const es of subjRows.rows) {
              const absent = Math.random() < 0.08;
              let mark = null;
              if (!absent) {
                mark = randInt(es.passing_marks, es.max_marks);
                total += mark;
              }
              await client.query(
                `INSERT INTO examination_result_marks (result_id, subject_id, mark, is_absent, remarks)
                 VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
                [resRow.id, es.subject_id, mark, absent, absent ? 'Absent (seed)' : null]
              );
              markRows++;
            }

            await client.query(
              `UPDATE examination_results SET total_marks = $1, updated_at = NOW() WHERE id = $2::uuid`,
              [total, resRow.id]
            );
          }
        }
      }

      for (const day of days) {
        for (const slotIndex of [1, 2]) {
          if (!students.length) continue;
          const k = Math.min(students.length, randInt(1, 3));
          for (const st of shuffle(students).slice(0, k)) {
            const ins = await client.query(
              `INSERT INTO student_absences (student_id, absent_date, slot_index, reason, created_by)
               VALUES ($1::uuid, $2::date, $3, $4, $5::uuid)
               ON CONFLICT (student_id, absent_date, slot_index) DO NOTHING`,
              [st.id, day, slotIndex, 'Seed absence', actorId]
            );
            absenceCount += ins.rowCount ?? 0;
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Done.');
    console.log({
      sections: sections.length,
      examinationsInserted: examCount,
      attendancePatternId: patternId,
      examinationResults: resultRows,
      examinationResultMarks: markRows,
      absenceRowsInserted: absenceCount,
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
