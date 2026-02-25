---
name: angular-21
description: Guía completa de Angular 21 con signals, control flow moderno, componentes standalone, zoneless change detection, SSR con hydration incremental, routing funcional, formularios reactivos, HTTP Client moderno y testing. Usar cuando el usuario trabaje con Angular, cree componentes, servicios, rutas, formularios, peticiones HTTP o pregunte sobre mejores prácticas de Angular.
---

# Angular 21

## Principios clave

- Standalone es el **default** — nunca uses NgModules a menos que sea legado.
- Signals son la API reactiva primaria — prefiere `signal`, `computed`, `effect` sobre observables donde sea posible.
- Control flow moderno: usa `@if`, `@for`, `@switch`, `@defer` en templates.
- Zoneless change detection es estable — configúralo en proyectos nuevos.
- rsResource para realizar las peticiones fetch por defecto en el caso que cargue la informacion al inicio

---

## Componentes

```typescript
@Component({
  selector: "app-example",
  standalone: true,
  imports: [CommonModule],
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  // Signals de entrada/salida
  title = input<string>("default"); // reemplaza @Input
  count = input.required<number>(); // input obligatorio
  valueChange = output<string>(); // reemplaza @EventEmitter
  value = model<string>(""); // two-way binding con signal

  // Estado interno
  items = signal<string[]>([]);
  total = computed(() => this.items().length);

  // Efectos secundarios
  private logEffect = effect(() => {
    console.log("items changed:", this.items());
  });

  // ViewChild como signal (Angular 19+)
  inputRef = viewChild<ElementRef>("inputEl");
}
```

### Mutations de signals

```typescript
// Establecer valor
this.items.set(["a", "b"]);

// Mutar basado en valor actual
this.items.update((prev) => [...prev, "c"]);
```

---

## Control Flow moderno

```html
<!-- @if / @else if / @else -->
@if (user()) {
<p>Hola {{ user()!.name }}</p>
} @else {
<p>No hay usuario</p>
}

<!-- @for con track obligatorio -->
@for (item of items(); track item.id) {
<li>{{ item.name }}</li>
} @empty {
<li>Sin elementos</li>
}

<!-- @switch -->
@switch (status()) { @case ('active') { <span>Activo</span> } @case ('inactive') {
<span>Inactivo</span> } @default { <span>Desconocido</span> } }

<!-- @defer: carga diferida -->
@defer (on viewport) {
<heavy-component />
} @placeholder {
<p>Cargando...</p>
} @loading (minimum 500ms) {
<spinner />
} @error {
<p>Error al cargar</p>
}
```

---

## Configuración de la aplicación

```typescript
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    // Zoneless change detection
    provideZonelessChangeDetection(),
  ],
});
```

---

## Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
];

// Guarda funcional
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

// withComponentInputBinding: los route params llegan como @Input / input()
@Component({ ... })
export class ProductComponent {
  id = input<string>();  // se mapea automáticamente desde :id en la ruta
}
```

---

## Servicios e inyección de dependencias

```typescript
@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);
  private users = signal<User[]>([]);

  readonly users$ = this.users.asReadonly();

  getUsers() {
    return this.http
      .get<User[]>("/api/users")
      .pipe(tap((users) => this.users.set(users)));
  }
}

// inject() fuera del constructor (en funciones, guardas, etc.)
const service = inject(UserService);
```

---

## HTTP Client

```typescript
// Interceptor funcional
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
};

// Uso en componente
private http = inject(HttpClient);

data = toSignal(
  this.http.get<Item[]>('/api/items'),
  { initialValue: [] }
);
```

---

## Formularios reactivos

```typescript
@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      @if (form.get("email")?.invalid && form.get("email")?.touched) {
        <span>Email inválido</span>
      }
      <button type="submit" [disabled]="form.invalid">Enviar</button>
    </form>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
    }
  }
}
```

---

## Interoperabilidad Signals ↔ RxJS

```typescript
import { toSignal, toObservable } from "@angular/core/rxjs-interop";

// Observable → Signal
data = toSignal(this.http.get<Item[]>("/api/items"), { initialValue: [] });

// Signal → Observable
count$ = toObservable(this.count);
```

---

## SSR e Hydration incremental

```typescript
// app.config.ts (SSR)
export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withIncrementalHydration()),
    provideRouter(routes),
  ],
};
```

```html
<!-- Hidratar solo cuando el componente entra en viewport -->
@defer (hydrate on viewport) {
<analytics-widget />
}
```

---

## Testing

```typescript
// Configuración de TestBed con standalone
describe("ExampleComponent", () => {
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isLoggedIn: signal(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleComponent);
    fixture.detectChanges();
  });

  it("should render title", () => {
    const el = fixture.nativeElement.querySelector("h1");
    expect(el.textContent).toContain("Expected Title");
  });

  it("should update on signal change", () => {
    fixture.componentRef.setInput("count", 5);
    fixture.detectChanges();
    expect(fixture.componentInstance.total()).toBe(5);
  });
});
```

---

## Patrones comunes

### Estado compartido con signals

```typescript
@Injectable({ providedIn: "root" })
export class CartStore {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  add(item: CartItem) {
    this._items.update((prev) => [...prev, item]);
  }

  remove(id: string) {
    this._items.update((prev) => prev.filter((i) => i.id !== id));
  }
}
```

### Carga con estado de loading/error

```typescript
export class DataComponent {
  private svc = inject(DataService);

  protected vm = toSignal(
    this.svc.getData().pipe(
      map((data) => ({ data, loading: false, error: null })),
      startWith({ data: null, loading: true, error: null }),
      catchError((err) => of({ data: null, loading: false, error: err.message })),
    ),
  );
}
```

---

## Anti-patrones a evitar

| Evitar                                          | Usar en su lugar                      |
| ----------------------------------------------- | ------------------------------------- |
| `NgModules` en código nuevo                     | Standalone components                 |
| `*ngIf`, `*ngFor`                               | `@if`, `@for`                         |
| `@Input()` / `@Output()`                        | `input()` / `output()` / `model()`    |
| `constructor(private svc: Service)`             | `svc = inject(Service)`               |
| `ngOnChanges` para reaccionar a inputs          | `effect(() => { this.myInput(); })`   |
| `ChangeDetectorRef.detectChanges()`             | Signals + zoneless                    |
| Subscriptions manuales sin `takeUntilDestroyed` | `takeUntilDestroyed(this.destroyRef)` |

---

## Recursos adicionales

- Para patrones avanzados de signals y estado, ver [reference.md](reference.md)
