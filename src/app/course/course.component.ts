import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay, throttle, throttleTime, first, take
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, interval, forkJoin } from 'rxjs';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { debug, RxJsLoggingLevel, setRxJsLoggingLevel } from '../common/debug';
import { Store } from '../common/store.service';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    courseId: number;
    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>;


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute, private store: Store) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];
        // force completion of course$ using first or take
        this.course$ = this.store.selectCourseById(this.courseId)
            .pipe(
                // first()
                take(1)
            );

        this.loadLessons()
            .pipe(
                withLatestFrom(this.course$)
            )
            .subscribe(([lessons, course]) => {
                console.log("lessons", lessons);
                console.log("course", course);
            });

        // forkJoin(this.course$, this.lessons$)
        //     .subscribe(console.log);

        setRxJsLoggingLevel(RxJsLoggingLevel.DEBUG);

        // parallel http calls
        // forkJoin([this.course$, this.lessons$])
        //     .pipe(
        //         tap(([course, lessons]) => {
        //             console.log('course', course);
        //             console.log('lessons', lessons);
        //         })
        //     ).subscribe();
    }

    ngAfterViewInit() {


        this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map(evt => evt.target.value),
                startWith(''), // fire instantly to get list of empty courses
                // throttle(() => interval(500)), // test instead of debounce. Manual way to set time
                // throttleTime(500), // automatic way
                debug(RxJsLoggingLevel.TRACE, "search"),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(search => this.loadLessons(search)),
                debug(RxJsLoggingLevel.DEBUG, "lessons value"),
            );

        // same as above, but using concat
        // const searchLessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
        //     .pipe(
        //         map(evt => evt.target.value),
        //         debounceTime(400),
        //         distinctUntilChanged(),
        //         switchMap(search => this.loadLessons(search))
        //     );
        // // .subscribe(console.log);

        // const initialLessons$ = this.loadLessons();
        // this.lessons$ = concat(initialLessons$, searchLessons$);

    }

    loadLessons(search = ''): Observable<Lesson[]> {
        return createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
            .pipe(
                map(res => res["payload"])
            );
    }




}
