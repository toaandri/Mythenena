// Declaration for CSS module side-effect imports (e.g. `import './globals.css'`).
// Next.js handles these at build time; this file exists only to satisfy
// standalone `tsc --noEmit` runs outside the Next.js compiler.
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
