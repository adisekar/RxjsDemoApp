import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { filter, map, tap } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

@Injectable({
    providedIn: 'root'
})
export class Store {
    private subject = new BehaviorSubject<Course[]>([]);

    courses$: Observable<Course[]> = this.subject.asObservable();

    init() {
        const http$ = createHttpObservable('/api/courses');

        http$
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
                map(res => Object.values(res['payload']))
                // shareReplay(), // Only 1 instance of http request, even though multiple subscriptions may happen
                // // catchError(err => of([])) // Recovery strategy, show empty list instead
                // retryWhen((err) => err.pipe(
                //     delayWhen(() => timer(2000))
                // ))
            )
            .subscribe(
                courses => this.subject.next(courses)
            );
    }

    selectBeginnerCourses() {
        return this.filterByCategory('BEGINNER');
    }

    selectAdvancedCourses() {
        return this.filterByCategory('ADVANCED');
    }

    selectCourseById(courseId: number) {
        return this.courses$
            .pipe(
                map(courses => courses.find(course => course.id == courseId)),
                filter(course => !!course)
            );
    }

    filterByCategory(category: string) {
        return this.courses$.pipe(
            map(courses => courses
                .filter(course => course.category == category))
        );
    }

    saveCourse(courseId: number, changes): Observable<any> {
        const courses = this.subject.getValue();

        const courseIndex = courses.findIndex(course => course.id == courseId);

        const newCourses = courses.slice(0);

        newCourses[courseIndex] = {
            ...courses[courseIndex],
            ...changes
        };
        // In memory modification
        this.subject.next(newCourses);

        // request to backend
        return fromPromise(fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: {
                'content-type': 'application/json'
            }
        }));
    }
}
