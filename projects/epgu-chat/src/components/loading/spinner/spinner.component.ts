import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'arm-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent implements OnInit {

  constructor() { }

  @Input() config: { diameter: number; } = {
    diameter: 50,
  };

  public ngOnInit(): void {
  }

}
