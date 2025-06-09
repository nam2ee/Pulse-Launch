import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from './WalletContextProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse | Community Bootstrapper Platform",
  description: "Pulse is a community bootstrapper platform where active participation is rewarded and communities thrive.",
  keywords: "Pulse, community, bootstrapper, engagement, rewards, crypto, blockchain",
  openGraph: {
    title: "Pulse | Community Bootstrapper Platform",
    description: "Join Pulse, where communities grow through active engagement and participants earn rewards. Currently featuring the Orca community campaign!",
    images: ["/images/background.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletContextProvider>
          {children}
          <ToastContainer 
            position="top-center" 
            autoClose={false}
            hideProgressBar={true}
            newestOnTop={false} 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
            theme="dark" 
            toastClassName="glass-toast"
          />
        </WalletContextProvider>
      </body>
    </html>
  );
}
