import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'ngx-data-loader-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  @Input() errorTemplate?: TemplateRef<unknown>;
  @Input() error?: Error | null;
  @Output() reload = new EventEmitter<void>();

  retry = () => this.reload.emit();

  constructor() {}

  ngOnInit(): void {}
}
