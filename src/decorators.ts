import { cacheable as cache, timeSlice as slice } from './extensions';
import 'reflect-metadata';
import { isAsyncOrPromise } from './utils';

export function cacheable(timeout: number = 0) {
  return function(
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const type = Reflect.getMetadata('design:returntype', target, key);
    descriptor.value = cache(descriptor.value, isAsyncOrPromise(type), timeout);
    return descriptor;
  };
}

export function timeSlice(timeout: number) {
  return function(
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const type = Reflect.getMetadata('design:returntype', target, key);
    descriptor.value = slice(descriptor.value, isAsyncOrPromise(type), timeout);
    return descriptor;
  };
}
