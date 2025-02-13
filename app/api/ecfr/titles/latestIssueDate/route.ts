import { NextResponse } from 'next/server';

import { BASE_ECFR_API_URL } from '@/lib/constants';

interface IEcfrTitle {
  number: number;
  name: string;
  latest_amended_on: string;
  latest_issue_date: string;
  up_to_date_as_of: string | null;
  reserved: boolean;
}

interface ITitlesResponse {
  meta: {
    date: string;
    import_in_progress: boolean;
  };
  titles: IEcfrTitle[];
}

export const GET = async () => {
  try {
    const response = await fetch(
      `${BASE_ECFR_API_URL}/api/versioner/v1/titles.json`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    );

    const json: ITitlesResponse = await response.json();

    if (json?.meta?.import_in_progress) {
      const oldestDate = json.titles
        .filter((title) => title.up_to_date_as_of !== null)
        .reduce(
          (oldest, title) => {
            if (!oldest) return title.up_to_date_as_of;
            return new Date(title.up_to_date_as_of!) < new Date(oldest)
              ? title.up_to_date_as_of
              : oldest;
          },
          null as string | null,
        );

      return NextResponse.json({ ok: true, data: oldestDate });
    }

    return NextResponse.json({ ok: true, data: json?.meta?.date });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: 'Failed to fetch latest issue date' },
      { status: 500 },
    );
  }
};
