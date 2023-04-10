import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Component({
  selector: 'ngx-data-loader-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @Input() loadingTemplate?: TemplateRef<unknown>;
  @Input() loadingTemplateDelay = 0;
  showTemplate$!: Observable<boolean>;

  ngOnInit(): void {
    this.showTemplate$ = of(true).pipe(delay(this.loadingTemplateDelay));
  }
}
