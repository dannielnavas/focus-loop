import { Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected title = 'my-tracker';
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  private readonly onElectronNavigate = (event: Event): void => {
    const path = (event as CustomEvent<string>).detail;
    if (!path) return;
    void this.zone.run(() => void this.router.navigateByUrl(path));
  };

  ngOnInit(): void {
    window.addEventListener('electron-navigate', this.onElectronNavigate);
  }

  ngOnDestroy(): void {
    window.removeEventListener('electron-navigate', this.onElectronNavigate);
  }
}
