import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseISO, format, isSameDay, isAfter, isBefore } from 'date-fns';

export default function RoomCalendar({ 
  selectedDates, 
  onSelectDates, 
  bookedDates = [], 
  blockedDates = [] 
}) {
  const [checkIn, setCheckIn] = React.useState(selectedDates?.checkIn || null);
  const [checkOut, setCheckOut] = React.useState(selectedDates?.checkOut || null);

  const isDateBooked = (date) => {
    return bookedDates.some(booking => {
      if (booking.status === 'cancelled') return false;
      const bookingStart = parseISO(booking.check_in);
      const bookingEnd = parseISO(booking.check_out);
      return (date >= bookingStart && date <= bookingEnd);
    });
  };

  const isDateBlocked = (date) => {
    return blockedDates.some(block => {
      const blockStart = parseISO(block.start_date);
      const blockEnd = parseISO(block.end_date);
      return (date >= blockStart && date <= blockEnd);
    });
  };

  const isDateUnavailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    if (isDateBooked(date)) return true;
    if (isDateBlocked(date)) return true;
    
    return false;
  };

  const handleDateSelect = (date) => {
    if (!date || isDateUnavailable(date)) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Starting new selection
      setCheckIn(date);
      setCheckOut(null);
      onSelectDates({ checkIn: date, checkOut: null });
    } else if (checkIn && !checkOut) {
      // Selecting check-out date
      if (isBefore(date, checkIn)) {
        // If selected date is before check-in, swap them
        setCheckOut(checkIn);
        setCheckIn(date);
        onSelectDates({ checkIn: date, checkOut: checkIn });
      } else {
        // Check if any dates in between are unavailable
        const datesBetween = [];
        let currentDate = new Date(checkIn);
        while (currentDate <= date) {
          datesBetween.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const hasUnavailableBetween = datesBetween.some(d => 
          !isSameDay(d, checkIn) && isDateUnavailable(d)
        );

        if (hasUnavailableBetween) {
          // Reset if there are unavailable dates in between
          setCheckIn(date);
          setCheckOut(null);
          onSelectDates({ checkIn: date, checkOut: null });
        } else {
          setCheckOut(date);
          onSelectDates({ checkIn, checkOut: date });
        }
      }
    }
  };

  const modifiers = {
    booked: (date) => isDateBooked(date),
    blocked: (date) => isDateBlocked(date),
    selected: (date) => {
      if (!checkIn) return false;
      if (checkOut) {
        return date >= checkIn && date <= checkOut;
      }
      return isSameDay(date, checkIn);
    },
    checkIn: (date) => checkIn && isSameDay(date, checkIn),
    checkOut: (date) => checkOut && isSameDay(date, checkOut),
  };

  const modifiersClassNames = {
    booked: "opacity-30 line-through text-gray-400 cursor-not-allowed hover:bg-transparent",
    blocked: "opacity-30 bg-red-50 text-red-400 cursor-not-allowed hover:bg-red-50",
    selected: "bg-amber-100 text-amber-900 hover:bg-amber-100",
    checkIn: "bg-amber-700 text-white hover:bg-amber-700 rounded-l-md",
    checkOut: "bg-amber-700 text-white hover:bg-amber-700 rounded-r-md",
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="mb-4">
          <h3 className="font-medium text-gray-800 mb-2">Select Your Dates</h3>
          <p className="text-sm text-gray-600">Click to select check-in, then click again for check-out</p>
        </div>

        <Calendar
          mode="single"
          selected={checkIn}
          onSelect={handleDateSelect}
          disabled={isDateUnavailable}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="rounded-md border-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center text-amber-900",
            caption_label: "text-base font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-transparent hover:bg-amber-200 rounded-md transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-amber-800 rounded-md w-9 font-medium text-sm",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-amber-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal hover:bg-amber-100 rounded-md transition-colors",
            day_selected: "bg-amber-700 text-white hover:bg-amber-700 hover:text-white focus:bg-amber-700 focus:text-white",
            day_today: "bg-amber-200 text-amber-900 font-semibold",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-30",
            day_hidden: "invisible",
          }}
        />

        {(checkIn || checkOut) && (
          <div className="mt-6 pt-4 border-t border-amber-300">
            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="text-gray-600 mb-1">Check-in</p>
                <p className="font-medium text-gray-800">
                  {checkIn ? format(checkIn, 'MMM dd, yyyy') : '-'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-1">Check-out</p>
                <p className="font-medium text-gray-800">
                  {checkOut ? format(checkOut, 'MMM dd, yyyy') : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-700 rounded" />
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-200 rounded" />
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 opacity-30 rounded line-through" />
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 opacity-30 rounded" />
          <span className="text-gray-600">Blocked</span>
        </div>
      </div>
    </div>
  );
}