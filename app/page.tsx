'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';

import { IAgency, IDatePill, IRegsByDate } from '@/lib/types';
import { AgencyMultiSelect } from '@/components/agency-multi-select';
import DateMulti from '@/components/date-multi';
import Input from '@/components/input';
import Tooltip from '@/components/tooltip';
import {
  cacheRegs,
  getCachedRegs,
  getRegCacheKey,
  initDB,
} from '@/lib/utils/indexed-db';
import Chart from '@/components/chart';
import Alert from '@/components/alert';

const Dashboard = () => {
  const [agencies, setAgencies] = useState<IAgency[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  const [selectedAgencies, setSelectedAgencies] = useState<IAgency[]>([]);
  const [isAgencyMultiSelectOpen, setIsAgencyMultiSelectOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<IDatePill[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [regsByDate, setRegsByDate] = useState<IRegsByDate[]>([]);

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

    initDB().catch((error) =>
      console.error('Error during indexedDB init:', error),
    );
  }, []);

  const getRegs = async (agencies: IAgency[]) => {
    try {
      setIsLoadingRegs(true);

      const cfrReferences = agencies
        .flatMap((agency) => agency.cfr_references || [])
        .filter(
          (ref, index, self) =>
            index ===
            self.findIndex(
              (r) =>
                r.title === ref.title &&
                r.chapter === ref.chapter &&
                r.subtitle === ref.subtitle,
            ),
        );

      const regsByDate: IRegsByDate[] = [];

      // Create an array to collect all failures
      const failures = await Promise.all(
        selectedDates.flatMap((dateObj) =>
          cfrReferences.map(async (cfrReference) => {
            const regCacheKey = getRegCacheKey({
              date: dateObj.date.toISOString().split('T')[0],
              title: cfrReference.title.toString(),
              chapter: cfrReference.chapter,
              subtitle: cfrReference.subtitle,
            });

            // Get from cache or fetch
            const cachedData = await getCachedRegs(regCacheKey);
            if (cachedData) {
              regsByDate.push(cachedData);
              return [];
            }

            // If not in cache, fetch it
            const res = await fetch('/api/ecfr/regs', {
              method: 'POST',
              body: JSON.stringify({
                dates: [dateObj.date.toISOString().split('T')[0]],
                cfrReferences: [cfrReference],
              }),
            });

            const json = await res.json();

            if (
              !json?.ok ||
              !Array.isArray(json?.data) ||
              json.data.length === 0
            ) {
              return selectedAgencies
                .filter((agency) =>
                  agency.cfr_references?.some(
                    (ref) =>
                      ref.title === cfrReference.title &&
                      ref.chapter === cfrReference.chapter &&
                      ref.subtitle === cfrReference.subtitle,
                  ),
                )
                .map((agency) => agency.name);
            }

            await cacheRegs(regCacheKey, json.data[0]);
            regsByDate.push(json.data[0]);
            return [];
          }),
        ),
      );

      const uniqueFailedAgencies = [...new Set(failures.flat())];

      if (uniqueFailedAgencies.length > 0) {
        setSelectedAgencies((prev) =>
          prev.filter((agency) => !uniqueFailedAgencies.includes(agency.name)),
        );

        toast.error(
          <div>
            <p>Failed to fetch regulations for the following agencies:</p>
            <ul className="list-disc list-inside">
              {uniqueFailedAgencies.map((name) => (
                <li key={name} className="ml-2 flex">
                  <span className="flex-shrink-0 mr-2">•</span>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
            <p>
              {uniqueFailedAgencies.length === 1 ? 'It has' : 'They have'} been
              removed from your selected entities. You may add{' '}
              {uniqueFailedAgencies.length === 1 ? 'it' : 'them'} back to
              re-fetch.
            </p>
          </div>,
        );
      }

      setRegsByDate(regsByDate);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRegs(false);
    }
  };

  useEffect(() => {
    if (
      !isAgencyMultiSelectOpen &&
      selectedDates.length > 0 &&
      selectedAgencies.length > 0
    ) {
      getRegs(selectedAgencies);
    }
  }, [isAgencyMultiSelectOpen, selectedDates, selectedAgencies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

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
            isLoadingRegs={isLoadingRegs}
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
          isLoadingRegs={isLoadingRegs}
        />
      </div>

      {selectedAgencies.length === 0 || selectedDates.length === 0 ? (
        <div className="mt-10 max-w-md w-full mx-auto">
          <Alert
            message={`Select ${
              selectedAgencies.length === 0 ? 'an entity' : 'a date'
            } to view an analysis.`}
          />
        </div>
      ) : (
        <div className="mt-10 h-[500px] w-full">
          <Chart
            regsByDate={regsByDate}
            selectedAgencies={selectedAgencies}
            targetWord={debouncedSearchText}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
