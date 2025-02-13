import { parseStringPromise } from 'xml2js';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const parseXML = async (
  xml: string,
): Promise<{
  ok: boolean;
  result: any;
  error?: string;
}> => {
  try {
    const result = await parseStringPromise(xml);

    return {
      ok: true,
      result,
    };
  } catch (error) {
    console.error(error, xml);

    return {
      ok: false,
      result: null,
      error: 'Error parsing XML',
    };
  }
};

export function countWordsInJson(obj: any, targetWord?: string): number {
  try {
    if (typeof obj === 'string') {
      // Clean the string of punctuation before splitting into words
      const cleanString = obj.replace(/[^\w\s]|_/g, ' ');
      const words = cleanString
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      if (targetWord) {
        const count = words.filter(
          (word) => word.toLowerCase() === targetWord.toLowerCase(),
        ).length;
        return count;
      }
      // Count all words
      return words.length;
    }

    if (Array.isArray(obj)) {
      return obj.reduce(
        (sum: number, item) => sum + countWordsInJson(item, targetWord),
        0,
      );
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).reduce((sum: number, [key, value]) => {
        // Skip objects with keys starting with '$'.
        // It's metadata that's not useful for our purposes.
        if (key.startsWith('$')) return sum;
        return sum + countWordsInJson(value, targetWord);
      }, 0);
    }

    return 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
