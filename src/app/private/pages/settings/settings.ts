import { Component } from '@angular/core';
import { Header } from '@/shared/components/header/header';
import { UiCardComponent, UiContainerComponent } from '@/shared/components/ui';

@Component({
  selector: 'app-settings',
  imports: [Header, UiCardComponent, UiContainerComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {}
