# Plan de Adaptación de Next.js a React Native

Este documento detalla los pasos para adaptar el proyecto web actual (Next.js) a una aplicación móvil nativa usando React Native.

---

### Fase 0: Configuración del Nuevo Proyecto

- [ ] **1. Crear el Proyecto:**
  - [ ] Usar `npx react-native init miMercadoVeNative` para crear la estructura del proyecto en una nueva carpeta.

- [ ] **2. Instalar Dependencias:**
  - [ ] Analizar `package.json` del proyecto web.
  - [ ] Instalar dependencias de lógica de negocio compatibles (ej. `big.js`, `zod`, `date-fns`, `luxon`).
  - [ ] Instalar dependencias clave del ecosistema de React Native:
    - [ ] Navegación: `@react-navigation/native`, `@react-navigation/stack`, etc.
    - [ ] Otras utilidades que sean necesarias.

- [ ] **3. Configurar TypeScript:**
  - [ ] Asegurarse de que el nuevo proyecto `miMercadoVeNative` tiene un `tsconfig.json` y está listo para usar TypeScript.

---

### Fase 1: Migración de la Lógica de Negocio

- [ ] **1. Copiar Lógica Central:**
  - [ ] Crear directorios `src/lib` y `src/hooks` en el nuevo proyecto.
  - [ ] Copiar los archivos de `src/lib` y `src/hooks` del proyecto original a las nuevas carpetas.

- [ ] **2. Adaptar y Verificar:**
  - [ ] Revisar los hooks y utilidades copiados para detectar APIs específicas del navegador (como `window`, `document`, etc.).
  - [ ] Adaptar o eliminar el código que no sea compatible con el entorno de React Native.

---

### Fase 2: Reconstrucción de la Interfaz de Usuario (UI)

- [ ] **1. Recrear Componentes de UI Base (`/src/components/ui`):**
  - [ ] Crear una carpeta `src/components/ui` en el nuevo proyecto.
  - [ ] Para cada componente (Button, Card, Input, etc.):
    - [ ] Leer el componente de Next.js.
    - [ ] Crear el archivo `.tsx` equivalente en React Native.
    - [ ] Reemplazar etiquetas HTML con componentes de React Native (`View`, `Text`, `TouchableOpacity`).
    - [ ] Traducir estilos de Tailwind/CSS a objetos `StyleSheet` de React Native.

- [ ] **2. Reconstruir Pantallas y Componentes Compuestos:**
  - [ ] Empezar con una pantalla principal, como `CalculatorScreen`.
  - [ ] Crear el archivo de la pantalla en `src/screens`.
  - [ ] Ensamblar la pantalla usando los componentes de UI base ya creados.
  - [ ] Conectar la pantalla a la lógica de negocio (hooks y estado).
  - [ ] Repetir para todas las demás pantallas y componentes.

---

### Fase 3: Implementación de la Navegación

- [ ] **1. Configurar el Navegador Principal:**
  - [ ] Crear un archivo `src/navigation/AppNavigator.tsx`.
  - [ ] Usar `React Navigation` para configurar un navegador (ej. Stack Navigator o Tab Navigator).

- [ ] **2. Definir Rutas y Pantallas:**
  - [ ] Registrar todas las pantallas creadas en el navegador.
  - [ ] Implementar la lógica de navegación entre pantallas (ej. al presionar un botón).

---
