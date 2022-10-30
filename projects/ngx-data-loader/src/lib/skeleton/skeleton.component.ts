import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Component({
  selector: 'ngx-data-loader-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class SkeletonComponent implements OnInit {
  @Input() skeletonTemplate?: TemplateRef<unknown>;
  @Input() skeletonDelay = 0;
  showSkeleton$!: Observable<boolean>;

  constructor() {}

  ngOnInit(): void {
    this.showSkeleton$ = of(true).pipe(delay(this.skeletonDelay));
  }
}
