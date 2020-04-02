import { Subject, Observable, of, from, throwError } from 'rxjs';
import { tap, mergeMap, take, catchError } from 'rxjs/operators';
import { hash, toPromise } from './utils';

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
  const subject = new TimeSliceSubject<() => Observable<any> | Promise<any>>(
    timeout
  );
  const result = subject.pipe(
    take(1),
    mergeMap(res => res())
  );
  return function(this: any, ...args: any[]) {
    const rawResult = cacheable(() => func.apply(this, args), isPromise);
    subject.next(rawResult);
    if (isPromise) {
      return new Promise((resolve, reject) => {
        result.subscribe(
          val => {
            resolve(val);
          },
          error => {
            reject(error);
          }
        );
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
      const rawResult = toPromise(func.bind(this), args);
      const result = from(rawResult).pipe(
        tap(value => {
          cache[key] = isPromise ? Promise.resolve(value) : of(value);
          setTimeout(() => {
            delete cache[key];
          }, timeout);
        }),
        catchError(error => {
          cache[key] = isPromise ? Promise.reject(error) : throwError(error);
          throw error;
        })
      );
      cache[key] = isPromise
        ? new Promise((resolve, reject) => {
            result.subscribe(
              val => {
                resolve(val);
              },
              error => {
                reject(error);
              }
            );
          })
        : result;
    }
    return cache[key];
  } as T;
}
