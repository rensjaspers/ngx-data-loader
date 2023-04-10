import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'ngx-data-loader-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent {
  @Input() loadedTemplate?: TemplateRef<unknown>;
  @Input() data!: unknown;
  @Input() loading!: boolean;
  @Input() showStaleData!: boolean;
}
