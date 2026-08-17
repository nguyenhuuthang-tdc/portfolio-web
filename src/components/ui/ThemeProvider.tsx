"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    /*
     * next-themes injects a blocking <script> for FOUC prevention.
     * React warns about script tags in components — this is expected
     * and harmless. suppressHydrationWarning on the wrapper silences
     * the child-level mismatch that stems from theme detection.
     */
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
