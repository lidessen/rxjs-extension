import { TimeSliceSubject, timeSlice, cacheable } from './index';
import { interval, timer } from 'rxjs';
import { take } from 'rxjs/operators';

// test('TimeSliceSubject should be', done => {
//   const result: any[] = [];
//   const subject = new TimeSliceSubject<number>(5000);
//   subject.pipe(take(1)).subscribe(val => {
//     console.log(val);
//     result.push(val);
//   });

//   interval(1000)
//     .pipe(take(9))
//     .subscribe({
//       next: val => {
//         console.log(val);
//         subject.next(val);
//       },
//       complete: () => {
//         console.log(result);
//         expect(result).toEqual([4]);
//         done();
//       }
//     });
// });
