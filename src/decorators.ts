import { cacheable as cache, timeSlice as slice } from './extensions';

export module operators {
  export function cacheable(timeout: number = 0) {
    return function(
      target: any,
      key: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const method = cache(target[key], timeout);
      descriptor.get = () => {
        return method;
      };
      Object.defineProperty(target, key, descriptor);
    };
  }

  export function timeSlice(timeout: number) {
    return function(
      target: any,
      key: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const method = slice(target[key], timeout);
      descriptor.get = () => {
        return method;
      };
      Object.defineProperty(target, key, descriptor);
    };
  }
}
