import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AsyncSubject, BehaviorSubject, concat, fromEvent, interval, merge, noop, of, ReplaySubject, Subject, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { concatMap, exhaustMap, map, mergeMap } from 'rxjs/operators';
import { createHttpObservable } from '../common/util';


@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    //  const interval$ = interval(1000);
    // const interval$ = timer(3000, 1000);

    // // const sub = interval$.subscribe(
    // //     val => console.log(val),
    // //     noop, //() => { },
    // //     () => console.log('completed')
    // // );
    // // or use observer inside subscribe. order does not matter, as named methods
    // const sub = interval$.subscribe({
    //   next: (val) => console.log(val),
    //   error: noop,
    //   complete: () => console.log('completed')
    // });

    // const clicks$ = fromEvent(document, 'click');
    // clicks$.subscribe((evt) => console.log(evt));

    const s1$ = of(1, 2, 3);
    const s2$ = of(10, 10, 10);

    // const r$ = concat(s1$, s2$);
    // r$.subscribe(console.log); // 1,2,3,10,10,10

    // s2$.pipe(
    //   map(v => 10 * v)
    // ).subscribe(console.log);

    // concat map example
    // s1$.pipe(
    //   // concatMap(val => this.getData(val, s2$))
    //   concatMap(val => s2$.pipe(
    //     map(v => v * val)
    //   )))
    //   .subscribe(console.log);

    // // merge example. 
    // const interval1$ = interval(1000);
    // const interval2$ = interval1$.pipe(map(val => 10 * val));
    // const result$ = merge(interval1$, interval2$);
    // result$.subscribe(console.log);

    // merge map example. need 2 observables
    // const interval1$ = interval(1000);
    // interval1$.pipe(
    //   mergeMap(val => s1$.pipe(
    //     map(v => v * val)
    //   )))
    //   .subscribe(console.log);

    // unsubscribe after 5 seconds.
    // const interval$ = interval(1000);
    // const sub = interval$.subscribe(console.log);

    // setTimeout(() => sub.unsubscribe(), 5000);

    // const http$ = createHttpObservable('/api/courses');
    // const sub = http$.subscribe(console.log);

    // setTimeout(() => {
    //   sub.unsubscribe()
    // }, 10);

    // Subjects (both observable and observer)
    // const subject = new Subject(); // Normal subject. Only after subscription values are emitted
    const subject = new BehaviorSubject(0); // Default value as 0. Emits last value at subscription,  if subscribed after next but before completion
    // const subject = new AsyncSubject(); // Emits last value at subscription, even if subscribed after next after completion
    // const subject = new ReplaySubject(); // Emits all the values again, even if subscribed after next, and also after completion
    const series$ = subject.asObservable();
    subject.next(1);
    subject.next(2);
    subject.next(3);
    // subject.complete();

    series$.subscribe(console.log); // No values emitted, as already next has finished


  }
}
