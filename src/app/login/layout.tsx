import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - Aegis',
  description: 'Authenticate to access Aegis Tactical War Room',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-black">
      {children}
    </div>
  );
}
