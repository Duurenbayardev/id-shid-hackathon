import "./globals.css";
import { ReactNode } from "react";
import dotenv from 'dotenv';

dotenv.config();
export const metadata = {
  title: "Ид Шид",
  description: "Eat Throw will experience your wildest dreams.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  
  return (
    <html lang="en" style={{ margin: 0, padding: 0, height: '100%' }}>
      <body
        className="bg-black"
        style={{
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          height: '100vh',
          width: '100vw'
        }}
      >
        <div
          className="w-full h-[100dvh] flex flex-col justify-center items-center"
          style={{
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}