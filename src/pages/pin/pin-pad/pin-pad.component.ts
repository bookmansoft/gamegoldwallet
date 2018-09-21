import { Component, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export interface PinButton {
  value: string;
  letters: string;
}

@Component({
  selector: 'pin-pad',
  template: `
    <ion-row *ngFor="let row of buttonRows">
      <ion-col *ngFor="let button of row" (click)="onKeystroke(button.value)" tappable>
        <div>
          <span *ngIf="button.value !== 'delete'">{{button.value}}</span>
          <img *ngIf="button.value === 'delete'" src="assets/img/tail-left.svg">
        </div>
        <div class="letters">{{button.letters}}</div>
      </ion-col>
    </ion-row>
  `
})
export class PinPad {
  keystrokeSubject: Subject<string> = new Subject<string>();
  @Output()
  keystroke: Observable<string> = this.keystrokeSubject.asObservable();
  public buttonRows: PinButton[][] = [
    [
      {
        value: '1',
        letters: ''
      },
      {
        value: '2',
        letters: 'ABC'
      },
      {
        value: '3',
        letters: 'DEF'
      }
    ],
    [
      {
        value: '4',
        letters: 'GHI'
      },
      {
        value: '5',
        letters: 'JKL'
      },
      {
        value: '6',
        letters: 'MNO'
      }
    ],
    [
      {
        value: '7',
        letters: 'PQRS'
      },
      {
        value: '8',
        letters: 'TUV'
      },
      {
        value: '9',
        letters: 'WXYZ'
      }
    ],
    [
      {
        value: '',
        letters: ''
      },
      {
        value: '0',
        letters: ''
      },
      {
        value: 'delete',
        letters: ''
      }
    ]
  ];

  public onKeystroke(value: string): void {
    this.keystrokeSubject.next(value);
  }
}
