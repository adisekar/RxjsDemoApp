import { Component, OnInit } from '@angular/core';
import { Course } from "../model/course";
import { interval, Observable } from 'rxjs';
import { Store } from '../common/store.service';


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

    constructor(private store: Store) {

    }

    ngOnInit() {
        const courses$ = this.store.courses$;

        // Reactive pattern
        this.beginnerCourses$ = this.store.selectBeginnerCourses();

        this.advancedCourses$ = this.store.selectAdvancedCourses();
    }
}
