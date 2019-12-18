# rxjs-extension

## Usage

### `TimeSliceSubject`

Give a time , only latest values of each period will be published

```ts
import { interval } from 'rxjs';
import { TimeSliceSubject } from 'rxjs-extension';

const subject = new TimeSliceSubject<any>(5000);

subject.subscribe(console.log);

interval(1000).subscribe(val => subject.next(val + 1));

/** log:
 *  5
 *  10
 *  15
 *  20
 *  ...
 */
```

### `timeSlice`

turn a `Observalbe<T>` to time sliced `Observalbe<T>`, this is very useful when serval modify to signle object in a short time but you only want to post the data to server once with the latest value

```ts
import { interval } from 'rxjs';
import { timeSlice } from 'rxjs-extension';

const save = (n: number) => of(`${n} saved!`);

const timeSlicedSave = timeSlice(save, 5000);

interval(1000)
  .pipe(take(5))
  .subscribe(val => timeSlicedSave(val + 1).subscribe(console.log));

/* log:

5 saved! ​​​​​

5 saved! ​​​​​

5 saved! ​​​​​

5 saved! ​​​​​

5 saved! ​​​
*/
```

### `cacheable`

This function will make a subscription cacheable

```ts
const get = () => {
  return from(
    new Promise(resolve => {
      setTimeout(() => resolve(new Date()), 2000);
    })
  );
};

const cachedGet = cacheable(get);
```

all the request will be reused unless the first request finished

you call also pass a timeout:

```ts
const cachedGet = cacheable(get, 2000);
```

the result will be cached for 2s
