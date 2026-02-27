# Plan de ejecución: Rediseño UI estilo Vercel

Plan alineado con [PRD.md](./PRD.md) para refactorizar la interfaz a un lenguaje minimalista, alto contraste y Tailwind-only.

---

## Resumen de principios (PRD)

| Principio | Aplicación |
|-----------|------------|
| **Minimalismo** | Espacios en blanco generosos, sin elementos decorativos innecesarios |
| **Paleta** | Fondos `bg-white` / `bg-black`; bordes `border-gray-200` (light) / `border-gray-800` (dark) |
| **Bordes/sombras** | `border`, `rounded-md`/`rounded-lg`, `shadow-sm` (cards), `shadow-md` (modales) |
| **Interacción** | `transition-all duration-200`, `focus:ring` negro/blanco según tema |
| **Dark mode** | Fondo `bg-black`; tarjetas `bg-zinc-900` o `bg-[#111]` |

---

## Fase 1: Configuración base (Tailwind y tipografía)

- [ ] **Tailwind**
  - En Tailwind v4: usar `@theme` en `src/styles.css` para paleta neutra tipo `zinc`/`neutral` si se desea sobrescribir.
  - Asegurar que `dark` esté por clase en el `<html>` (ej. `class="dark"`) para `dark:`.
- [ ] **Fuentes**
  - Fuente principal: **Geist** (Vercel) o **Inter** (alternativa).
  - Cargar en `index.html` (Google Fonts o npm) y definir en estilos globales.
- [ ] **Estilos globales** (`src/styles.css`)
  - Eliminar colores/backgrounds fijos que no vengan de Tailwind.
  - Base: `bg-white text-gray-900 dark:bg-black dark:text-gray-100`, tipografía y variables mínimas.
  - Scrollbar opcional con tonos grises acorde al PRD.

**Entregables:** `styles.css` actualizado, `index.html` con fuente, documentación de uso de `dark`.

---

## Fase 2: Layout principal (App Shell)

- [ ] **Navbar**
  - Fondo: transparente o blanco con borde inferior `border-b border-gray-200 dark:border-gray-800`.
  - Enlaces: texto gris → negro (light) / blanco (dark) en hover.
  - Refactorizar `header` existente para usar estas clases y componentes del UI Kit.
- [ ] **Contenedor principal**
  - Clase estándar: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  - Crear componente o directiva reutilizable **Container** (opcional) o usar la clase en layout.

**Entregables:** Navbar y contenedor alineados al PRD; header usando Button/estilos del kit.

---

## Fase 3: Sistema de componentes (UI Kit)

Componentes **standalone**, solo Tailwind, sin librerías externas. Todos con soporte `dark:`.

### 3.1 Button

| Variante | Clases (resumen PRD) |
|----------|----------------------|
| **Primary** | `bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200` + `px-4 py-2 rounded-md font-medium text-sm transition-colors` |
| **Secondary / Outline** | `bg-transparent border border-gray-200 dark:border-gray-800` + `text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900` + `rounded-md px-4 py-2 text-sm transition-colors` |

- Inputs: `variant`, `size` (opcional), `disabled`, `type="button"|"submit"`.
- Focus: `focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white`.

### 3.2 Card

- Base: `bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm`.
- Variantes opcionales: padding reducido, sin borde (solo sombra).
- Slot para header/título y contenido (proyección de contenido).

### 3.3 Input (texto)

- Clases: `w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm`.
- Focus: `focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all`.
- Compatible con `formControlName` / reactive forms y `label` opcional.

### 3.4 Otros componentes útiles

- **Badge**: pequeño, gris/neutro para estados (ej. “Pending”, “Active”).
- **Skeleton**: rectángulos con `animate-pulse`, grises sutiles para estados de carga.
- **Container**: wrapper con `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

**Entregables:** Componentes en `src/app/shared/components/ui/` (button, card, input, badge, skeleton, container), cada uno con `.ts`, `.html` y estilos inline/Tailwind.

### Ubicación y uso del UI Kit (implementado)

- **Ruta:** `src/app/shared/components/ui/`
- **Barrel:** `import { UiButtonComponent, UiCardComponent, ... } from '@/shared/components/ui';`

| Componente | Selector | Uso rápido |
|------------|----------|-------------|
| Button | `app-ui-button` | `variant="primary" \| "secondary" \| "outline" \| "ghost"`, `size="sm" \| "md" \| "lg"` |
| Card | `app-ui-card` | `variant="default" \| "elevated" \| "bordered"`, `padding="none" \| "sm" \| "md" \| "lg"` |
| Input | `app-ui-input` | Compatible con `formControlName` y `[(value)]`; `label`, `hint`, `error` |
| Badge | `app-ui-badge` | `variant="neutral" \| "success" \| "warning" \| "error"` |
| Skeleton | `app-ui-skeleton` | `variant="text" \| "circular" \| "rectangular"`, `width`, `height` |
| Container | `app-ui-container` | Contenedor `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |

---

## Fase 4: Microinteracciones y detalles

- [ ] **Estados de carga**: usar **Skeleton** en listas y cards.
- [ ] **Mensajes error/éxito**: tonos desaturados (ej. rojo oscuro en light, no rojo brillante); clases reutilizables para toasts/alertas.
- [ ] Revisar transiciones en botones y enlaces (`duration-200`).
- [ ] Revisar focus visible en todos los controles.

**Entregables:** Patrones de skeleton y mensajes documentados; ajustes en notificaciones existentes.

---

## Orden de implementación sugerido

1. Fase 1 (config + estilos globales).
2. UI Kit: Button → Card → Input → Badge → Skeleton → Container.
3. Fase 2: aplicar Container y refactorizar Navbar/Header usando Button y estilos del kit.
4. Sustituir en el resto de la app los estilos antiguos por el UI Kit y clases del PRD.
5. Fase 4: skeletons y mensajes.

---

## Colores de referencia (PRD)

| Uso | Light | Dark |
|-----|--------|------|
| Fondo principal | `bg-white` | `bg-black` |
| Fondo cards | `bg-white` | `bg-black` o `bg-zinc-900` / `bg-[#111]` |
| Bordes | `border-gray-200` | `border-gray-800` |
| Texto principal | `text-gray-900` | `text-gray-100` |
| Texto secundario | `text-gray-600` | `text-gray-400` |
| Input border | `border-gray-300` | `border-gray-700` |
| Focus ring | `focus:ring-black` | `focus:ring-white` |
| Botón primario | `bg-black text-white` | `bg-white text-black` |
| Hover primario | `hover:bg-gray-800` | `dark:hover:bg-gray-200` |
| Hover secundario | `hover:bg-gray-50` | `dark:hover:bg-gray-900` |

---

## Instrucciones para el LLM (recordatorio PRD)

- No usar Angular Material, Bootstrap ni otras librerías de componentes; solo Tailwind sobre HTML.
- Mantener la lógica de los `.ts` intacta; solo ajustar si cambia estructura (p. ej. `@ViewChild`).
- Usar `@if`, `@for` y control flow moderno en plantillas.
- Cada componente debe soportar clases `dark:` de Tailwind.
