import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherClipboard } from '@ng-icons/feather-icons';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  filter,
  map,
  distinctUntilChanged,
  switchMap,
  catchError,
  startWith,
} from 'rxjs';
import { GetThumbsEvent } from './models';
import { parseUrl, getThumbs } from './util';
import { ErrorComponent } from './ui/error/error.component';

@Component({
  standalone: true,
  selector: 'mr-root',
  templateUrl: './app.component.html',
  providers: [provideIcons({ featherClipboard })],
  imports: [
    NgOptimizedImage,
    NgIconComponent,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    AsyncPipe,
    ErrorComponent,
  ],
})
export class AppComponent {
  formGroup = this.buildForm();
  thumbsEvent$ = this.buildThumbsEvents();

  onClickPaste() {
    navigator.clipboard.readText().then(
      result => this.formGroup.patchValue({ url: result }),
      () => console.log('Too bad...'),
    );
  }

  private buildForm() {
    const formBuilder = inject(FormBuilder);
    return formBuilder.nonNullable.group({ url: '' });
  }

  private buildThumbsEvents() {
    return this.formGroup.controls.url.valueChanges.pipe(
      filter(value => !!value),
      map(parseUrl),
      distinctUntilChanged(),
      switchMap(getThumbs),
      catchError(err => this.handleValueChangesError(err)),
    );
  }

  private handleValueChangesError(err: Error): Observable<GetThumbsEvent> {
    const errorEvent: GetThumbsEvent = { type: 'error', errorMessage: err.message };
    return this.buildThumbsEvents().pipe(startWith(errorEvent));
  }
}
