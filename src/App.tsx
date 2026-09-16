import { Route, Routes } from 'react-router-dom';
import { AppShell } from './ui/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { VehicleListPage } from './features/vehicle/VehicleListPage';
import { VehicleFormPage } from './features/vehicle/VehicleFormPage';
import { VehicleDetailPage } from './features/vehicle/VehicleDetailPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehicleListPage />} />
        <Route path="/vehicles/new" element={<VehicleFormPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
      </Routes>
    </AppShell>
  );
}
