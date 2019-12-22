import { cacheable as cache, timeSlice as slice } from './extensions';
import 'reflect-metadata';
import { isAsyncOrPromise } from './utils';

export enum ResultType {
    Promise = 'Promise',
    Observable = 'Observable',
    Detect = 'Detect'
}

export function cacheable(timeout = 0, resultType = ResultType.Detect) {
    return function (
        target: any,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        let isPromise = false;
        if (resultType === ResultType.Detect) {
            const type = Reflect.getMetadata('design:returntype', target, key);
            if (type && isAsyncOrPromise(type)) {
                isPromise = true;
            }
        } else {
            isPromise = (resultType === ResultType.Promise);
        }

        descriptor.value = cache(descriptor.value, isPromise, timeout);
        return descriptor;
    };
}

export function timeSlice(timeout: number, resultType = ResultType.Detect) {
    return function (
        target: any,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        let isPromise = false;
        if (resultType === ResultType.Detect) {
            const type = Reflect.getMetadata('design:returntype', target, key);
            if (type && isAsyncOrPromise(type)) {
                isPromise = true;
            }
        } else {
            isPromise = (resultType === ResultType.Promise);
        }
        descriptor.value = slice(descriptor.value, isPromise, timeout);
        return descriptor;
    };
}
