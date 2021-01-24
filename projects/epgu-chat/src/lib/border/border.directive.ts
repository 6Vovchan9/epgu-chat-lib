import {Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[tlBorder]'
})
export class BorderDirective implements OnInit {
  private element$: HTMLElement;

  constructor(private elementRef$: ElementRef) {
    this.element$ = elementRef$.nativeElement;
  }

  ngOnInit() {
    this.element$.style.border = 'solid 1px red';
  }
}
