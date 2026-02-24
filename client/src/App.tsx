import { Toaster } from 'react-hot-toast';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-dark-800 !text-dark-100 !border !border-dark-700',
        }}
      />
      <AppShell />
    </>
  );
}
