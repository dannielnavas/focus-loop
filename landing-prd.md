# PRD: Landing Page — Focus Loop

## 1. Objetivo

Definir requisitos y alcance para una **landing page pública** que presente Focus Loop antes del login, comunique valor y dirija a registro/inicio de sesión, alineada con la aplicación actual y el diseño estilo Vercel.

---

## 2. Contexto del producto

### Qué es Focus Loop

- **Nombre:** Focus Loop
- **Descripción:** Aplicación de **gestión de tareas** y **timer Pomodoro** (Angular 20 + Electron).
- **Estado actual:** La ruta raíz (`''`) muestra directamente la pantalla de **Log in**; no existe página de presentación ni marketing.

### Funcionalidades actuales (a reflejar en la landing)

| Área | Funcionalidad |
|------|----------------|
| **Sprints** | Crear sprints (nombre, descripción, fechas, estado: planned / active / completed). Dashboard con tarjetas, progreso y contadores (Pending, In Progress, Completed). |
| **Board Kanban** | Tablero por sprint con columnas Pending, In Progress, Completed; drag-and-drop (CDK); crear tareas desde "Pending". |
| **Today / Work** | Vista "Today" con tareas del día; reordenar por drag-and-drop; marcar "Done" o eliminar. |
| **Timer Pomodoro** | Timer asociado a la tarea actual; play/pause; "Finish task"; navegación rápida desde/ hacia Work. |
| **Usuario** | Login (email/username + contraseña), perfil (imagen, nombre), configuración. |
| **UX** | Optimistic UI, notificaciones tipo toast, soporte dark mode, diseño minimalista (blanco/negro, bordes sutiles). |
| **Plataforma** | Desktop (Electron) y web (Angular build). |

### Rutas actuales

- Públicas: `''` → Login (dentro de `Layout`).
- Privadas: `private` (principal/dashboard), `private/board/:sprint_id`, `private/work`, `private/timer`, `private/profile` (y settings vía header/menú).

La landing debe convivir con este esquema (nueva ruta pública que no reemplace el login).

---

## 3. Objetivos de la landing

1. **Presentar el producto** antes del login: qué es Focus Loop y para qué sirve.
2. **Comunicar valor**: tareas + sprints + Pomodoro en una sola app, con foco y organización.
3. **Generar confianza**: aspecto profesional, alineado al diseño actual (estilo Vercel).
4. **Convertir**: CTA claros hacia **Sign in** / **Log in** (y si existe, **Sign up**).
5. **SEO y compartir**: título, descripción y estructura pensada para buscadores y enlaces.

---

## 4. Público objetivo

- Personas que necesitan **gestionar tareas** y **usar Pomodoro** en un solo lugar.
- Usuarios que trabajan por **sprints** o quieren organizar trabajo en bloques de tiempo.
- Preferencia por **apps minimalistas** y **desktop** (Electron) o web.

---

## 5. Estructura propuesta de la landing

Secciones sugeridas (orden y nombres ajustables):

1. **Hero**
   - Headline principal (ej. "Gestiona tareas y mantén el foco").
   - Subheadline que mencione sprints + Kanban + Pomodoro.
   - CTA principal: "Iniciar sesión" o "Empezar" (enlace al login).
   - CTA secundario opcional: "Ver cómo funciona" (anchor a Features).
   - Soporte visual: screenshot/mockup de la app (dashboard, board o timer).

2. **Problema / Valor (opcional)**
   - 1–2 frases: dispersión entre tareas, falta de foco, necesidad de sprints y tiempo delimitado.
   - Conectar con la solución: "Todo en un solo lugar".

3. **Features (Cómo funciona / Características)**
   - **Sprints:** Organiza tu trabajo en sprints con fechas y progreso.
   - **Kanban:** Tablero con columnas Pending, In Progress, Completed y drag-and-drop.
   - **Today:** Vista del día y tareas prioritarias.
   - **Pomodoro:** Timer integrado con la tarea en curso.
   - **Optimistic UI:** Cambios instantáneos y feedback claro.
   - **Desktop y Web:** Misma experiencia en escritorio y navegador.
   - **Dark mode:** Diseño cuidado en claro y oscuro.

4. **Planes y precios**
   - Sección con tres planes: **Free**, **Mensual** y **De por vida** (ver sección 12).
   - CTA por plan: "Empezar gratis" / "Elegir mensual" / "Comprar de por vida" (enlace a login o registro).
   - Diseño: tres columnas (o acordeón en móvil); plan recomendado resaltado (ej. De por vida).

5. **Social proof (opcional)**
   - Frase de testimonio, métrica simple ("X usuarios") o "Próximamente" si no hay datos.

6. **CTA final**
   - Repetición del CTA principal ("Iniciar sesión" / "Empezar") y enlace al login.

7. **Footer**
   - Enlaces: Login, (Registro si existe), posible enlace a repo o documentación.
   - Copyright / autor (ej. Danniel Navas, me@danniel.dev).

---

## 6. Contenido y mensajes clave

- **Tagline sugerido:** "Gestión de tareas y Pomodoro en un solo lugar" (o variante corta).
- **Palabras clave:** tareas, sprints, Kanban, Pomodoro, foco, productividad, desktop.
- **Tono:** Claro, directo, sin tecnicismos innecesarios; coherente con la UI minimalista.
- **Copy del hero:** Enfatizar "sprints + tablero Kanban + timer Pomodoro" y "para mantener el foco".

---

## 7. Diseño y estilo

### Referencia base: Vercel

- **Alineación con la app:** Seguir el [PRD de rediseño estilo Vercel](./PRD.md) y el plan en [PLAN_UI_VERCEL.md](./PLAN_UI_VERCEL.md):
  - Minimalismo, espacios en blanco, paleta monocromática (blanco/negro, grises).
  - Bordes sutiles (`border-gray-200` / `dark:border-gray-800`), `rounded-md` / `rounded-lg`, `shadow-sm` donde haga falta.
  - Transiciones cortas (`transition-all duration-200`), `focus:ring` claro.
  - Dark mode con `bg-black` y clases `dark:` consistentes.

### Referencias adicionales: sistemas llamativos, modernos y juveniles

Para dar a la **landing** una personalidad más llamativa y juvenil sin romper la coherencia con la app, se pueden tomar ideas de estos sistemas de diseño (elegir uno como dirección o mezclar elementos):

| Referencia | Qué tomar | Sensación |
|------------|-----------|-----------|
| **Linear** (linear.app) | Gradientes suaves (p. ej. violeta/azul o verde/cyan), fondos con blur, bordes muy redondeados (`rounded-2xl`), tipografía clara con un acento de color en CTAs y badges. | Moderno, premium, “startup”. |
| **Stripe** (stripe.com) | Gradientes en fondos de sección, duotono sutil, ilustraciones o formas geométricas de fondo, un color de acento fuerte (ej. azul Stripe) para botones y enlaces. | Profesional pero con carácter, confiable y vivo. |
| **Raycast** (raycast.com) | Contraste alto, un color de acento (p. ej. naranja/ámbar o verde), iconografía clara, cards con hover marcado y sombras suaves. | Rápido, directo, “power user” juvenil. |
| **Framer** (framer.com) | Tipografía grande y bold en el hero, gradientes en texto o fondos, bordes redondeados generosos (`rounded-3xl`), animaciones ligeras al scroll/hover. | Muy moderno, atrevido, juvenil. |
| **Vercel** (ya usado) | Estructura, espaciado y minimalismo como base; la landing puede mantener esta base y añadir **un solo** acento (color o gradiente) para destacar CTAs y títulos. | Limpio + un toque de personalidad. |

**Recomendación para Focus Loop:** Mantener la **base Vercel** (estructura, espaciado, dark mode) y añadir **un sistema de acento** inspirado en Linear o Raycast: un color principal (p. ej. violeta `#8B5CF6`, verde `#22C55E` o ámbar `#F59E0B`) para:

- Botones primarios y CTAs.
- Subrayados o fondos sutiles en headlines del hero.
- Badges o etiquetas (“Free”, “Más popular” en precios).
- Opcional: gradiente muy suave en el hero (fondo o texto) para dar sensación moderna y juvenil.

Así la landing se siente **llamativa y actual** sin alejarse del estilo de la app.

### Stack y detalle

- **Stack:** Mismo que la app: **Angular** (standalone), **Tailwind CSS**, sin librerías de componentes pesadas; reutilizar `app-ui-button`, `app-ui-card`, `app-ui-container` donde encaje.
- **Tipografía:** Geist o Inter como base; si se adopta una referencia más juvenil, considerar una display bold para títulos (ej. Clash Display, Satoshi o la misma Geist en pesos altos).
- **Responsive:** Mobile-first; la landing debe verse bien en móvil y desktop (navegación y CTAs).

---

## 8. Rutas y flujo

- **Nueva ruta sugerida:** `''` → **Landing** (página de presentación).
- **Login:** Mover a ruta dedicada, ej. `login` o `sign-in`, y enlazar desde la landing.
- **Flujo:** Usuario entra en `/` → ve landing → hace clic en "Iniciar sesión" / "Empezar" → va a `/login` → tras login correcto, redirección a `private` (o flujo actual).
- **Rutas actuales:** Mantener `private/*` y el resto; solo se añade la landing y se reubica el login en una ruta explícita.

---

## 9. Criterios de éxito

- La landing existe en la ruta raíz y carga correctamente (web y, si aplica, en Electron).
- Mensaje de valor (sprints + Kanban + Pomodoro) es claro en hero y/o features.
- **Sección de planes** visible con Free ($0), Mensual ($5,99/mes) y De por vida ($59), con CTAs por plan.
- Al menos un CTA visible lleva al login (y a registro si existe).
- Diseño coherente con la app (Tailwind, estilo Vercel, dark mode).
- Sin errores de consola ni de accesibilidad básica (contraste, focos).
- Título y meta description apropiados para SEO.

---

## 10. Alcance y no alcance

**In scope**

- Una página estática (o con mínimo estado) con las secciones anteriores, **incluida la sección de Planes y precios** (Free, Mensual, De por vida).
- Reutilización de componentes UI existentes y estilos globales.
- Cambio de rutas: `''` = landing, `/login` = login.
- Enlaces y CTAs al login (y registro si aplica) y CTAs por plan ("Empezar gratis", "Elegir mensual", "Comprar de por vida").

**Fuera de alcance (para este PRD)**

- Formulario de registro en la landing (solo enlaces si la funcionalidad ya existe).
- Lógica de cobro, pasarela de pago o aplicación de límites (Free vs pagos); eso corresponde al backend.
- A/B testing, analytics o tracking (se pueden añadir después).
- Cambios en la lógica de autenticación o en las rutas privadas.
- Contenido dinámico (blog, etc.) salvo que se defina en un PRD aparte.

---

## 11. Referencias en el código

- Rutas: `src/app/app.routes.ts`
- Login actual: `src/app/public/pages/login/`
- Layout: `src/app/shared/components/layout/`
- Componentes UI: `src/app/shared/components/ui/` (button, card, container, input, badge, skeleton)
- Estilos y diseño: `PRD.md`, `PLAN_UI_VERCEL.md`, `src/styles.css`
- Modelos de valor: Sprints (`core/models/sprint.model.ts`), Tasks (`core/models/task.model.ts`), Auth/User (`core/models/auth.model.ts`, `user.model.ts`)

---

## 12. Planes y precios

Sección obligatoria en la landing: tres planes con precios y límites claros. Los valores están alineados con una app de productividad indie (gestión de tareas + Pomodoro).

### Resumen

| Plan | Precio | Pago | Uso recomendado |
|------|--------|------|------------------|
| **Free** | $0 | — | Probar la app, uso ligero |
| **Mensual** | $5,99/mes | Recurrente | Uso continuo sin compromiso largo |
| **De por vida** | $59 (único) | Una vez | Uso ilimitado para siempre (~10 meses de mensual) |

### Plan Free — $0

- **Precio:** $0, sin tarjeta.
- **Límites sugeridos:**
  - Hasta **2 sprints** activos o en historial.
  - Hasta **30 tareas** en total (sumando todos los sprints).
  - Timer Pomodoro completo (sin límite de sesiones).
  - Todas las vistas: Kanban, Today, Timer, perfil básico.
- **Objetivo:** Que el usuario pruebe flujo completo y decida si paga.
- **CTA en landing:** "Empezar gratis".

### Plan Mensual — $5,99/mes

- **Precio:** $5,99 USD/mes (o equivalente en moneda local), facturación recurrente.
- **Incluye:**
  - Sprints **ilimitados**.
  - Tareas **ilimitadas**.
  - Timer Pomodoro completo.
  - Uso en web y desktop (Electron).
  - Dark mode y todas las funciones actuales.
  - Soporte por email (opcional).
- **Objetivo:** Usuarios que prefieren no comprometerse a largo plazo.
- **CTA en landing:** "Elegir mensual" o "Probar mensual".

### Plan De por vida — $59 (único)

- **Precio:** $59 USD un solo pago (sin renovación).
- **Incluye:** Lo mismo que el plan Mensual, de forma **permanente**.
- **Ventaja frente a mensual:** Equivalente a ~10 meses de suscripción; a partir del mes 11 el usuario "ahorra" respecto al mensual.
- **Objetivo:** Usuarios que quieren usar la app a largo plazo sin suscripción.
- **CTA en landing:** "Comprar de por vida" o "Lifetime — $59".

### Notas de implementación

- El backend ya expone `subscriptionPlan` en el usuario (`LoginResponse`); la landing solo muestra precios y CTAs; la lógica de límites (sprints/tareas en Free) y cobro corresponde al backend y/o pasarela de pago.
- En la landing, mostrar los tres planes en tabla o cards; opcionalmente destacar "De por vida" como "Mejor valor" o "Más popular".
- Si hay registro, el flujo puede ser: Clic en plan → registro/login → asignación del plan según elección o por defecto Free.
