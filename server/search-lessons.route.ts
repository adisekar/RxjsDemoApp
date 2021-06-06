import { Request, Response } from 'express';
import { LESSONS } from "./db-data";
import { setTimeout } from "timers";



export function searchLessons(req: Request, res: Response) {

    const queryParams = req.query;
    let pageNumberStr = queryParams.pageNumber && queryParams.pageNumber.toString();
    let pageSizeStr = queryParams.pageSize.toString();

    const courseId = queryParams.courseId,
        filter = queryParams.filter || '',
        sortOrder = queryParams.sortOrder || 'asc',
        pageNumber = parseInt(pageNumberStr) || 0,
        pageSize = parseInt(pageSizeStr) || 3;

    const courseIdNum = parseInt(courseId.toString());

    let lessons = Object.values(LESSONS).filter(lesson => lesson.courseId == courseIdNum).sort((l1, l2) => l1.id - l2.id);

    if (filter) {
        lessons = lessons.filter(lesson => lesson.description.trim().toLowerCase().search(filter.toString().toLowerCase()) >= 0);
    }

    if (sortOrder == "desc") {
        lessons = lessons.reverse();
    }

    const initialPos = pageNumber * pageSize;

    const lessonsPage = lessons.slice(initialPos, initialPos + pageSize);

    setTimeout(() => {
        res.status(200).json({ payload: lessonsPage });
    }, 1000);


}