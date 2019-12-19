import { Observable, from } from 'rxjs';

export function hash(target: object) {
  return JSON.stringify(target);
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
  return await new Promise(resolve => {
    from(fn(...args)).subscribe(val => resolve(val));
  });
}
