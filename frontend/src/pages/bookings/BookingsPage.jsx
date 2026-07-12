import { useState, useEffect } from 'react';
import { assetsApi, bookingsApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Table, Badge, Modal, Input, Select } from '../../components/ui';
import { Calendar, Plus, Clock, FileText, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

export default function BookingsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal states
  const [bookingModal, setBookingModal] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const assetRes = await assetsApi.getAll({ is_bookable: 'true' });
      if (assetRes.success) {
        setAssets(assetRes.data);
        if (assetRes.data.length > 0 && !selectedAssetId) {
          setSelectedAssetId(assetRes.data[0].id);
        }
      }
      
      const bookingsRes = await bookingsApi.getAll();
      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      }
    } catch (err) {
      toast.error('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAssetId]);

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const openBookingModal = (hour) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(hour + 1, 0, 0, 0);

    // Format for datetime-local value (YYYY-MM-DDTHH:MM)
    const formatDateTimeLocal = (date) => {
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date - tzOffset).toISOString().slice(0, 16);
    };

    setForm({
      startTime: formatDateTimeLocal(start),
      endTime: formatDateTimeLocal(end),
      purpose: '',
    });
    setBookingModal(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedAssetId) {
      toast.error('Please select a resource to book');
      return;
    }
    if (!form.startTime || !form.endTime) {
      toast.error('Start and End times are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingsApi.create({
        assetId: selectedAssetId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        purpose: form.purpose,
      });

      if (res.success) {
        toast.success('Resource booked successfully');
        fetchData();
        setBookingModal(false);
      } else {
        toast.error(res.error || 'Booking failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Make sure slot is available.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingsApi.cancel(id);
      if (res.success) {
        toast.success('Booking cancelled');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const openRescheduleModal = (booking) => {
    const formatDateTimeLocal = (dateStr) => {
      const date = new Date(dateStr);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date - tzOffset).toISOString().slice(0, 16);
    };

    setReschedulingBooking(booking);
    setForm({
      startTime: formatDateTimeLocal(booking.startTime),
      endTime: formatDateTimeLocal(booking.endTime),
      purpose: booking.purpose || '',
    });
    setRescheduleModal(true);
  };

  const handleRescheduleBooking = async () => {
    if (!reschedulingBooking) return;
    setSubmitting(true);
    try {
      const res = await bookingsApi.reschedule(reschedulingBooking.id, {
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });

      if (res.success) {
        toast.success('Booking rescheduled successfully');
        fetchData();
        setRescheduleModal(false);
      } else {
        toast.error(res.error || 'Reschedule failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reschedule. Ensure slot is available.');
    } finally {
      setSubmitting(false);
    }
  };

  // Find active resource details
  const activeAsset = assets.find((a) => a.id === selectedAssetId);

  // Filter bookings for current active date & asset
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const activeDayBookings = bookings.filter(
    (b) => b.assetId === selectedAssetId && b.status !== 'Cancelled' && isSameDay(new Date(b.startTime), selectedDate)
  );

  // Hours array from 8 AM to 8 PM
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const myBookingsColumns = [
    {
      key: 'assetName',
      label: 'Resource',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-text-primary">{row.assetName}</p>
          <span className="text-xs text-text-tertiary">{row.assetTag}</span>
        </div>
      ),
    },
    {
      key: 'time',
      label: 'Booked Period',
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-text-primary">
            {new Date(row.startTime).toLocaleDateString()}
          </p>
          <p className="text-xs text-text-secondary">
            {new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (val) => val || <span className="text-text-tertiary italic">—</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge
          variant={
            val === 'Upcoming'
              ? 'info'
              : val === 'Ongoing'
              ? 'success'
              : val === 'Completed'
              ? 'neutral'
              : 'danger'
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const canEdit = row.status === 'Upcoming' || row.status === 'Ongoing';
        return canEdit ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openRescheduleModal(row)}
            >
              Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 border-danger-200"
              onClick={() => handleCancelBooking(row.id)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <span className="text-xs text-text-tertiary">No actions</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-surface border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Resource Booking Center</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Book shared equipment, company vehicles, and conference rooms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            id="asset-selector"
            options={assets.map((a) => ({ value: a.id, label: `${a.name} (${a.categoryName})` }))}
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            placeholder="Select a resource..."
            className="w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Schedule Planner */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-500" />
              <h3 className="font-bold text-text-primary">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:bg-surface-secondary cursor-pointer transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-white text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg border border-border bg-white text-text-secondary hover:bg-surface-secondary cursor-pointer transition-colors"
                title="Next Day"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {hours.map((hour) => {
              const displayHour = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
              
              // Check if there is an active booking in this hour slot
              const bookingInSlot = activeDayBookings.find((b) => {
                const bStart = new Date(b.startTime).getHours();
                const bEnd = new Date(b.endTime).getHours();
                return hour >= bStart && hour < bEnd;
              });

              return (
                <div key={hour} className="flex min-h-[56px] group transition-colors">
                  <div className="w-24 text-right pr-4 py-3 text-xs font-semibold text-text-tertiary select-none">
                    {displayHour}
                  </div>
                  <div className="flex-1 border-l border-border px-3 py-1.5 relative flex items-center">
                    {bookingInSlot ? (
                      <div className="w-full bg-primary-50 border border-primary-200 rounded-lg p-2 flex items-center justify-between text-xs transition-shadow shadow-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary-600" />
                          <div>
                            <p className="font-semibold text-primary-800">
                              Booked by {bookingInSlot.bookedByName}
                            </p>
                            <p className="text-primary-600 mt-0.5">
                              {bookingInSlot.purpose || 'No purpose stated'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="info">
                          {bookingInSlot.status}
                        </Badge>
                      </div>
                    ) : (
                      <button
                        onClick={() => openBookingModal(hour)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-opacity cursor-pointer pl-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Book Slot
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource Details Sidecard */}
        <div className="bg-surface border border-border rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-text-primary border-b border-border pb-3">Resource Specs</h3>
          {activeAsset ? (
            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-bold text-text-tertiary uppercase">Name</span>
                <p className="text-sm font-semibold text-text-primary">{activeAsset.name}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-text-tertiary uppercase">Tag</span>
                <p className="text-sm font-mono font-medium text-text-secondary">{activeAsset.assetTag}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-text-tertiary uppercase">Category</span>
                <p className="text-sm font-medium text-text-secondary">{activeAsset.categoryName}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-text-tertiary uppercase">Location</span>
                <p className="text-sm font-medium text-text-secondary">{activeAsset.location || '—'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-text-tertiary uppercase">Condition</span>
                <Badge variant={activeAsset.condition === 'New' || activeAsset.condition === 'Good' ? 'success' : 'warning'}>
                  {activeAsset.condition}
                </Badge>
              </div>
              <div className="pt-2 border-t border-border">
                <Button variant="primary" className="w-full" onClick={() => openBookingModal(9)}>
                  <Calendar className="h-4 w-4" />
                  Request Booking
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-tertiary text-sm">
              No resource selected.
            </div>
          )}
        </div>
      </div>

      {/* My Bookings Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-text-primary">My Bookings</h3>
        </div>
        <Table
          columns={myBookingsColumns}
          data={bookings}
          loading={loading}
          emptyMessage="You have not requested any bookings yet."
        />
      </div>

      {/* Book Slot Modal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title={`Book ${activeAsset?.name || 'Resource'}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="bk-start"
              type="datetime-local"
              label="Start Time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              id="bk-end"
              type="datetime-local"
              label="End Time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <Input
            id="bk-purpose"
            label="Purpose of Booking"
            placeholder="e.g. Project Alignment Meeting"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          />

          <div className="flex items-start gap-2.5 p-3 bg-primary-50 rounded-lg text-primary-800 text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Overlap Validation Enforced</p>
              <p className="mt-0.5">The system prevents conflicting bookings. Verify the times on the schedule grid before submitting.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setBookingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleCreateBooking}>
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={rescheduleModal}
        onClose={() => setRescheduleModal(false)}
        title="Reschedule Booking"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            id="resched-start"
            type="datetime-local"
            label="New Start Time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
          <Input
            id="resched-end"
            type="datetime-local"
            label="New End Time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRescheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleRescheduleBooking}>
              Reschedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
