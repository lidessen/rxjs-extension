import { Subject, Observable, of, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { hash, isAsyncOrPromise } from './utils';

export class TimeSliceSubject<T> extends Subject<T> {
  private value!: T;
  private free = true;
  constructor(private timeout: number) {
    super();
  }

  next(value?: T) {
    if (value !== undefined) {
      this.value = value;
    }
    if (this.free) {
      this.free = false;
      setTimeout(() => {
        super.next(this.value);
        this.free = true;
      }, this.timeout);
    }
  }
}

export function timeSlice<
  T extends (...args: any[]) => Observable<any> | Promise<any>
>(func: T, timeout: number) {
  const subject = new TimeSliceSubject<any[]>(timeout);
  return ((...args: any[]) => {
    subject.next(args);
    let isPromise = false;
    const result = subject.pipe(
      mergeMap(val => {
        const rawResult = func(val);
        isPromise = isAsyncOrPromise(rawResult);
        return rawResult;
      })
    );
    if (isPromise) {
      return result.toPromise();
    } else {
      return result;
    }
  }) as T;
}

export function cacheable<
  T extends (...args: any[]) => Observable<any> | Promise<any>
>(func: T, timeout: number = 0) {
  const cache: { [key: string]: Observable<any> | Promise<any> } = {};
  let isPromise = false;
  return ((...args: any[]) => {
    const key = hash(args);
    if (!cache[key]) {
      const rawResult = func(...args);
      isPromise = isAsyncOrPromise(rawResult);
      const result = from(rawResult).pipe(
        tap(value => {
          cache[key] = isPromise ? Promise.resolve(value) : of(value);
          setTimeout(() => {
            delete cache[key];
          }, timeout);
        })
      );
      cache[key] = isPromise ? result.toPromise() : result;
    }
    return cache[key];
  }) as T;
}
