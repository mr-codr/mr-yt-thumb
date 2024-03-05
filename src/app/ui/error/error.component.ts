import { Component, Input } from '@angular/core';

@Component({
  selector: 'mr-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  standalone: true,
  imports: [],
})
export class ErrorComponent {
  @Input({ required: true }) message!: string;
}
