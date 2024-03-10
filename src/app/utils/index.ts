type AnyObject = { [key: string]: any };


export function removeDuplicatesByKey<T extends AnyObject>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      } else {
        seen.add(keyValue);
        return true;
      }
    });
  }