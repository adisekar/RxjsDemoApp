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
    concatAll, shareReplay, throttle, throttleTime
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, interval, forkJoin } from 'rxjs';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { debug, RxJsLoggingLevel, setRxJsLoggingLevel } from '../common/debug';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    courseId: string;
    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>;


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];
        this.course$ = createHttpObservable(`/api/courses/${this.courseId}`)
            .pipe(
                debug(RxJsLoggingLevel.INFO, "course value"),
            );

        this.lessons$ = this.loadLessons();

        setRxJsLoggingLevel(RxJsLoggingLevel.DEBUG);

        // parallel http calls
        forkJoin([this.course$, this.lessons$])
            .pipe(
                tap(([course, lessons]) => {
                    console.log('course', course);
                    console.log('lessons', lessons);
                })
            ).subscribe();
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
