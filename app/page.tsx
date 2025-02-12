'use client';

import { useEffect, useState } from 'react';

import { IAgency, IAgencyChild, IDatePill } from '@/lib/types';
import { AgencyMultiSelect } from '@/components/agency-multi-select';
import DateMulti from '@/components/date-multi';
import Input from '@/components/input';
import Tooltip from '@/components/tooltip';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';

const Dashboard = () => {
  const [agencies, setAgencies] = useState<IAgency[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  const [selectedAgencies, setSelectedAgencies] = useState<
    (IAgency | IAgencyChild)[]
  >([]);
  const [isAgencyMultiSelectOpen, setIsAgencyMultiSelectOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<IDatePill[]>([
    {
      id: crypto.randomUUID(),
      date: new Date(),
    },
  ]);
  const [searchText, setSearchText] = useState('');
  const getAgencies = async () => {
    try {
      const data = await fetch('/api/ecfr/agencies');
      const json = await data.json();
      setAgencies(json?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAgencies(false);
    }
  };

  useEffect(() => {
    getAgencies();
  }, []);

  useEffect(() => {
    if (!isAgencyMultiSelectOpen) {
      // Get agency data
    }
  }, [isAgencyMultiSelectOpen]);

  console.log(agencies);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <AgencyMultiSelect
            agencies={agencies}
            selectedAgencies={selectedAgencies}
            onChange={setSelectedAgencies}
            isOpen={isAgencyMultiSelectOpen}
            setIsOpen={setIsAgencyMultiSelectOpen}
            isLoadingAgencies={isLoadingAgencies}
          />
        </div>

        <div className="flex-1">
          <Input
            label={
              <>
                Text search (optional)
                <Tooltip
                  id={`search-tooltip`}
                  content={`Search for text matches. This will search the title, chapter, and section of the regulation. If you don't provide a search term, all text will be searched.`}
                  place="bottom"
                >
                  <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                </Tooltip>
              </>
            }
            placeholder="Text search"
            value={searchText}
            onChange={setSearchText}
          />
        </div>
      </div>

      <div className="mt-4">
        <DateMulti
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
      </div>
    </div>
  );
};

export default Dashboard;
