# Paleta Dark Mode (slate #0f172a)

Colores que encajan con el fondo principal **#0f172a** (slate-900). Definidos en `src/styles.css` vía `@theme` para poder cambiarlos en un solo lugar.

## Fondos

| Variable / Clase | Hex | Uso |
|------------------|-----|-----|
| `dark` / `bg-dark` | `#0f172a` | Fondo principal (body, pantallas) |
| `dark-elevated` / `bg-dark-elevated` | `#1e293b` | Cards, modales, columnas |

## Texto

| Variable / Clase | Hex | Uso |
|------------------|-----|-----|
| `dark-text` / `text-dark-text` | `#f1f5f9` | Texto principal |
| `dark-text-muted` / `text-dark-text-muted` | `#94a3b8` | Texto secundario, hints |

## Bordes

| Variable / Clase | Hex | Uso |
|------------------|-----|-----|
| `dark-border` / `border-dark-border` | `#334155` | Bordes por defecto |
| `dark-border-hover` / `border-dark-border-hover` | `#475569` | Bordes en hover |

## Acento (links, acciones destacadas)

| Variable / Clase | Hex | Uso |
|------------------|-----|-----|
| `dark-accent` / `bg-dark-accent` `text-dark-accent` | `#818cf8` | Acento principal (indigo) |
| `dark-accent-hover` / `bg-dark-accent-hover` | `#6366f1` | Hover del acento |

## Semánticos (mensajes, estados)

| Variable / Clase | Hex | Uso |
|------------------|-----|-----|
| `dark-success` | `#34d399` | Éxito (emerald-400) |
| `dark-warning` | `#fbbf24` | Advertencia (amber-400) |
| `dark-error` | `#f87171` | Error (red-400) |

## Uso en componentes

- **Botón:** variante `accent` usa el acento en dark (`dark:bg-dark-accent`).
- **Botones** `outline` y `ghost` usan `dark:border-dark-border` y `dark:text-dark-text` / `dark:text-dark-text-muted`.
- **Cards:** borde `dark:border-dark-border`.
- **Header:** borde inferior `dark:border-dark-border`.

Para cambiar el tono global (más azul, más neutro, etc.), edita los hex en el bloque `@theme` de `src/styles.css`.
