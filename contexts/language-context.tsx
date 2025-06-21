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
    addCustomTag: "Add custom tag",
    selectedTags: "Selected Tags:",
    notesOptional: "Notes (Optional)",
    addAdditionalNotes: "Add any additional notes...",
    saveRecord: "Save Record",

    // Track/Check Status
    maintenanceCheck: "Maintenance Check",
    currentOdometerReading: "Current Odometer Reading",
    takePhotoToCheck: "Take a photo of your current odometer to check maintenance status",
    takeCurrentReading: "Take Current Reading",
    orEnterManually: "Or enter manually:",
    currentKilometers2: "Current kilometers",
    check: "Check",
    analyzingMaintenanceStatus: "Analyzing maintenance status...",
    currentReading: "Current Reading",
    maintenanceStatus: "Maintenance Status",
    overdue: "Overdue",
    dueSoon: "Due Soon",
    ok: "OK",
    lastMaintenance: "Last",
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
    everyKm: "Every (km)",
    everyDays: "Every (days)",
    dataManagement: "Data Management",
    manageMaintenanceData: "Manage your maintenance data",
    clearAllData: "Clear All Data",
    about: "About",
    appVersion: "Bike Maintenance Tracker v1.0",
    appAbout: "Keep track of your motorcycle maintenance with photo records and automatic reminders.",
    language: "Language",

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
    currentStatus: "Tình Trạng Hiện Tại",
    currentKilometers: "Số Km Hiện Tại",
    addRecord: "Thêm Bản Ghi",
    checkStatus: "Kiểm Tra",
    history: "Lịch Sử",
    recentMaintenance: "Bảo Dưỡng Gần Đây",
    noRecordsYet: "Chưa có bản ghi bảo dưỡng nào",
    addFirstRecord: "Thêm bản ghi bảo dưỡng đầu tiên!",
    settingsIntervals: "Cài Đặt & Chu Kỳ",
    due: "Đến hạn",

    // Add Maintenance
    addMaintenance: "Thêm Bảo Dưỡng",
    takeOdometerPhoto: "Chụp Ảnh Đồng Hồ Km",
    takePhotoDescription: "Chụp ảnh rõ nét đồng hồ km của xe máy",
    tapToTakePhoto: "Nhấn để chụp ảnh",
    detectingKilometers: "Đang nhận diện số km...",
    confirmReading: "Xác Nhận Số Đọc",
    verifyReading: "Xác minh số km được phát hiện",
    kilometers: "Số Km",
    enterKilometers: "Nhập số km",
    selectMaintenanceTags: "Chọn Loại Bảo Dưỡng",
    chooseMaintenancePerformed: "Chọn công việc bảo dưỡng đã thực hiện",
    addCustomTag: "Thêm nhãn tùy chỉnh",
    selectedTags: "Nhãn đã chọn:",
    notesOptional: "Ghi Chú (Tùy chọn)",
    addAdditionalNotes: "Thêm ghi chú bổ sung...",
    saveRecord: "Lưu Bản Ghi",

    // Track/Check Status
    maintenanceCheck: "Kiểm Tra Bảo Dưỡng",
    currentOdometerReading: "Số Đọc Đồng Hồ Km Hiện Tại",
    takePhotoToCheck: "Chụp ảnh đồng hồ km hiện tại để kiểm tra tình trạng bảo dưỡng",
    takeCurrentReading: "Chụp Số Đọc Hiện Tại",
    orEnterManually: "Hoặc nhập thủ công:",
    currentKilometers2: "Số km hiện tại",
    check: "Kiểm tra",
    analyzingMaintenanceStatus: "Đang phân tích tình trạng bảo dưỡng...",
    currentReading: "Số Đọc Hiện Tại",
    maintenanceStatus: "Tình Trạng Bảo Dưỡng",
    overdue: "Quá hạn",
    dueSoon: "Sắp đến hạn",
    ok: "Tốt",
    lastMaintenance: "Lần cuối",
    distance: "Quãng đường",
    interval: "chu kỳ",
    remaining: "còn lại",
    days: "Ngày",
    daysLeft: "ngày còn lại",
    daysOverdue: "ngày quá hạn",
    kmRemaining: "km còn lại",
    kmOverdue: "km quá hạn",
    noPreviousMaintenance: "Chưa có bản ghi bảo dưỡng trước đó",
    checkAgain: "Kiểm Tra Lại",

    // History
    maintenanceHistory: "Lịch Sử Bảo Dưỡng",
    searchByTags: "Tìm kiếm theo nhãn hoặc ghi chú...",
    totalRecords: "Tổng Bản Ghi",
    latestKM: "Km Mới Nhất",
    noRecordsMatch: "Không có bản ghi nào khớp với tìm kiếm",

    // Settings
    notifications: "Thông Báo",
    notificationDescription: "Nhận thông báo khi đến hạn bảo dưỡng",
    enableNotifications: "Bật thông báo",
    maintenanceTagsIntervals: "Nhãn & Chu Kỳ Bảo Dưỡng",
    configureTagsDescription: "Cấu hình nhãn bảo dưỡng và chu kỳ nhắc nhở",
    addNewMaintenanceTag: "Thêm nhãn bảo dưỡng mới",
    everyKm: "Mỗi (km)",
    everyDays: "Mỗi (ngày)",
    dataManagement: "Quản Lý Dữ Liệu",
    manageMaintenanceData: "Quản lý dữ liệu bảo dưỡng của bạn",
    clearAllData: "Xóa Tất Cả Dữ Liệu",
    about: "Giới Thiệu",
    appVersion: "Ứng Dụng Bảo Dưỡng Xe Máy v1.0",
    appAbout: "Theo dõi bảo dưỡng xe máy với bản ghi ảnh và nhắc nhở tự động.",
    language: "Ngôn Ngữ",

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
  const [language, setLanguage] = useState<Language>("en")

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
