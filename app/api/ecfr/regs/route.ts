import { NextRequest, NextResponse } from 'next/server';

import { BASE_ECFR_API_URL } from '@/lib/constants';
import { parseXML } from '@/lib/utils';
import { ICFRReference, IRegsByDate } from '@/lib/types';

export const POST = async (request: NextRequest) => {
  try {
    const { dates, cfrReferences } = (await request.json()) as {
      dates: string[];
      cfrReferences: ICFRReference[];
    };

    if (
      !Array.isArray(dates) ||
      dates.length === 0 ||
      dates.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid dates',
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(cfrReferences) ||
      cfrReferences.length === 0 ||
      cfrReferences.some((ref) => !ref.title)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid cfrReferences',
        },
        { status: 400 },
      );
    }

    const promises = dates.flatMap((date) =>
      cfrReferences.map(async (cfrReference) => {
        try {
          const params = new URLSearchParams();

          if (cfrReference.chapter) params.set('chapter', cfrReference.chapter);
          if (cfrReference.subtitle)
            params.set('subtitle', cfrReference.subtitle);

          const response = await fetch(
            `${BASE_ECFR_API_URL}/api/versioner/v1/full/${date}/title-${cfrReference.title}.xml?${params.toString()}`,
            {
              headers: {
                accept: 'application/xml',
              },
            },
          );

          if (response?.status !== 200) {
            console.error('Error fetching regulation:', {
              date,
              cfrReference,
              status: response.status,
            });

            return {
              error: 'Error fetching regulation',
            };
          }

          const xmlText = await response.text();
          const xmlRes = await parseXML(xmlText);

          if (!xmlRes.ok) {
            return {
              error: xmlRes.error,
            };
          }

          return {
            date,
            cfrReference,
            regs: xmlRes.result || {},
          } satisfies IRegsByDate;
        } catch (error) {
          console.error('Error fetching regulation:', {
            date,
            cfrReference,
            error,
          });
          // Return a valid IRegsByDate object even in error case
          return {
            error: 'Error fetching regulation',
          };
        }
      }),
    );

    const results = await Promise.all(promises);

    if (results.some((result) => result.error)) {
      return NextResponse.json({
        ok: false,
        error: 'Error fetching regulations',
      });
    }

    return NextResponse.json({
      ok: true,
      data: results,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch agencies',
    });
  }
};
