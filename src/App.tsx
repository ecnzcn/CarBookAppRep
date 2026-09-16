import { Route, Routes } from 'react-router-dom';
import { AppShell } from './ui/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { VehicleListPage } from './features/vehicle/VehicleListPage';
import { VehicleFormPage } from './features/vehicle/VehicleFormPage';
import { VehicleDetailPage } from './features/vehicle/VehicleDetailPage';
import { MaintenanceFormPage } from './features/maintenance/MaintenanceFormPage';
import { IssueFormPage } from './features/issue/IssueFormPage';
import { FuelFormPage } from './features/fuel/FuelFormPage';
import { TiresPage } from './features/tires/TiresPage';
import { TimelinePage } from './features/timeline/TimelinePage';
import { CostsPage } from './features/costs/CostsPage';
import { SettingsPage } from './features/settings/SettingsPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehicleListPage />} />
        <Route path="/vehicles/new" element={<VehicleFormPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
        <Route path="/maintenance/new" element={<MaintenanceFormPage />} />
        <Route path="/maintenance/:id/edit" element={<MaintenanceFormPage />} />
        <Route path="/issues/new" element={<IssueFormPage />} />
        <Route path="/issues/:id/edit" element={<IssueFormPage />} />
        <Route path="/fuel/new" element={<FuelFormPage />} />
        <Route path="/fuel/:id/edit" element={<FuelFormPage />} />
        <Route path="/vehicles/:id/tires" element={<TiresPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/costs" element={<CostsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
