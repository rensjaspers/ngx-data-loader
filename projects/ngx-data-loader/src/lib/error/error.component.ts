import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'ngx-data-loader-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent {
  @Input() errorTemplate?: TemplateRef<unknown>;
  @Input() error?: Error | null;
  @Output() reload = new EventEmitter<void>();

  retry = () => this.reload.emit();
}
