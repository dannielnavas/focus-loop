# PRD: Rediseño de Interfaz a "Estilo Vercel"

## 1. Objetivo Principal

Refactorizar la interfaz de usuario (UI) y la experiencia de usuario (UX) de la aplicación Angular existente para replicar el **lenguaje de diseño de Vercel**. El diseño debe ser:

- **Minimalista**
- Centrado en el desarrollador
- De alto contraste
- Utilizar **Tailwind CSS** como único motor de estilos

---

## 2. Pila Tecnológica

| Área       | Tecnología                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | Angular (moderno, preferiblemente Standalone Components)                   |
| Estilos    | Tailwind CSS                                                               |
| Iconos     | Lucide Icons o Radix Icons (comunes en el ecosistema Vercel)              |
| Tipografía | Geist (fuente oficial de Vercel) o Inter como alternativa                 |

---

## 3. Principios de Diseño Clave

Al generar o refactorizar el HTML/CSS, Cursor debe adherirse a los siguientes principios visuales:

### Minimalismo

- Uso extensivo de espacios en blanco (padding y margin generosos).

### Paleta de Colores Monocromática

- Fondos principalmente **blancos** (`bg-white`) o **negros** (`bg-black`) puros.
- Escala de grises de Tailwind para bordes y separadores:
  - Light: `border-gray-200`
  - Dark: `border-gray-800`

### Bordes y Sombras

- Bordes sutiles: `border`, `border-solid`.
- Radios de esquina pequeños/medianos: `rounded-md`, `rounded-lg`.
- Sombras muy sutiles:
  - Tarjetas: `shadow-sm`
  - Modales: `shadow-md`

### Estados Interactivos

- Botones y enlaces: transiciones rápidas (`transition-all duration-200`).
- Anillos de enfoque claros pero elegantes (`focus:ring`), usualmente negros o del color de acento principal.

### Modo Oscuro (Dark Mode)

- Soporte nativo y consistente.
- Fondo en modo oscuro: **`bg-black`** (no gris oscuro).
- Tarjetas: `bg-zinc-900` o `bg-[#111]`.

---

## 4. Tareas de Ejecución para Cursor

### Fase 1: Configuración Base (Tailwind y Tipografía)

- **Tailwind Config:** Actualizar `tailwind.config.js` para que la paleta neutra sea similar a `zinc` o `neutral`.
- **Fuentes:** Configurar la fuente principal a Geist, Inter o el sistema `sans-serif` por defecto.
- **Estilos globales:** Limpiar `styles.scss` o `styles.css` para depender enteramente de las clases de utilidad de Tailwind.

### Fase 2: Layout Principal (App Shell)

- **Navbar:** Barra de navegación superior minimalista.
  - Fondo transparente o blanco con borde inferior sutil: `border-b border-gray-200 dark:border-gray-800`.
  - Navegación limpia: enlaces en texto gris que pasan a negro/blanco al hacer hover.
- **Contenedor principal:** Centrado, ancho máximo: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

### Fase 3: Sistema de Componentes (Refactorización)

Reemplazar los estilos de los componentes Angular existentes con las siguientes especificaciones:

#### Botón Primario

- **Light:** `bg-black text-white hover:bg-gray-800`
- **Dark:** `dark:bg-white dark:text-black dark:hover:bg-gray-200`
- **Base:** `px-4 py-2 rounded-md font-medium text-sm transition-colors`

#### Botón Secundario / Outline

```
bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50
dark:border-gray-800 dark:text-gray-100 dark:hover:bg-gray-900
rounded-md px-4 py-2 text-sm transition-colors
```

#### Tarjetas (Cards)

```
bg-white dark:bg-black border border-gray-200 dark:border-gray-800
rounded-xl p-6 shadow-sm
```

#### Inputs de Texto

```
w-full bg-transparent border border-gray-300 dark:border-gray-700
rounded-md px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
transition-all
```

### Fase 4: Microinteracciones y Detalles

- Estados de carga: skeletons grises muy sutiles.
- Mensajes de error/éxito: tonos pastel o desaturados (ej. rojo oscuro para errores en fondo claro, no rojo brillante).

---

## 5. Instrucciones Estrictas para el LLM (Cursor)

1. **No utilices** bibliotecas de componentes externas (Angular Material, Bootstrap). Todo debe construirse con **Tailwind CSS crudo** sobre el HTML de los componentes Angular.

2. **Mantén la lógica** de los controladores Angular (`.ts`) intacta, salvo que un cambio en la estructura del HTML requiera ajustar un `@ViewChild` o una directiva.

3. **Utiliza** la directiva `@if` y `@for` (sintaxis moderna de control de flujo de Angular) al reescribir plantillas complejas.

4. **Asegúrate** de que cada componente tenga soporte para clases `dark:` de Tailwind.
