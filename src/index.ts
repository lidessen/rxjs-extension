import { Subject, Observable, of, timer, interval, from } from 'rxjs';
import { mergeMapTo, take, tap, mergeMap } from 'rxjs/operators';
// import { hash } from './utils';
function hash(target: object) {
  return JSON.stringify(target);
}
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

export function timeSlice<T extends (...args: any[]) => Observable<any>>(
  func: T,
  timeout: number
) {
  const subject = new TimeSliceSubject<any[]>(timeout);
  return ((...args: any[]) => {
    subject.next(args);
    return subject.pipe(
      mergeMap(val => {
        return func(val);
      })
    );
  }) as T;
}

export function cacheable<T extends (...args: any[]) => Observable<any>>(
  func: T,
  timeout: number = 0
) {
  const cache: { [key: string]: Observable<any> } = {};
  return ((...args: any[]) => {
    const key = hash(args);
    if (!cache[key]) {
      cache[key] = func(...args).pipe(
        tap(result => {
          cache[key] = of(result);
          setTimeout(() => {
            delete cache[key];
          }, timeout);
        })
      );
    }
    return cache[key];
  }) as T;
}

const get = () => {
  return from(
    new Promise(resolve => {
      setTimeout(() => resolve(new Date()), 2000);
    })
  );
};

const cachedGet = cacheable(get, 2000);

interval(1001)
  .pipe(take(5))
  .subscribe(val => cachedGet().subscribe(v => console.log(val + 1, v)));
