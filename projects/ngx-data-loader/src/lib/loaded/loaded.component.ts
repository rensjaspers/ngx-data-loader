import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'ngx-data-loader-loaded',
  templateUrl: './loaded.component.html',
  styleUrls: ['./loaded.component.scss'],
})
export class LoadedComponent {
  @Input() loadedTemplate?: TemplateRef<unknown>;
  @Input() data!: unknown;
  @Input() loading!: boolean;
  @Input() showStaleData!: boolean;
}
