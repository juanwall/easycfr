import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import DatePicker from 'react-tailwindcss-datepicker';
import type { DateValueType } from 'react-tailwindcss-datepicker';
import { LABEL_CLASS_NAME } from '@/lib/constants';
import Tooltip from './tooltip';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';
import { IDatePill } from '@/lib/types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/lib/utils';

interface IProps {
  selectedDates: IDatePill[];
  setSelectedDates: React.Dispatch<React.SetStateAction<IDatePill[]>>;
  isLoadingRegs: boolean;
}

const DateMulti = ({
  selectedDates,
  setSelectedDates,
  isLoadingRegs,
}: IProps) => {
  const [latestIssueDate, setLatestIssueDate] = useState<Date | null>(null);
  const [isLoadingLatestIssueDate, setIsLoadingLatestIssueDate] =
    useState(true);

  const getLatestIssueDate = async () => {
    try {
      const response = await fetch('/api/ecfr/titles/latestIssueDate');
      const json = await response.json();

      const [year, month, day] = json.data.split('-').map(Number);

      const date = new Date(Date.UTC(year, month - 1, day));

      const localDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
      );

      setLatestIssueDate(localDate);

      setSelectedDates([
        {
          id: crypto.randomUUID(),
          date: localDate,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingLatestIssueDate(false);
    }
  };

  useEffect(() => {
    getLatestIssueDate();
  }, []);

  const handleValueChange = (newValue: DateValueType | null) => {
    if (!newValue) return;
    if (newValue.startDate) handleAddDate(newValue.startDate);
  };

  const handleAddDate = (date: Date) => {
    const normalizedNewDate = new Date(date.setHours(0, 0, 0, 0));

    setSelectedDates((prev: IDatePill[]) => {
      const dateExists = prev.some(
        (pill) =>
          new Date(pill.date.setHours(0, 0, 0, 0)).getTime() ===
          normalizedNewDate.getTime(),
      );

      if (dateExists) return prev;

      const newDates = [
        ...prev,
        {
          id: crypto.randomUUID(),
          date: normalizedNewDate,
        },
      ];

      return newDates.sort((a, b) => a.date.getTime() - b.date.getTime());
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
          content={`Select one or more dates to compare regulations across time. Dates you select will be snapshots of regulations on those dates. Data in the eCFR is only available from Jan. 3, 2017 and later. ${latestIssueDate ? `The most recent date available in the eCFR is ${format(latestIssueDate, 'MMM. d, yyyy')}.` : ''}`}
          place="bottom"
        >
          <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
        </Tooltip>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {isLoadingLatestIssueDate ? (
          <div className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 w-[95px] h-[30px]">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <DatePicker
            value={null}
            onChange={handleValueChange}
            asSingle={true}
            useRange={false}
            containerClassName="inline-block"
            inputClassName={classNames(
              'inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-200 cursor-pointer placeholder:text-indigo-700 w-[95px] h-[30px]',
              isLoadingRegs ? 'opacity-50 cursor-not-allowed' : '',
            )}
            showShortcuts={false}
            popoverDirection="down"
            placeholder={'+ Add date'}
            primaryColor="indigo"
            toggleClassName="hidden"
            maxDate={latestIssueDate}
            minDate={new Date('2017-01-03')}
            readOnly
            disabled={isLoadingRegs}
          />
        )}

        {selectedDates.map((pill) => (
          <span
            key={pill.id}
            className={classNames(
              'inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 h-[30px]',
              isLoadingRegs ? 'opacity-50 cursor-not-allowed' : '',
            )}
          >
            {format(pill.date, 'MMM. d, yyyy')}

            <button
              type="button"
              onClick={() => handleRemoveDate(pill)}
              className={classNames(
                'ml-1 inline-flex rounded-full p-0.5 hover:bg-indigo-200',
                isLoadingRegs ? 'opacity-50 cursor-not-allowed' : '',
              )}
              disabled={isLoadingRegs}
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
