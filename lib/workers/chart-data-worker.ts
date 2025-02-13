import { IAgency, IRegsByDate } from '../types';
import { countWordsInJson } from '../utils';

interface IWorkerMessage {
  regsByDate: IRegsByDate[];
  selectedAgencies: IAgency[];
  targetWord?: string;
}

self.onmessage = (e: MessageEvent<IWorkerMessage>) => {
  const { regsByDate, selectedAgencies, targetWord } = e.data;

  const chartData = regsByDate.reduce(
    (acc: { [date: string]: { [agency: string]: number } }, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {};
      }

      const matchingAgencies = selectedAgencies.filter((agency) =>
        agency.cfr_references?.some(
          (ref) =>
            ref.title === curr.cfrReference.title &&
            ref.chapter === curr.cfrReference.chapter &&
            ref.subtitle === curr.cfrReference.subtitle,
        ),
      );

      matchingAgencies.forEach((agency) => {
        if (!acc[curr.date][agency.name]) {
          acc[curr.date][agency.name] = 0;
        }
        acc[curr.date][agency.name] +=
          countWordsInJson(curr.regs, targetWord || undefined) || 0;
      });

      return acc;
    },
    {},
  );

  const formattedData = Object.entries(chartData)
    .sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime(),
    )
    .map(([date, agencies]) => ({
      date,
      ...agencies,
    }));

  self.postMessage(formattedData);
};
