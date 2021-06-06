import { Component, OnInit } from '@angular/core';
import { Course } from "../model/course";
import { interval, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delayWhen, finalize, map, retryWhen, shareReplay, tap } from 'rxjs/operators';
import { noop } from 'rxjs';
import { createHttpObservable } from '../common/util';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    // beginnerCourses: Course[];
    // advancedCourses: Course[];

    beginnerCourses$: Observable<Course[]>;
    advancedCourses$: Observable<Course[]>;

    constructor() {

    }

    ngOnInit() {
        const http$ = createHttpObservable('/api/courses');

        const courses$: Observable<Course[]> = http$
            .pipe(
                // execute catchError and finalize only once by adding on top
                // Handle error strategy and rethrow
                // catchError(err => {
                //     console.log("Error Occurred", err);
                //     return throwError(err);
                // }),
                // finalize(() => {
                //     console.log("Finalize executed");
                // }),
                tap(() => console.log('HTTP request executed')),
                map(res => Object.values(res['payload'])),
                shareReplay(), // Only 1 instance of http request, even though multiple subscriptions may happen
                // catchError(err => of([])) // Recovery strategy, show empty list instead
                retryWhen((err) => err.pipe(
                    delayWhen(() => timer(2000))
                ))
            );

        // http$.subscribe(
        //     courses => console.log(courses),
        //     noop,
        //     () => console.log('completed')
        // );

        // Reactive pattern
        this.beginnerCourses$ = courses$.pipe(
            map(courses => courses
                .filter(course => course.category == 'BEGINNER'))
        );

        this.advancedCourses$ = courses$.pipe(
            map(courses => courses
                .filter(course => course.category == 'ADVANCED'))
        );

        // courses$.subscribe(
        //     courses => {
        //         // Not a good solution, to add logic inside subscribe call. Imperative design
        //         // this.beginnerCourses = courses
        //         //     .filter(course => course.category == 'BEGINNER');
        //         // this.advancedCourses = courses
        //         //     .filter(course => course.category == 'ADVANCED');
        //     },
        //     noop,
        //     () => console.log('completed')
        // );
    }
}
