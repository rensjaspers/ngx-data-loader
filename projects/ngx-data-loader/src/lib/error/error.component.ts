import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'lib-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  @Input() errorTemplate?: TemplateRef<any>;
  @Input() error?: Error;
  @Output() reload = new EventEmitter<void>();

  reloadFn = () => this.reload.emit();

  constructor() {}

  ngOnInit(): void {}
}
