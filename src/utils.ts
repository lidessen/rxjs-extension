import { Observable, from } from 'rxjs';
import md5 from 'md5-ts';

export function hash(target: object) {
  return md5(JSON.stringify(target));
}

export const AsyncFunction = async function() {}.constructor;

export function isAsyncOrPromise(fn: any) {
  return fn instanceof Promise || fn instanceof AsyncFunction;
}

export function timeout(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

export async function toPromise(
  fn: (...args: any[]) => Observable<any> | Promise<any>,
  args: any[]
) {
  return await new Promise((resolve, reject) => {
    from(fn(...args)).subscribe(
      val => resolve(val),
      error => reject(error)
    );
  });
}
