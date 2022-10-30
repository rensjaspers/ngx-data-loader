import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'ngx-data-loader-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit {
  @Input() dataTemplate?: TemplateRef<unknown>;
  @Input() data!: any;
  @Input() loading!: boolean;
  @Input() showStaleData!: boolean;

  constructor() {}

  ngOnInit(): void {}
}
