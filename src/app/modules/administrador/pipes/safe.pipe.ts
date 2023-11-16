import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, type: string): SafeUrl {
    switch (type) {
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      default:
        return this.sanitizer.bypassSecurityTrustUrl(value);
    }
  }
}
