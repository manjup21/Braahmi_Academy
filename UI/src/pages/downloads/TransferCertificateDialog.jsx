import { useState } from 'react';

import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { FormSelect } from '../../components/common/FormSelect';
import { FormDatePicker } from '../../components/common/FormDatePicker';
import { Spinner } from '../../components/ui/spinner';
import { STUDENT_GENDER_OPTIONS } from '../../utils/studentDisplay';
import { certificateAc } from '../../utils/certificateFormAutofill';
import { blankStr as blank } from '../../utils/pdfHelpers';
import {
  TC_MEDIUM_OPTIONS,
  TC_STANDARD_OPTIONS,
  TC_YES_NO_OPTIONS,
  createEmptyTcForm,
  prefillTcFormFromStudent,
} from './transferCertificateData';

function Section({ title, children }) {
  return (
    <fieldset className="space-y-3 rounded-md border border-gray-200 p-3">
      <legend className="px-1 text-sm font-medium text-gray-900">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function TextField({ id, label, value, onChange, placeholder, className = '', autoComplete = 'off', inputMode }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TransferCertificateDialogInner({ student, className, manualMode, downloading, onDownload, onOpenChange }) {
  const [form, setForm] = useState(() =>
    manualMode || !student ? createEmptyTcForm() : prefillTcFormFromStudent(student, className)
  );
  const [error, setError] = useState('');
  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const text = (key, label, props = {}) => (
    <TextField id={`tc-${key}`} label={label} value={form[key]} onChange={(v) => update({ [key]: v })} {...props} />
  );
  const date = (key, label) => (
    <FormDatePicker id={`tc-${key}`} label={label} value={form[key]} onChange={(iso) => update({ [key]: iso })} />
  );
  const select = (key, label, options) => (
    <FormSelect
      id={`tc-${key}`}
      label={label}
      value={form[key]}
      onValueChange={(v) => update({ [key]: v })}
      placeholder="Not set"
      options={options}
    />
  );

  const handleDownload = () => {
    if (!blank(form.studentName)) {
      setError('Student name is required');
      return;
    }
    setError('');
    onDownload?.(form);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{manualMode ? 'Transfer Certificate — new data' : 'Transfer Certificate'}</DialogTitle>
        <DialogDescription>
          {manualMode
            ? 'Enter the certificate details, then download the A3 PDF. Nothing is saved.'
            : 'Details from the student record are filled in. Add the missing ones, then download the A3 PDF. Nothing here is saved to the student.'}{' '}
          Fields left empty print as blank space.
        </DialogDescription>
      </DialogHeader>

      <form autoComplete="on" onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Section title="Student (1–3, 8, 13, 14, 17)">
          {text('studentName', 'Name of the student in full *', { autoComplete: certificateAc('name') })}
          {text('admissionNo', 'Admission No.')}
          {select('gender', 'Sex', [{ value: '', label: 'Not set' }, ...STUDENT_GENDER_OPTIONS])}
          <FormDatePicker
            id="tc-dateOfBirth"
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(iso) => update({ dateOfBirth: iso })}
            name="bday"
            autoComplete={certificateAc('bday')}
            maxDate={new Date()}
          />
          {text('fatherName', 'Name of the father')}
          {text('motherName', 'Name of the mother')}
        </Section>

        <Section title="Birth place (4–7)">
          {text('placeOfBirth', 'Place of birth')}
          {text('taluk', 'Taluk')}
          {text('district', 'District')}
          {text('state', 'State')}
        </Section>

        <Section title="Nationality, religion and caste (9–12, 15)">
          {text('nationality', 'Nationality', { placeholder: 'e.g. Indian' })}
          {text('religion', 'Religion')}
          {text('caste', 'Caste')}
          {text('subCaste', 'Sub caste')}
          {select('scSt', 'Belongs to Scheduled Caste / Scheduled Tribe?', TC_YES_NO_OPTIONS)}
        </Section>

        <Section title="Course (16, 18–21)">
          {select('standardYear', 'Standard at the time of leaving', TC_STANDARD_OPTIONS)}
          {text('standardInWords', 'Standard in words', { placeholder: 'e.g. Second Year PUC (Science)' })}
          {text('languages', 'Part-I languages studied', { placeholder: 'e.g. Kannada, English' })}
          {text('optionalSubjects', 'Part-II optional subjects', { placeholder: 'e.g. Physics, Chemistry, Mathematics, Biology' })}
          {select('medium', 'Medium of instruction', TC_MEDIUM_OPTIONS)}
          {date('admissionDate', 'Date of admission / promotion to that class')}
          {select('qualifiedForPromotion', 'Qualified for promotion to the next standard?', TC_YES_NO_OPTIONS)}
        </Section>

        <Section title="Fees (22–24)">
          {select('feesPaid', 'All fee balances paid?', TC_YES_NO_OPTIONS)}
          {text('feeConcession', 'Fee concession (nature and period)')}
          {text('scholarship', 'Scholarship (nature and period)', { className: 'sm:col-span-2' })}
        </Section>

        <Section title="Attendance and issue (25–30)">
          {date('lastAttendanceDate', 'Last date of attendance')}
          {date('applicationDate', 'Date TC application received')}
          {date('issueDate', 'Date of issue')}
          {text('collegeDays', 'College working days up to leaving', { inputMode: 'numeric' })}
          {text('daysAttended', 'Days attended by the student', { inputMode: 'numeric' })}
          {text('conduct', 'Character and conduct', { placeholder: 'e.g. Good' })}
          {text('place', 'Place')}
        </Section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
          Cancel
        </Button>
        <Button type="button" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <>
              <Spinner className="h-4 w-4" /> Downloading…
            </>
          ) : (
            'Download TC (A3)'
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

/** DialogContent must be a direct child of Dialog (custom Dialog clones `open` onto it). */
export function TransferCertificateDialog({
  open,
  onOpenChange,
  student,
  className = '',
  loading = false,
  downloading = false,
  onDownload,
  manualMode = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {open && (manualMode || (student && !loading)) ? (
          <TransferCertificateDialogInner
            key={manualMode ? 'manual' : student.id}
            student={student}
            className={className}
            manualMode={manualMode}
            downloading={downloading}
            onDownload={onDownload}
            onOpenChange={onOpenChange}
          />
        ) : open ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-600">
            <Spinner className="h-4 w-4" /> Loading student…
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
