import { useState, useEffect, useRef } from 'react';
import {
  ArrowPathIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { IAgency, IAgencyChild } from '@/lib/types';

interface AgencyMultiSelectProps {
  agencies: IAgency[];
  selectedAgencies: (IAgency | IAgencyChild)[];
  onChange: (selected: (IAgency | IAgencyChild)[]) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoadingAgencies: boolean;
}

export const AgencyMultiSelect = ({
  agencies,
  selectedAgencies,
  onChange,
  isOpen,
  setIsOpen,
  isLoadingAgencies,
}: AgencyMultiSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const isSelected = (agency: IAgency | IAgencyChild) => {
    return selectedAgencies.some((selected) => selected.slug === agency.slug);
  };

  const handleParentToggle = (agency: IAgency) => {
    if (isSelected(agency)) {
      // Deselect parent and all children
      const newSelected = selectedAgencies.filter(
        (selected) =>
          selected.slug !== agency.slug &&
          !agency.children?.some((child) => child.slug === selected.slug),
      );
      onChange(newSelected);
    } else {
      // Select parent and all children
      const newSelected = [
        ...selectedAgencies,
        agency,
        ...(agency.children || []),
      ];
      onChange(newSelected);
    }
  };

  const handleChildToggle = (parent: IAgency, child: IAgencyChild) => {
    if (isSelected(child)) {
      // Deselect child and parent
      const newSelected = selectedAgencies.filter(
        (selected) =>
          selected.slug !== child.slug && selected.slug !== parent.slug,
      );
      onChange(newSelected);
    } else {
      // Select child and parent if all siblings are selected
      const newSelected = [...selectedAgencies, child];
      const willAllChildrenBeSelected = parent.children?.every(
        (sibling) => sibling.slug === child.slug || isSelected(sibling),
      );
      if (willAllChildrenBeSelected) {
        newSelected.push(parent);
      }
      onChange(newSelected);
    }
  };

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearchTerm('');
  };

  const filteredAgencies = agencies.filter((agency) => {
    const matchesParent = agency.display_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const hasMatchingChildren = agency.children?.some((child) =>
      child.display_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return matchesParent || hasMatchingChildren;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between">
            <span>
              {selectedAgencies.length === 0 ? (
                <span className="text-gray-500">Select agencies...</span>
              ) : (
                <span>{selectedAgencies.length} agencies selected</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {selectedAgencies.length > 0 && (
                <div
                  onClick={handleClear}
                  className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear selection"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleClear(e);
                    }
                  }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </div>
              )}
              {isLoadingAgencies ? (
                <div className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agencies..."
              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-auto">
            {filteredAgencies.map((agency) => (
              <div key={agency.slug} className="flex flex-col">
                <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected(agency)}
                    onChange={() => handleParentToggle(agency)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{agency.display_name}</span>
                </label>

                {agency.children?.map((child) => (
                  <label
                    key={child.slug}
                    className="flex items-center px-4 py-2 pl-10 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(child)}
                      onChange={() => handleChildToggle(agency, child)}
                      className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {child.display_name}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
