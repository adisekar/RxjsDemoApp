import { Observable } from "rxjs";

// creating our own http observable
export function createHttpObservable(url: string) {
    return Observable.create(observer => {

        // for cancelling an http
        const controller = new AbortController();
        const signal = controller.signal;

        fetch(url, { signal })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    observer.error(`Error occurrent with status ${response.status}`);
                }

            })
            .then(body => {
                observer.next(body);
                observer.complete();
            })
            .catch(err => {
                observer.error(err);
            })

        // returned value is cancellation fn, called during unsubscribe
        return () => controller.abort();
    });
}