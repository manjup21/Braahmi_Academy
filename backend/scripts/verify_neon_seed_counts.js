import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSL === 'true'
      ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
      : false,
});

const client = await pool.connect();
try {
  const q = async (sql) => (await client.query(sql)).rows[0];
  const out = {
    classes: (await q(`select count(*)::int as n from classes where lower(name) in ('11th','12th')`)).n,
    sections: (
      await q(`select count(*)::int as n
        from sections s join classes c on c.id=s.class_id
        where lower(c.name) in ('11th','12th') and upper(s.section_code) in ('A','B')`)
    ).n,
    subjects: (
      await q(`select count(*)::int as n from subjects
        where is_deleted=false and lower(name) in ('maths','chemistry','physics','biology','computer science')`)
    ).n,
    examTypes: (await q(`select count(*)::int as n from exam_types where lower(name) in ('neet','jee','puc')`)).n,
    students: (await q(`select count(*)::int as n from students where is_deleted=false and roll_number ~ '^(11|12)[AB]-[0-9]{3}$'`)).n,
    globalPatterns: (await q(`select count(*)::int as n from attendance_patterns where scope='global' and is_active=true`)).n,
    absences: (await q(`select count(*)::int as n from student_absences`)).n,
    exams: (await q(`select count(*)::int as n from examinations`)).n,
    publishedResults: (await q(`select count(*)::int as n from examination_results where result_status='published'`)).n,
  };
  console.log(JSON.stringify(out, null, 2));
} finally {
  client.release();
  await pool.end();
}

