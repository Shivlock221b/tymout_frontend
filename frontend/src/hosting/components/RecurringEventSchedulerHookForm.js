import React from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { FaCalendarAlt, FaRedo } from 'react-icons/fa';

/**
 * RecurringEventSchedulerHookForm Component
 * 
 * Following Single Responsibility Principle:
 * - This component is solely responsible for handling recurring event scheduling
 * - Uses React Hook Form for better form state management
 */
const RecurringEventSchedulerHookForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const { 
    control, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: defaultValues || {
      frequency: 'weekly',
      interval: 1,
      endDate: '',
      daysOfWeek: []
    }
  });

  // Watch frequency field to conditionally render UI
  const frequency = watch('frequency');
  
  // Process form data
  const processForm = (data) => {
    onSubmit(data);
  };

  // Day of week options
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <div>
      <form onSubmit={handleSubmit(processForm)}>
        <div className="space-y-6">
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaRedo className="mr-2 text-gray-400" />
                Frequency
              </span>
            </label>
            <div className="mt-1">
              <Controller
                name="frequency"
                control={control}
                rules={{ required: 'Frequency is required' }}
                render={({ field }) => (
                  <select
                    id="frequency"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    {...field}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              />
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
              )}
            </div>
          </div>

          {/* Interval */}
          <div>
            <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                Every
              </span>
            </label>
            <div className="mt-1 flex items-center">
              <Controller
                name="interval"
                control={control}
                rules={{ 
                  required: 'Interval is required',
                  min: { value: 1, message: 'Interval must be at least 1' }
                }}
                render={({ field }) => (
                  <input
                    type="number"
                    id="interval"
                    min="1"
                    className="inline-block w-16 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mr-2"
                    {...field}
                  />
                )}
              />
              <span className="text-sm text-gray-500">
                {frequency === 'daily' ? 'day(s)' : 
                  frequency === 'weekly' ? 'week(s)' : 'month(s)'}
              </span>
            </div>
            {errors.interval && (
              <p className="mt-1 text-sm text-red-600">{errors.interval.message}</p>
            )}
          </div>

          {/* Days of Week - only show for weekly frequency */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On which days?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <div key={day.value} className="flex items-center">
                    <Controller
                      name="daysOfWeek"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id={`day-${day.value}`}
                          value={day.value}
                          checked={field.value?.includes(day.value)}
                          onChange={e => {
                            const isChecked = e.target.checked;
                            const currentDays = field.value || [];
                            
                            if (isChecked) {
                              field.onChange([...currentDays, day.value]);
                            } else {
                              field.onChange(
                                currentDays.filter(value => value !== day.value)
                              );
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                        />
                      )}
                    />
                    <label htmlFor={`day-${day.value}`} className="text-sm text-gray-700">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="mt-1 text-sm text-red-600">{errors.daysOfWeek.message}</p>
              )}
            </div>
          )}

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              <span className="inline-flex items-center">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                End Date
              </span>
            </label>
            <div className="mt-1">
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id="endDate"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    {...field}
                  />
                )}
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave blank for no end date
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isSubmitting 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              Save Recurring Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

RecurringEventSchedulerHookForm.propTypes = {
  defaultValues: PropTypes.shape({
    frequency: PropTypes.string,
    interval: PropTypes.number,
    endDate: PropTypes.string,
    daysOfWeek: PropTypes.arrayOf(PropTypes.string)
  }),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

RecurringEventSchedulerHookForm.defaultProps = {
  defaultValues: null,
  isSubmitting: false
};

export default RecurringEventSchedulerHookForm;
