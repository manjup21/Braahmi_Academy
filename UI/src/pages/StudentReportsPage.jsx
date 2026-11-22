import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Spinner } from '../components/ui/spinner';
import { SearchInput } from '../components/common/SearchInput';
import { FormSelect } from '../components/common/FormSelect';
import { FormDatePicker } from '../components/common/FormDatePicker';
import { PageHeader } from '../components/common/PageHeader';
import { TablePagination } from '../components/common/TablePagination';
import { TableEmptyRow } from '../components/common/TableEmptyRow';
import { TableSkeletonRows } from '../components/common/TableSkeletonRows';
import { usePagedRows } from '../hooks/usePagedRows';
import { useClasses } from '../features/classes/useClasses';
import { fetchExamTypesThunk } from '../features/examTypes/examTypesSlice';
import { fetchExaminationsThunk } from '../features/examinations/examinationsSlice';
import { fetchExamResultsFullThunk } from '../features/examResults/examResultsSlice';
import { classNameById, sectionLabelForExam } from './examinationManagement/examinationHelpers';
import { BULK_MARKS_CARD_MAX, downloadBulkMarksCardZip } from '../utils/bulkMarksCardZip';
import { todayDateOnly } from '../utils/dateOnly';

export function StudentReportsPage() {
  const dispatch = useDispatch();
  const { classes } = useClasses();
  const examTypes = useSelector((s) => s.examTypes.items);
  const examTypesStatus = useSelector((s) => s.examTypes.status);
  const examinations = useSelector((s) => s.examinations.items);
  const examinationsStatus = useSelector((s) => s.examinations.status);
  const examinationsError = useSelector((s) => s.examinations.error);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterExamTypeId, setFilterExamTypeId] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pendingExam, setPendingExam] = useState(null);
  const [resultDate, setResultDate] = useState(todayDateOnly());

  useEffect(() => {
    if (examTypesStatus === 'idle') dispatch(fetchExamTypesThunk({ search: '' }));
  }, [examTypesStatus, dispatch]);

  useEffect(() => {
    dispatch(fetchExaminationsThunk({ status: 'completed' }));
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize, filterExamTypeId]);

  const filtered = useMemo(() => {
    const completed = (examinations ?? []).filter((e) => e.exam_status === 'completed');
    const byType =
      filterExamTypeId !== 'all'
        ? completed.filter((e) => String(e.exam_type_id) === String(filterExamTypeId))
        : completed;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((e) =>
      [
        e.test_name,
        e.exam_type_name,
        classNameById(classes, e.class_id),
        sectionLabelForExam(e, classes),
        Array.isArray(e.subjects) ? e.subjects.map((s) => s.name).join(' ') : '',
        e.exam_date,
      ].some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [examinations, filterExamTypeId, searchQuery, classes]);

  const { totalCount, totalPages, currentPage, pageRows } = usePagedRows(filtered, page, pageSize);

  const openDownload = (exam) => {
    if (!exam?.id || downloadingId) return;
    if (exam.has_results === false) {
      toast.error('No results entered for this exam yet');
      return;
    }
    setResultDate(todayDateOnly());
    setPendingExam(exam);
  };

  const handleDownload = async () => {
    const exam = pendingExam;
    if (!exam) return;
    if (!resultDate) {
      toast.error('Select the date of result');
      return;
    }
    setPendingExam(null);
    setDownloadingId(exam.id);
    const progressToast = toast.loading('Preparing Marks Cards…');
    try {
      const data = await dispatch(fetchExamResultsFullThunk({ examId: exam.id })).unwrap();
      const results = Array.isArray(data?.results) ? data.results : [];
      if (!results.length) {
        toast.error('No student results found for this exam', { id: progressToast });
        return;
      }
      if (results.length > BULK_MARKS_CARD_MAX) {
        toast.error(`At most ${BULK_MARKS_CARD_MAX} students can be downloaded at once`, { id: progressToast });
        return;
      }

      const className = classNameById(classes, exam.class_id);
      const { downloaded, skippedFailed } = await downloadBulkMarksCardZip({
        exam: { ...exam, ...(data?.exam ?? {}) },
        subjects: Array.isArray(data?.subjects) ? data.subjects : exam.subjects ?? [],
        results,
        className,
        resultDate,
        zipLabel: `MarksCards_${exam.test_name || 'exam'}_${className}`,
        onProgress: (done, total) => {
          toast.loading(`Generating Marks Cards… ${done}/${total}`, { id: progressToast });
        },
      });

      if (downloaded === 0) {
        toast.error('Could not generate any Marks Cards', { id: progressToast });
        return;
      }
      const skipNote = skippedFailed ? ` (${skippedFailed} skipped)` : '';
      toast.success(`Downloaded ${downloaded} Marks Card${downloaded === 1 ? '' : 's'}${skipNote}`, {
        id: progressToast,
      });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to download Marks Cards', {
        id: progressToast,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Report" description="Download Marks Cards for completed examinations" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Completed Examinations</CardTitle>
            <div className="text-sm text-gray-600">
              Total: <span className="font-medium text-gray-900">{totalCount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SearchInput
                id="student-reports-search"
                name="student-reports-search"
                placeholder="Search examinations…"
                value={searchQuery}
                onValueChange={setSearchQuery}
                autoComplete="off"
              />
            </div>
            <div className="w-full shrink-0 sm:w-56">
              <FormSelect
                id="student-reports-exam-type"
                value={filterExamTypeId}
                onValueChange={setFilterExamTypeId}
                placeholder="All types"
                options={[
                  { value: 'all', label: 'All types' },
                  ...examTypes.map((t) => ({ value: t.id, label: t.name })),
                ]}
              />
            </div>
          </div>

          {examinationsError ? <p className="text-sm text-red-600">{String(examinationsError)}</p> : null}

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Test</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Class / Section</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-right">Marks Cards</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examinationsStatus === 'loading' ? (
                    <TableSkeletonRows columns={7} rows={5} />
                  ) : pageRows.length === 0 ? (
                    <TableEmptyRow colSpan={7}>No completed examinations found</TableEmptyRow>
                  ) : (
                    pageRows.map((e) => {
                      const busy = downloadingId === e.id;
                      const canDownload = e.has_results !== false;
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.test_name}</TableCell>
                          <TableCell className="text-gray-600">{e.exam_type_name ?? '—'}</TableCell>
                          <TableCell>
                            <span className="text-gray-900">{classNameById(classes, e.class_id)}</span>
                            <span className="text-gray-600"> - {sectionLabelForExam(e, classes)}</span>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {Array.isArray(e.subjects) && e.subjects.length
                              ? e.subjects.map((s) => s.name).join(', ')
                              : '—'}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            <span className="inline-flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {e.exam_date ? String(e.exam_date).slice(0, 10) : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-700">{e.max_marks ?? '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={Boolean(downloadingId) || !canDownload}
                              onClick={() => openDownload(e)}
                              title={canDownload ? 'Download Marks Cards (ZIP)' : 'No results for this exam'}
                              aria-label={`Download marks cards for ${e.test_name ?? 'exam'}`}
                            >
                              {busy ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4 text-blue-600" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <TablePagination
            selectId="student-reports-page-size"
            page={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeSelectContentClassName="w-full min-w-[4.5rem]"
          />
        </CardContent>
      </Card>

      <Dialog open={Boolean(pendingExam)} onOpenChange={(open) => !open && setPendingExam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Marks Cards</DialogTitle>
            <DialogDescription>
              {pendingExam
                ? `${pendingExam.test_name ?? 'Exam'} · ${classNameById(classes, pendingExam.class_id)}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FormDatePicker
              id="marks-card-result-date"
              label="Date of result"
              required
              value={resultDate}
              onChange={(iso) => setResultDate(iso)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingExam(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download ZIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
