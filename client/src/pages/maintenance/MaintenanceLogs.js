import React, { useMemo, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const createSampleLogs = () => {
  const getDateString = (offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: uuidv4(),
      machine: 'Hydraulic Press #2',
      location: 'Fabrication Bay',
      task: 'Replace hydraulic oil and inspect seals',
      technician: 'Priya Singh',
      scheduledDate: getDateString(2),
      nextServiceDate: getDateString(92),
      status: 'Scheduled',
      priority: 'High',
      downtimeHours: '2',
      notes: 'Ensure food-grade oil is used as per OEM specs.'
    },
    {
      id: uuidv4(),
      machine: 'Conveyor Line A',
      location: 'Assembly Unit',
      task: 'Check belt tension and calibrate sensors',
      technician: 'Rahul Mehta',
      scheduledDate: getDateString(-1),
      nextServiceDate: getDateString(29),
      status: 'In Progress',
      priority: 'Medium',
      downtimeHours: '1.5',
      notes: 'Sensor #4 triggering false alarms; carry spare module.'
    },
    {
      id: uuidv4(),
      machine: 'Cooling Tower',
      location: 'Utilities',
      task: 'Clean filters and verify water treatment levels',
      technician: 'Anita George',
      scheduledDate: getDateString(-5),
      nextServiceDate: getDateString(25),
      status: 'Completed',
      priority: 'High',
      downtimeHours: '3',
      notes: 'Added anti-corrosion additive; monitor conductivity daily.',
      completedDate: getDateString(-5)
    }
  ];
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'In Progress':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'Delayed':
      return 'bg-red-100 text-red-600 border border-red-200';
    case 'On Hold':
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    default:
      return 'bg-blue-100 text-blue-600 border border-blue-200';
  }
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-100 text-red-600 border border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-600 border border-orange-200';
    case 'Low':
      return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
    default:
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  }
};

const MaintenanceLogs = () => {
  const [logs, setLogs] = useState(() => {
    if (typeof window === 'undefined') {
      return createSampleLogs();
    }
    try {
      const stored = window.localStorage.getItem('maintenanceLogs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Unable to read maintenance logs from storage', error);
    }
    return createSampleLogs();
  });

  const [formData, setFormData] = useState(initialFormState);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('maintenanceLogs', JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  useEffect(() => {
    if (!error) return undefined;
    const timeout = window.setTimeout(() => setError(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMachine = formData.machine.trim();
    const trimmedTask = formData.task.trim();

    if (!trimmedMachine || !trimmedTask || !formData.scheduledDate) {
      setError('Please provide at least the equipment name, task, and scheduled date.');
      return;
    }

    const newLog = {
      ...formData,
      id: uuidv4(),
      machine: trimmedMachine,
      task: trimmedTask,
      technician: formData.technician.trim(),
      location: formData.location.trim(),
      notes: formData.notes.trim()
    };

    setLogs((prev) => [newLog, ...prev]);
    setFormData(initialFormState);
    setSuccess('Maintenance task logged successfully.');
  };

  const handleStatusChange = (id, newStatus) => {
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id !== id) return log;
        const completedDate =
          newStatus === 'Completed'
            ? log.completedDate || new Date().toISOString().split('T')[0]
            : log.completedDate;
        return {
          ...log,
          status: newStatus,
          completedDate
        };
      })
    );
  };

  const handleDelete = (id) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleClearLogs = () => {
    const confirmClear =
      typeof window === 'undefined' ? true : window.confirm('This will remove all saved maintenance records. Continue?');
    if (!confirmClear) return;
    setLogs([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('maintenanceLogs');
    }
  };

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
      const matchesSearch =
        !term ||
        [log.machine, log.task, log.technician, log.location]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [logs, searchTerm, statusFilter]);

  const sortedLogs = useMemo(() => {
    const logsToSort = [...filteredLogs];
    return logsToSort.sort((a, b) => {
      const aDate = parseDate(a.scheduledDate) || new Date(0);
      const bDate = parseDate(b.scheduledDate) || new Date(0);
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });
  }, [filteredLogs, sortDirection]);

  const today = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, []);

  const stats = useMemo(() => {
    const openTasks = logs.filter((log) => log.status !== 'Completed').length;
    const completed = logs.filter((log) => log.status === 'Completed').length;
    const overdue = logs.filter((log) => {
      const date = parseDate(log.scheduledDate);
      return log.status !== 'Completed' && date && date < today;
    }).length;
    const weekAhead = new Date(today);
    weekAhead.setDate(today.getDate() + 7);
    const dueSoon = logs.filter((log) => {
      const date = parseDate(log.scheduledDate);
      return log.status !== 'Completed' && date && date >= today && date <= weekAhead;
    }).length;

    return {
      openTasks,
      completed,
      overdue,
      dueSoon,
      completionRate: logs.length ? Math.round((completed / logs.length) * 100) : 0,
      criticalAlerts: logs.filter((log) => log.priority === 'Critical' && log.status !== 'Completed').length
    };
  }, [logs, today]);

  const upcomingTasks = useMemo(() => {
    return logs
      .filter((log) => {
        const date = parseDate(log.scheduledDate);
        return log.status !== 'Completed' && date && date >= today;
      })
      .sort((a, b) => {
        const aDate = parseDate(a.scheduledDate) || new Date();
        const bDate = parseDate(b.scheduledDate) || new Date();
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [logs, today]);

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) return '—';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
              onClick={handleClearLogs}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Clear Logbook
            </button>
            <button
              onClick={() => setFormData(initialFormState)}
              className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Reset Form
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Open Tasks</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.openTasks}</div>
            <p className="mt-1 text-xs text-gray-500">{stats.criticalAlerts} critical alert(s)</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Due This Week</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.dueSoon}</div>
            <p className="mt-1 text-xs text-gray-500">Plan manpower accordingly</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Overdue</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.overdue}</div>
            <p className="mt-1 text-xs text-gray-500">Escalate overdue jobs promptly</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-4">
            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.completionRate}%</div>
            <p className="mt-1 text-xs text-gray-500">{stats.completed} job(s) closed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Log a Maintenance Task</h2>
            <p className="mt-1 text-sm text-gray-600">Capture the essentials for scheduling, traceability, and compliance.</p>
            {(error || success) && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                  error
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                }`}
              >
                {error || success}
              </div>
            )}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Equipment / Asset
                  <input
                    type="text"
                    name="machine"
                    value={formData.machine}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="e.g. Boiler #1"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Location / Line
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="e.g. Utilities Block"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Task Description
                <input
                  type="text"
                  name="task"
                  value={formData.task}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="e.g. Inspect bearings and lubricate"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Technician / Team
                  <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="e.g. Mechanical Crew"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Scheduled Date
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Priority
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Expected Downtime (hrs)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="downtimeHours"
                    value={formData.downtimeHours}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="e.g. 1.5"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Next Service Due
                  <input
                    type="date"
                    name="nextServiceDate"
                    value={formData.nextServiceDate}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Notes / Spare Parts
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="e.g. Order gasket kit in advance"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Maintenance Board</h2>
                <p className="mt-1 text-sm text-gray-600">Filter by status or search across assets, technicians, and locations.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  {['All', ...statusOptions].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Search equipment, task, or technician"
                />
                <button
                  type="button"
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sort {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {sortedLogs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No maintenance records found. Use the form above to log your first activity.
                </div>
              ) : (
                sortedLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
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
                          {log.downtimeHours && (
                            <div>
                              <span className="font-medium text-gray-700">Downtime:</span> {log.downtimeHours} hrs
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium text-gray-700">Scheduled:</span> {formatDate(log.scheduledDate)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Next Due:</span> {formatDate(log.nextServiceDate)}
                          </div>
                          {log.completedDate && (
                            <div>
                              <span className="font-medium text-gray-700">Completed:</span> {formatDate(log.completedDate)}
                            </div>
                          )}
                        </div>
                        {log.notes && <p className="mt-3 text-sm text-gray-600">Notes: {log.notes}</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <select
                          value={log.status}
                          onChange={(event) => handleStatusChange(log.id, event.target.value)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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
                        {formatDate(task.scheduledDate)}
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
