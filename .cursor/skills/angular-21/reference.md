# Angular 21 — Referencia Avanzada

## Signals avanzados

### linkedSignal (Angular 19+)
Crea un signal derivado que puede ser sobreescrito manualmente:

```typescript
options = signal(['A', 'B', 'C']);
selected = linkedSignal(() => this.options()[0]); // se resetea si options cambia

// El usuario puede sobreescribir
this.selected.set('B');
```

### resource() — carga asíncrona reactiva (Angular 19+)

```typescript
userId = signal(1);

userResource = resource({
  request: () => ({ id: this.userId() }),
  loader: ({ request }) =>
    fetch(`/api/users/${request.id}`).then(r => r.json()),
});

// Propiedades: .value(), .isLoading(), .error(), .reload()
```

### rxResource() — variante con Observable

```typescript
userResource = rxResource({
  request: () => this.userId(),
  loader: ({ request }) => this.http.get<User>(`/api/users/${request}`),
});
```

---

## takeUntilDestroyed

```typescript
export class MyComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    interval(1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => this.count.set(val));
  }
}
```

---

## afterRender / afterNextRender

```typescript
export class ChartComponent {
  private chartRef = viewChild<ElementRef>('canvas');

  constructor() {
    afterNextRender(() => {
      // Se ejecuta UNA VEZ después del primer render (solo cliente)
      initChart(this.chartRef()!.nativeElement);
    });
  }
}
```

---

## Pipes personalizados

```typescript
@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 100): string {
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }
}
```

---

## Directivas standalone

```typescript
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  color = input<string>('yellow');
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      this.renderer.setStyle(this.el.nativeElement, 'background', this.color());
    });
  }
}
```

---

## Carga diferida avanzada con @defer

```html
<!-- Disparadores disponibles -->
@defer (on idle) { ... }                      <!-- cuando el browser está inactivo -->
@defer (on viewport) { ... }                  <!-- al entrar en viewport -->
@defer (on interaction) { ... }               <!-- al hacer click/focus -->
@defer (on hover) { ... }                     <!-- al hacer hover -->
@defer (on timer(2s)) { ... }                 <!-- después de 2 segundos -->
@defer (when isLoggedIn()) { ... }            <!-- cuando la condición es true -->
@defer (on viewport; prefetch on idle) { ... } <!-- cargar en viewport, prefetch en idle -->
```

---

## Configuración de Zone.js (zoneless)

```typescript
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
  ],
});
```

```json
// angular.json — elimina zone.js del polyfills
{
  "polyfills": []
}
```

Con zoneless, el change detection se activa solo cuando:
- Un signal cambia
- Se llama `markForCheck()` manualmente
- Se resuelve una promesa/observable vinculado a signals

---

## Señales de consulta (Query Signals)

```typescript
// Antes (decorator)
@ViewChild('input') inputRef!: ElementRef;
@ViewChildren(ItemComponent) items!: QueryList<ItemComponent>;
@ContentChild(SlotDirective) slot?: SlotDirective;

// Ahora (signals)
inputRef = viewChild<ElementRef>('input');
inputRefRequired = viewChild.required<ElementRef>('input');
items = viewChildren(ItemComponent);
slot = contentChild(SlotDirective);
slots = contentChildren(SlotDirective);
```
