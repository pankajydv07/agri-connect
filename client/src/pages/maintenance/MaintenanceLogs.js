import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SpinnerBlock } from '../../components/ui/Spinner';
import EmptyState, { ErrorState } from '../../components/ui/EmptyState';
import FormField, { FormErrorSummary, SubmitButton } from '../../components/ui/FormField';
import api from '../../utils/api';

// ─── constants ────────────────────────────────────────────────────────────────

const statusOptions = ['Scheduled', 'In Progress', 'Completed', 'Delayed', 'On Hold'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const initialFormState = {
  machine: '',
  location: '',
  task: '',
  technician: '',
  scheduledDate: '',
  nextServiceDate: '',
  status: 'Scheduled',
  priority: 'Medium',
  downtimeHours: '',
  notes: ''
};

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert an ISO date string or anything the server returns into a YYYY-MM-DD
 * string suitable for a date input, or '' if empty/invalid.
 */
const toInputDate = (value) => {
  if (!value) return '';
  // If it looks like YYYY-MM-DD already, keep it
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateDisplay = (value) => {
  const input = toInputDate(value);
  if (!input) return '—';
  const [yyyy, mm, dd] = input.split('-');
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-700 border border-green-200';
    case 'In Progress': return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'Delayed': return 'bg-red-100 text-red-600 border border-red-200';
    case 'On Hold': return 'bg-slate-100 text-slate-600 border border-slate-200';
    default: return 'bg-blue-100 text-blue-600 border border-blue-200';
  }
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case 'Critical': return 'bg-red-100 text-red-600 border border-red-200';
    case 'High': return 'bg-orange-100 text-orange-600 border border-orange-200';
    case 'Low': return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
    default: return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  }
};

/** Extract per-field errors from a 400 response */
const parseFieldErrors = (responseData) => {
  const fieldErrors = {};
  if (Array.isArray(responseData?.details)) {
    for (const { field, message } of responseData.details) {
      if (field) fieldErrors[field] = message;
    }
  }
  return fieldErrors;
};

// ─── component ────────────────────────────────────────────────────────────────

const MaintenanceLogs = () => {
  // ── list state ──
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── filter/sort state ──
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // ── form state ──
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formSummaryError, setFormSummaryError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── flash messages ──
  const [success, setSuccess] = useState('');
  const [flashError, setFlashError] = useState('');

  // ── per-row in-flight status update ──
  const [updatingStatus, setUpdatingStatus] = useState({}); // id → true
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  // ── debounce ref for search ──
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ─────────────────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const params = { sort: sortDirection };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const { data } = await api.get('/api/maintenance-logs', { params });
      setLogs(data.data || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || {});
    } catch (err) {
      setFetchError(err?.response?.data?.message || 'Could not load maintenance logs.');
    } finally {
      setIsFetching(false);
    }
  }, [statusFilter, debouncedSearch, sortDirection]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchTerm]);

  // Auto-dismiss flash messages
  useEffect(() => {
    if (!success) return undefined;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (!flashError) return undefined;
    const t = setTimeout(() => setFlashError(''), 4500);
    return () => clearTimeout(t);
  }, [flashError]);

  // ── form ──────────────────────────────────────────────────────────────────

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the field-level error as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setFormSummaryError('');

    const trimmedMachine = formData.machine.trim();
    const trimmedTask = formData.task.trim();

    // Client-side guard
    if (!trimmedMachine || !trimmedTask || !formData.scheduledDate) {
      setFormSummaryError('Please provide at least the equipment name, task, and scheduled date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        machine: trimmedMachine,
        location: formData.location.trim(),
        task: trimmedTask,
        technician: formData.technician.trim(),
        scheduledDate: formData.scheduledDate,
        status: formData.status,
        priority: formData.priority
      };
      if (formData.nextServiceDate) body.nextServiceDate = formData.nextServiceDate;
      if (formData.downtimeHours !== '') body.downtimeHours = Number(formData.downtimeHours);
      if (formData.notes.trim()) body.notes = formData.notes.trim();

      await api.post('/api/maintenance-logs', body);
      setFormData(initialFormState);
      setSuccess('Maintenance task logged successfully.');
      fetchLogs();
    } catch (err) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      if (status === 400) {
        const fe = parseFieldErrors(responseData);
        setFieldErrors(fe);
        setFormSummaryError(responseData?.message || 'Please fix the errors below and try again.');
      } else {
        setFormSummaryError(responseData?.message || 'Could not save the task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── status update ──────────────────────────────────────────────────────────

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [id]: true }));
    try {
      const { data } = await api.patch(`/api/maintenance-logs/${id}`, { status: newStatus });
      setLogs((prev) => prev.map((log) => (log.id === id ? data.data : log)));
    } catch (err) {
      setFlashError(err?.response?.data?.message || 'Could not update status. Please try again.');
    } finally {
      setUpdatingStatus((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  // ── delete one ────────────────────────────────────────────────────────────

  const handleDelete = async (id, machineName) => {
    if (!window.confirm(`Remove the maintenance record for "${machineName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/maintenance-logs/${id}`);
      setLogs((prev) => prev.filter((log) => log.id !== id));
      setSuccess('Record removed.');
      // Refresh to get accurate summary counts
      fetchLogs();
    } catch (err) {
      setFlashError(err?.response?.data?.message || 'Could not remove the record. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── clear all ─────────────────────────────────────────────────────────────

  const handleClearLogs = async () => {
    const count = pagination?.total ?? logs.length;
    const confirmed = window.confirm(
      `This will permanently delete all ${count} maintenance record${count !== 1 ? 's' : ''} for your account. This cannot be undone. Continue?`
    );
    if (!confirmed) return;
    setClearingAll(true);
    try {
      await api.delete('/api/maintenance-logs');
      setLogs([]);
      setSummary({});
      setPagination(null);
      setSuccess('All maintenance records cleared.');
    } catch (err) {
      setFlashError(err?.response?.data?.message || 'Could not clear records. Please try again.');
    } finally {
      setClearingAll(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  // Derive stats from server summary + logs for the tile section
  const openTasks = (summary['Scheduled'] || 0) + (summary['In Progress'] || 0) + (summary['Delayed'] || 0) + (summary['On Hold'] || 0);
  const completed = summary['Completed'] || 0;
  const total = pagination?.total ?? logs.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const overdue = logs.filter((log) => log.isOverdue).length;
  const criticalAlerts = logs.filter((log) => log.priority === 'Critical' && log.status !== 'Completed').length;

  // Upcoming: non-completed with future scheduledDate, sorted, capped at 5
  const upcomingTasks = logs
    .filter((log) => log.status !== 'Completed' && !log.isOverdue)
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
    .slice(0, 5);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Maintenance Logbook</h1>
            <p className="mt-2 text-gray-600 max-w-3xl">
              Track preventive and breakdown maintenance activities across your plant. Keep technicians aligned, monitor upcoming
              work orders, and maintain a dependable audit trail.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleClearLogs}
              disabled={clearingAll || logs.length === 0}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clearingAll ? 'Clearing…' : 'Clear Logbook'}
            </button>
            <button
              type="button"
              onClick={() => { setFormData(initialFormState); setFieldErrors({}); setFormSummaryError(''); }}
              className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Reset Form
            </button>
          </div>
        </div>

        {/* Stats tiles — counts from server summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Open Tasks</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{openTasks}</div>
            <p className="mt-1 text-xs text-gray-500">{criticalAlerts} critical alert(s)</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Overdue</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{overdue}</div>
            <p className="mt-1 text-xs text-gray-500">Escalate overdue jobs promptly</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{completed}</div>
            <p className="mt-1 text-xs text-gray-500">Total closed jobs</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{completionRate}%</div>
            <p className="mt-1 text-xs text-gray-500">{total} total log(s)</p>
          </div>
        </div>
      </div>

      {/* Flash messages */}
      {(success || flashError) && (
        <div
          role="alert"
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            flashError
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-emerald-200 bg-emerald-50 text-emerald-600'
          }`}
        >
          {flashError || success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Log a task form ── */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Log a Maintenance Task</h2>
            <p className="mt-1 text-sm text-gray-600">Capture the essentials for scheduling, traceability, and compliance.</p>

            <FormErrorSummary message={formSummaryError} className="mt-4" />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  id="log-machine"
                  name="machine"
                  label="Equipment / Asset"
                  required
                  value={formData.machine}
                  onChange={handleInputChange}
                  error={fieldErrors.machine}
                  placeholder="e.g. Boiler #1"
                  disabled={isSubmitting}
                  className="mb-0"
                />
                <FormField
                  id="log-location"
                  name="location"
                  label="Location / Line"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={fieldErrors.location}
                  placeholder="e.g. Utilities Block"
                  disabled={isSubmitting}
                  className="mb-0"
                />
              </div>
              <FormField
                id="log-task"
                name="task"
                label="Task Description"
                required
                value={formData.task}
                onChange={handleInputChange}
                error={fieldErrors.task}
                placeholder="e.g. Inspect bearings and lubricate"
                disabled={isSubmitting}
                className="mb-0"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  id="log-technician"
                  name="technician"
                  label="Technician / Team"
                  value={formData.technician}
                  onChange={handleInputChange}
                  error={fieldErrors.technician}
                  placeholder="e.g. Mechanical Crew"
                  disabled={isSubmitting}
                  className="mb-0"
                />
                <FormField
                  id="log-scheduledDate"
                  name="scheduledDate"
                  label="Scheduled Date"
                  required
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  error={fieldErrors.scheduledDate}
                  disabled={isSubmitting}
                  className="mb-0"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  id="log-status"
                  name="status"
                  label="Status"
                  as="select"
                  value={formData.status}
                  onChange={handleInputChange}
                  error={fieldErrors.status}
                  disabled={isSubmitting}
                  className="mb-0"
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </FormField>
                <FormField
                  id="log-priority"
                  name="priority"
                  label="Priority"
                  as="select"
                  value={formData.priority}
                  onChange={handleInputChange}
                  error={fieldErrors.priority}
                  disabled={isSubmitting}
                  className="mb-0"
                >
                  {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </FormField>
                <FormField
                  id="log-downtimeHours"
                  name="downtimeHours"
                  label="Expected Downtime (hrs)"
                  type="number"
                  value={formData.downtimeHours}
                  onChange={handleInputChange}
                  error={fieldErrors.downtimeHours}
                  placeholder="e.g. 1.5"
                  disabled={isSubmitting}
                  className="mb-0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  id="log-nextServiceDate"
                  name="nextServiceDate"
                  label="Next Service Due"
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={handleInputChange}
                  error={fieldErrors.nextServiceDate}
                  disabled={isSubmitting}
                  className="mb-0"
                />
                <FormField
                  id="log-notes"
                  name="notes"
                  label="Notes / Spare Parts"
                  value={formData.notes}
                  onChange={handleInputChange}
                  error={fieldErrors.notes}
                  placeholder="e.g. Order gasket kit in advance"
                  disabled={isSubmitting}
                  className="mb-0"
                />
              </div>
              <div className="flex justify-end pt-2">
                <SubmitButton loading={isSubmitting} loadingLabel="Saving…">
                  Save Task
                </SubmitButton>
              </div>
            </form>
          </div>

          {/* ── Maintenance board ── */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Maintenance Board</h2>
                <p className="mt-1 text-sm text-gray-600">Filter by status or search across assets, technicians, and locations.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="board-status-filter">Filter by status</label>
                <select
                  id="board-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  {['All', ...statusOptions].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="board-search">Search maintenance records</label>
                <input
                  id="board-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Search equipment, task, or technician"
                />
                <button
                  type="button"
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  aria-label={`Sort by date ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sort {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {isFetching ? (
                <SpinnerBlock label="Loading maintenance records…" size="lg" tone="green" />
              ) : fetchError ? (
                <ErrorState
                  title="Could not load maintenance records"
                  description={fetchError}
                  onRetry={fetchLogs}
                  retryLabel="Retry"
                />
              ) : logs.length === 0 ? (
                <EmptyState
                  title="No maintenance records found"
                  description={
                    statusFilter !== 'All' || debouncedSearch
                      ? 'Try adjusting your filters or search term.'
                      : 'Log your first maintenance task using the form above.'
                  }
                />
              ) : (
                logs.map((log) => (
                  <article key={log.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{log.machine}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(log.status)}`}>
                            {log.status}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(log.priority)}`}>
                            {log.priority} priority
                          </span>
                          {log.isOverdue && (
                            <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{log.task}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                          {log.location && (
                            <div>
                              <span className="font-medium text-gray-700">Location:</span> {log.location}
                            </div>
                          )}
                          {log.technician && (
                            <div>
                              <span className="font-medium text-gray-700">Technician:</span> {log.technician}
                            </div>
                          )}
                          {log.downtimeHours != null && log.downtimeHours !== '' && (
                            <div>
                              <span className="font-medium text-gray-700">Downtime:</span> {log.downtimeHours} hrs
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium text-gray-700">Scheduled:</span> {formatDateDisplay(log.scheduledDate)}
                          </div>
                          {log.nextServiceDate && (
                            <div>
                              <span className="font-medium text-gray-700">Next Due:</span> {formatDateDisplay(log.nextServiceDate)}
                            </div>
                          )}
                        </div>
                        {log.notes && <p className="mt-3 text-sm text-gray-600">Notes: {log.notes}</p>}
                      </div>

                      {/* Per-row actions */}
                      <div className="flex flex-col gap-2">
                        <label className="sr-only" htmlFor={`status-${log.id}`}>Update status for {log.machine}</label>
                        <select
                          id={`status-${log.id}`}
                          value={log.status}
                          disabled={!!updatingStatus[log.id] || deletingId === log.id}
                          onChange={(e) => handleStatusChange(log.id, e.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {updatingStatus[log.id] && (
                          <p className="text-xs text-gray-500 text-center">Saving…</p>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id, log.machine)}
                          disabled={deletingId === log.id || !!updatingStatus[log.id]}
                          aria-label={`Remove maintenance record for ${log.machine}`}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === log.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination info */}
            {pagination && pagination.totalPages > 1 && (
              <p className="mt-4 text-xs text-gray-500 text-center">
                Showing {logs.length} of {pagination.total} records (page {pagination.page} of {pagination.totalPages})
              </p>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>
            <p className="mt-1 text-sm text-gray-600">Keep an eye on the next critical jobs to minimise downtime.</p>
            <ul className="mt-4 space-y-4">
              {upcomingTasks.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  No open tasks on the calendar. Great job!
                </li>
              ) : (
                upcomingTasks.map((task) => (
                  <li key={task.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{task.machine}</p>
                        <p className="text-xs text-gray-500">{task.task}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(task.priority)}`}>
                        {formatDateDisplay(task.scheduledDate)}
                      </span>
                    </div>
                    {task.technician && (
                      <p className="mt-2 text-xs text-gray-500">Assigned to: {task.technician}</p>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Best Practices</h2>
            <ul className="mt-3 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                Record every job immediately after completion to maintain a trustworthy history.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                Attach OEM manuals and safety checklists to each asset for quick reference.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                Review overdue and critical items during shift handovers for immediate action.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                Schedule follow-up audits after major repairs to verify long-term reliability.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLogs;
