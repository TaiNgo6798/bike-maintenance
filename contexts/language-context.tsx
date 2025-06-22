"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "vi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation data
const translations = {
  en: {
    // App Name
    appName: "Bike Maintenance",
    appDescription: "Track your motorcycle maintenance",

    // Navigation
    back: "Back",
    viewAll: "View All",
    settings: "Settings",

    // Home Page
    currentStatus: "Current Status",
    currentKilometers: "Current Kilometers",
    addRecord: "Add Record",
    checkStatus: "Check Status",
    history: "History",
    recentMaintenance: "Recent Maintenance",
    noRecordsYet: "No maintenance records yet",
    addFirstRecord: "Add your first maintenance record!",
    settingsIntervals: "Settings & Intervals",
    due: "Due",
    overdueMaintenance: "{count} maintenance items overdue",
    checkMaintenanceStatus: "Check your maintenance status",

    // Add Maintenance
    addMaintenance: "Add Maintenance",
    takeOdometerPhoto: "Take Odometer Photo",
    takePhotoDescription: "Take a clear photo of your bike's odometer display",
    tapToTakePhoto: "Tap to take photo",
    detectingKilometers: "Detecting kilometers...",
    confirmReading: "Confirm Reading",
    verifyReading: "Verify the detected odometer reading",
    kilometers: "Kilometers",
    enterKilometers: "Enter kilometers",
    selectMaintenanceTags: "Select Maintenance Tags",
    chooseMaintenancePerformed: "Choose what maintenance was performed",
    selectedTags: "Selected Tags:",
    notesOptional: "Notes (Optional)",
    addAdditionalNotes: "Add any additional notes...",
    saveRecord: "Save Record",

    // Track/Check Status
    maintenanceCheck: "Maintenance Check",
    takePhotoOdometer: "Take Photo Odometer",
    currentOdometerReading: "Current Odometer Reading",
    takePhotoToCheck: "Take a photo of your current odometer to check maintenance status",
    takeCurrentReading: "Take Current Reading",
    orEnterManually: "Or enter manually",
    currentKilometers2: "Current kilometers",
    check: "Check",
    analyzingMaintenanceStatus: "Analyzing maintenance status...",
    currentReading: "Current Reading",
    maintenanceStatus: "Maintenance Status",
    overdue: "Overdue",
    dueSoon: "Due Soon",
    ok: "OK",
    lastMaintenance: "Last",
    last: "Last",
    distance: "Distance",
    interval: "interval",
    remaining: "remaining",
    days: "Days",
    daysLeft: "days left",
    daysOverdue: "days overdue",
    kmRemaining: "km remaining",
    kmOverdue: "km overdue",
    noPreviousMaintenance: "No previous maintenance recorded",
    checkAgain: "Check Again",

    // History
    maintenanceHistory: "Maintenance History",
    searchByTags: "Search by tags or notes...",
    totalRecords: "Total Records",
    latestKM: "Latest KM",
    noRecordsMatch: "No records match your search",

    // Settings
    notifications: "Notifications",
    notificationDescription: "Get notified when maintenance is due",
    enableNotifications: "Enable notifications",
    maintenanceTagsIntervals: "Maintenance Tags & Intervals",
    configureTagsDescription: "Configure maintenance tags and their reminder intervals",
    addNewMaintenanceTag: "Add new maintenance tag",
    noTagsYet: "No maintenance tags yet",
    addYourFirstTag: "Add your first maintenance tag!",
    everyKm: "Every (km)",
    everyDays: "Every (days)",
    dataManagement: "Data Management",
    manageMaintenanceData: "Manage your maintenance data",
    clearAllData: "Clear All Data",
    about: "About",
    appVersion: "Bike Maintenance Tracker v1.0",
    appAbout: "Keep track of your motorcycle maintenance with photo records and automatic reminders.",
    language: "Language",
    tagMustHaveName: "Tag must have a name",
    save: "Save",

    // Maintenance Tags
    oilChange: "Oil Change",
    airFilter: "Air Filter",
    sparkPlug: "Spark Plug",
    chainCleaning: "Chain Cleaning",
    brakePads: "Brake Pads",
    tireCheck: "Tire Check",
    batteryCheck: "Battery Check",

    // Confirmations
    confirmClearData: "Are you sure you want to clear all maintenance records? This cannot be undone.",
    confirmRemoveTag: 'Remove "{tag}" tag and its interval?',
    dataClearedSuccess: "All data cleared successfully!",

    // Firebase/Error Messages
    pleaseEnterKilometers: "Please enter kilometers",
    pleaseSelectAtLeastOneTag: "Please select at least one maintenance tag",
    maintenanceRecordSaved: "Maintenance record saved successfully!",
    failedToSaveRecord: "Failed to save maintenance record",
    failedToDetectODO: "Failed to detect odometer reading",
    confirmDeleteRecord: "Are you sure you want to delete this record?",
    recordDeleted: "Record deleted successfully!",
    failedToDeleteRecord: "Failed to delete record",
    loadingRecords: "Loading records...",
    saving: "Saving...",
    additionalNotes: "Additional Notes",
    optionalNotesDescription: "Add any additional notes about this maintenance",
    enterNotes: "Enter notes...",
    kilometersRequired: "Kilometers is required",
    kilometersMustBeNumber: "Kilometers must be a number",
    atLeastOneTagRequired: "At least one tag is required",
    tagNameRequired: "Tag name is required",
    atLeastOneIntervalRequired: "At least one interval (kilometers or days) is required",
    failedToAddTag: "Failed to add tag",
    tagUpdatedSuccessfully: "Tag updated successfully",
    failedToUpdateTag: "Failed to update tag",
    tagRemovedSuccessfully: "Tag removed successfully",
    failedToRemoveTag: "Failed to remove tag",
    loading: "Loading...",
    noTagsConfigured: "No maintenance tags configured",
    configureTagsInSettings: "Configure tags in settings",
    goToSettings: "Go to Settings",

    // New Tag Modal
    addNewTagWithIntervals: "Add New Tag with Intervals",
    addNewTagWithIntervalsDescription: "Create a new maintenance tag with reminder intervals",
    tagName: "Tag Name",
    enterTagName: "Enter tag name",
    addTag: "Add Tag",
    cancel: "Cancel",
    tagAddedSuccessfully: "Tag added successfully",

    // Time formatting
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
  },
  vi: {
    // App Name
    appName: "Bảo Dưỡng Xe Máy",
    appDescription: "Theo dõi bảo dưỡng xe máy của bạn",

    // Navigation
    back: "Quay lại",
    viewAll: "Xem tất cả",
    settings: "Cài đặt",

    // Home Page
    currentStatus: "Tình trạng hiện tại",
    currentKilometers: "Số km hiện tại",
    addRecord: "Thêm đợt bảo dưỡng",
    checkStatus: "Kiểm tra",
    history: "Lịch sử",
    recentMaintenance: "Đợt bảo dưỡng gần đây",
    noRecordsYet: "Chưa có đợt bảo dưỡng nào",
    addFirstRecord: "Thêm đợt bảo dưỡng đầu tiên!",
    settingsIntervals: "Cài Đặt & Chu Kỳ",
    due: "Đến hạn",
    overdueMaintenance: "{count} mục bảo dưỡng quá hạn",
    checkMaintenanceStatus: "Kiểm tra tình trạng bảo dưỡng",

    // Add Maintenance
    addMaintenance: "Thêm đợt bảo dưỡng",
    takeOdometerPhoto: "Chụp ảnh đồng hồ km",
    takePhotoDescription: "Chụp ảnh rõ nét đồng hồ km của xe máy",
    tapToTakePhoto: "Nhấn để chụp ảnh",
    detectingKilometers: "Đang nhận diện số km...",
    confirmReading: "Xác nhận số km",
    verifyReading: "Xác minh số km được phát hiện",
    kilometers: "Số km",
    enterKilometers: "Nhập số km",
    selectMaintenanceTags: "Chọn loại bảo dưỡng",
    chooseMaintenancePerformed: "Chọn công việc bảo dưỡng đã thực hiện",
    selectedTags: "Nhãn đã chọn",
    notesOptional: "Ghi chú (tùy chọn)",
    addAdditionalNotes: "Thêm ghi chú bổ sung...",
    saveRecord: "Lưu đợt bảo dưỡng",

    // Track/Check Status
    maintenanceCheck: "Kiểm tra đợt bảo dưỡng",
    takePhotoOdometer: "Chụp ảnh đồng hồ km hiện tại",
    currentOdometerReading: "Số km hiện tại",
    takePhotoToCheck: "Chụp ảnh đồng hồ km hiện tại để kiểm tra tình trạng bảo dưỡng",
    takeCurrentReading: "Chụp số km hiện tại",
    orEnterManually: "Hoặc nhập thủ công",
    currentKilometers2: "Số km hiện tại",
    check: "Kiểm tra",
    analyzingMaintenanceStatus: "Đang phân tích tình trạng bảo dưỡng...",
    currentReading: "Số km hiện tại",
    maintenanceStatus: "Tình trạng bảo dưỡng",
    overdue: "Quá hạn",
    dueSoon: "Sắp đến hạn",
    ok: "Tốt",
    lastMaintenance: "Lần cuối",
    last: "Lần cuối",
    distance: "Đã đi",
    interval: "chu kỳ",
    remaining: "còn lại",
    days: "Ngày",
    daysLeft: "ngày còn lại",
    daysOverdue: "ngày quá hạn",
    kmRemaining: "km còn lại",
    kmOverdue: "km quá hạn",
    noPreviousMaintenance: "Chưa có bản ghi bảo dưỡng trước đó",
    checkAgain: "Kiểm tra lại",

    // History
    maintenanceHistory: "Lịch sử bảo dưỡng",
    searchByTags: "Tìm kiếm theo nhãn hoặc ghi chú...",
    totalRecords: "Tổng bản ghi",
    latestKM: "Km mới nhất",
    noRecordsMatch: "Không có bản ghi nào khớp với tìm kiếm",

    // Settings
    notifications: "Thông báo",
    notificationDescription: "Nhận thông báo khi đến hạn bảo dưỡng",
    enableNotifications: "Bật thông báo",
    maintenanceTagsIntervals: "Nhãn & chu kỳ bảo dưỡng",
    configureTagsDescription: "Cấu hình nhãn bảo dưỡng và chu kỳ nhắc nhở",
    addNewMaintenanceTag: "Thêm nhãn bảo dưỡng mới",
    noTagsYet: "Chưa có nhãn bảo dưỡng nào",
    addYourFirstTag: "Thêm nhãn bảo dưỡng đầu tiên!",
    everyKm: "Mỗi (km)",
    everyDays: "Mỗi (ngày)",
    dataManagement: "Quản lý dữ liệu",
    manageMaintenanceData: "Quản lý dữ liệu bảo dưỡng của bạn",
    clearAllData: "Xóa tất cả dữ liệu",
    about: "Giới thiệu",
    appVersion: "Ứng Dụng Bảo Dưỡng Xe Máy v1.0",
    appAbout: "Theo dõi bảo dưỡng xe máy với bản ghi ảnh và nhắc nhở tự động.",
    language: "Ngôn Ngữ",
    tagMustHaveName: "Nhãn bảo dưỡng phải có tên",
    save: "Lưu",

    // Maintenance Tags
    oilChange: "Thay Dầu",
    airFilter: "Lọc Gió",
    sparkPlug: "Bugi",
    chainCleaning: "Vệ Sinh Xích",
    brakePads: "Má Phanh",
    tireCheck: "Kiểm Tra Lốp",
    batteryCheck: "Kiểm Tra Ắc Quy",

    // Confirmations
    confirmClearData: "Bạn có chắc chắn muốn xóa tất cả bản ghi bảo dưỡng? Hành động này không thể hoàn tác.",
    confirmRemoveTag: 'Xóa nhãn "{tag}" và chu kỳ của nó?',
    dataClearedSuccess: "Đã xóa tất cả dữ liệu thành công!",

    // Firebase/Error Messages
    pleaseEnterKilometers: "Vui lòng nhập số km",
    pleaseSelectAtLeastOneTag: "Vui lòng chọn ít nhất một loại bảo dưỡng",
    maintenanceRecordSaved: "Đã lưu đợt bảo dưỡng thành công!",
    failedToSaveRecord: "Không thể lưu đợt bảo dưỡng",
    failedToDetectODO: "Không thể nhận diện số km",
    confirmDeleteRecord: "Bạn có chắc muốn xóa đợt bảo dưỡng này?",
    recordDeleted: "Đã xóa đợt bảo dưỡng thành công!",
    failedToDeleteRecord: "Không thể xóa đợt bảo dưỡng",
    loadingRecords: "Đang tải dữ liệu...",
    saving: "Đang lưu...",
    additionalNotes: "Ghi chú bổ sung",
    optionalNotesDescription: "Thêm ghi chú về đợt bảo dưỡng này",
    enterNotes: "Nhập ghi chú...",
    kilometersRequired: "Số km là bắt buộc",
    kilometersMustBeNumber: "Số km phải là một số",
    atLeastOneTagRequired: "Phải có ít nhất một loại bảo dưỡng",
    tagNameRequired: "Tên nhãn là bắt buộc",
    atLeastOneIntervalRequired: "Phải có ít nhất một khoảng cách (số km hoặc ngày) là bắt buộc",
    failedToAddTag: "Không thể thêm nhãn",
    tagUpdatedSuccessfully: "Nhãn đã được cập nhật thành công",
    failedToUpdateTag: "Không thể cập nhật nhãn",
    tagRemovedSuccessfully: "Nhãn đã được xóa thành công",
    failedToRemoveTag: "Không thể xóa nhãn",
    loading: "Đang tải...",
    noTagsConfigured: "Không có nhãn bảo dưỡng nào được cấu hình",
    configureTagsInSettings: "Cấu hình nhãn trong cài đặt",
    goToSettings: "Đi đến Cài Đặt",

    // New Tag Modal
    addNewTagWithIntervals: "Thêm Nhãn Mới với Chu Kỳ",
    addNewTagWithIntervalsDescription: "Tạo nhãn bảo dưỡng mới với chu kỳ nhắc nhở",
    tagName: "Tên Nhãn",
    enterTagName: "Nhập tên nhãn",
    addTag: "Thêm Nhãn",
    cancel: "Hủy",
    tagAddedSuccessfully: "Nhãn đã được thêm thành công",

    // Time formatting
    jan: "Th1",
    feb: "Th2",
    mar: "Th3",
    apr: "Th4",
    may: "Th5",
    jun: "Th6",
    jul: "Th7",
    aug: "Th8",
    sep: "Th9",
    oct: "Th10",
    nov: "Th11",
    dec: "Th12",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("app-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "vi")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("app-language", lang)
  }

  const t = (key: string) => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
