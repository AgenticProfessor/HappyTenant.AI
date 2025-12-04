// Data fetching hooks - export hooks explicitly to avoid type conflicts
export {
  useProperties,
  useProperty,
  usePropertyUnits,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  type Property,
  type Unit as PropertyUnit,
} from './use-properties';

export {
  useTenants,
  useTenant,
  useTenantLease,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  type Tenant,
  type LeaseTenant as TenantLeaseTenant,
  type Lease as TenantLease,
} from './use-tenants';

export {
  useVendors,
  useVendor,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  type Vendor,
  type MaintenanceRequest as VendorMaintenanceRequest,
} from './use-vendors';

export {
  useMaintenanceRequests,
  useMaintenanceRequest,
  useMaintenanceByUnit,
  useMaintenanceByProperty,
  useCreateMaintenanceRequest,
  useUpdateMaintenanceRequest,
  useDeleteMaintenanceRequest,
  type MaintenanceRequest,
} from './use-maintenance';

export {
  useLeases,
  useLease,
  useLeasesByUnit,
  useCreateLease,
  useUpdateLease,
  useDeleteLease,
  type Lease,
  type LeaseTenant,
  type Charge,
  type Payment,
} from './use-leases';

export {
  useUnits,
  useUnit,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
  type Unit,
  type Lease as UnitLease,
} from './use-units';

// Dashboard hook
export {
  useDashboard,
  type DashboardStats,
  type DashboardProperty,
  type DashboardTenant,
  type DashboardTransaction,
  type DashboardMaintenanceRequest,
  type DashboardData,
} from './use-dashboard';

// Context hooks
export * from './use-steward-context';
export * from './use-realtime-messages';
