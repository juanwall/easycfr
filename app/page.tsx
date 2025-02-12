'use client';

import { useEffect, useState } from 'react';

import { IAgency, IAgencyChild } from '@/lib/types';
import { AgencyMultiSelect } from '@/components/agency-multi-select';

const Dashboard = () => {
  const [agencies, setAgencies] = useState<IAgency[]>([]);
  const [isLoadingAgencies, setIsLoadingAgencies] = useState(true);
  const [selectedAgencies, setSelectedAgencies] = useState<
    (IAgency | IAgencyChild)[]
  >([]);
  const [isAgencyMultiSelectOpen, setIsAgencyMultiSelectOpen] = useState(false);

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
      <AgencyMultiSelect
        agencies={agencies}
        selectedAgencies={selectedAgencies}
        onChange={setSelectedAgencies}
        isOpen={isAgencyMultiSelectOpen}
        setIsOpen={setIsAgencyMultiSelectOpen}
        isLoadingAgencies={isLoadingAgencies}
      />
    </div>
  );
};

export default Dashboard;
