import { NextResponse } from 'next/server';
import { BASE_ECFR_API_URL } from '@/lib/constants';

export const GET = async () => {
  try {
    const response = await fetch(
      `${BASE_ECFR_API_URL}/api/admin/v1/agencies.json`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    );

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      data: data?.agencies || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch agencies',
    });
  }
};
