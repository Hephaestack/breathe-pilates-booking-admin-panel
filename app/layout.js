import "./globals.css";

import LoadingProvider from "./components/LoadingProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <head>
        <title>Πίνακας Διαχείρισης Breathe Pilates</title>
        <meta name="Admin Panel" content="Πίνακας διαχείρισης για το σύστημα κρατήσεων Breathe Pilates" />
      </head>
      <body className="antialiased">
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}

