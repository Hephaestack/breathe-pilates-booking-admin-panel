import "./globals.css";

export const metadata = {
  title: "Breathe Pilates Admin Panel",
  description: "Admin panel for Breathe Pilates Booking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

