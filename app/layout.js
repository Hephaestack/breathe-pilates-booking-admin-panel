import "./globals.css";
import LoadingProvider from "./components/LoadingProvider";

export const metadata = {
  title: 'Πίνακας Διαχείρισης Breathe Pilates',
  description: 'Πίνακας διαχείρισης για το σύστημα κρατήσεων Breathe Pilates',
  icons: {
    icon: [{
      url: '/logo_pilates_admin.jpg',
      type: 'image/jpeg',
    }],
  },
}
export default function RootLayout({ children }) {
  return (
    <html lang="el">
      <body className="antialiased">
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}