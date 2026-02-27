import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiContainerComponent } from '@/shared/components/ui';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, UiContainerComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
