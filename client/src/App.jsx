import { Toaster } from 'react-hot-toast';
import AppRouter   from './routes/AppRouter';

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily:   'Inter, sans-serif',
            fontSize:     '14px',
            borderRadius: '10px',
            padding:      '12px 16px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { duration: 6000, iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </>
  );
}