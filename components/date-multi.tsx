import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import DatePicker from 'react-tailwindcss-datepicker';
import type { DateValueType } from 'react-tailwindcss-datepicker';
import { LABEL_CLASS_NAME } from '@/lib/constants';
import Tooltip from './tooltip';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { IDatePill } from '@/lib/types';

interface IProps {
  selectedDates: IDatePill[];
  setSelectedDates: React.Dispatch<React.SetStateAction<IDatePill[]>>;
}

const DateMulti = ({ selectedDates, setSelectedDates }: IProps) => {
  const handleValueChange = (newValue: DateValueType | null) => {
    if (!newValue) return;
    if (newValue.startDate) handleAddDate(newValue.startDate);
  };

  const handleAddDate = (date: Date) => {
    const normalizedNewDate = new Date(date.setHours(0, 0, 0, 0));

    console.log(normalizedNewDate);

    setSelectedDates((prev: IDatePill[]) => {
      // Check if date already exists
      const dateExists = prev.some(
        (pill) =>
          new Date(pill.date.setHours(0, 0, 0, 0)).getTime() ===
          normalizedNewDate.getTime(),
      );

      if (dateExists) return prev;

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          date: normalizedNewDate,
        },
      ];
    });
  };

  const handleRemoveDate = (pillToRemove: IDatePill) => {
    setSelectedDates((prev) =>
      prev.filter((date) => date.id !== pillToRemove.id),
    );
  };

  return (
    <div className="w-full">
      <label className={LABEL_CLASS_NAME}>
        Dates
        <Tooltip
          id={`dates-tooltip`}
          content={`Select one or more dates to compare regulations across time. Dates you select will be snapshots of regulations on those dates. Data in the eCFR is only available from Jan. 3, 2017 and later.`}
          place="bottom"
        >
          <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
        </Tooltip>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <DatePicker
          value={null}
          onChange={handleValueChange}
          asSingle={true}
          useRange={false}
          containerClassName="inline-block"
          inputClassName="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200 cursor-pointer placeholder:text-gray-700 w-[95px]"
          showShortcuts={false}
          popoverDirection="down"
          placeholder={'+ Add date'}
          primaryColor="indigo"
          toggleClassName="hidden"
          maxDate={new Date()}
          minDate={new Date('2017-01-03')}
          readOnly
        />

        {selectedDates.map((pill) => (
          <span
            key={pill.id}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700"
          >
            {format(pill.date, 'MMM d, yyyy')}

            <button
              type="button"
              onClick={() => handleRemoveDate(pill)}
              className="ml-1 inline-flex rounded-full p-0.5 hover:bg-indigo-200"
            >
              <XMarkIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Remove date</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default DateMulti;
