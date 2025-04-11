import WebSocketClientProvider from '@/context/WebSocketClientProvider';

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
        <WebSocketClientProvider>
          {children}
        </WebSocketClientProvider>
  );
}