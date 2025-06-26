// Re-export all functions from domain-specific service files
// This maintains backward compatibility while organizing code by domain

// Maintenance Record Services
export {
  uploadImage,
  deleteImage,
  addMaintenanceRecord,
  getMaintenanceRecords,
  deleteMaintenanceRecord,
  updateMaintenanceRecord,
  searchMaintenanceRecords,
} from './maintenance'

// Tag Management Services
export {
  addTagInterval,
  getTagIntervals,
  updateTagInterval,
  deleteTagInterval,
  getUserTags,
} from './tag' 