import { Subject, Observable, of, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { hash } from './utils';

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
>(func: T, isPromise: boolean, timeout: number) {
  const subject = new TimeSliceSubject<any[]>(timeout);
  return function(this: any, ...args: any[]) {
    subject.next(args);
    const result = subject.pipe(
      mergeMap(val => {
        const rawResult = func.apply(this, val);
        return rawResult;
      })
    );
    if (isPromise) {
      return new Promise(resolve => {
        result.subscribe(val => {
          resolve(val);
        });
      });
    } else {
      return result;
    }
  } as T;
}

export function cacheable<
  T extends (...args: any[]) => Observable<any> | Promise<any>
>(func: T, isPromise: boolean, timeout: number = 0) {
  const cache: { [key: string]: Observable<any> | Promise<any> } = {};
  return function(this: any, ...args: any[]) {
    const key = hash(args);
    if (!cache[key]) {
      const rawResult = func.apply(this, args);
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
  } as T;
}
