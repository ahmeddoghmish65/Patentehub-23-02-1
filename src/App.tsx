/**
 * App.tsx — root component.
 * Simply renders the RouterProvider; all app logic lives in the router tree.
 */
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';

export function App() {
  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  );
}
