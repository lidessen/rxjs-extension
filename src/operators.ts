import { tap, filter } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';

type Comparable = number | string | object | null | undefined;

function comparable(value: Comparable) {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

export function distinctTime<T extends Comparable>(
  duration: number
): MonoTypeOperatorFunction<T> {
  return source => {
    const valueSet = new Set<Comparable>();
    return source.pipe(
      filter(value => !valueSet.has(comparable(value))),
      tap(value => {
        const cvalue = comparable(value);
        if (!valueSet.has(cvalue)) {
          valueSet.add(cvalue);
          setTimeout(() => valueSet.delete(cvalue), duration);
        }
      })
    );
  };
}
