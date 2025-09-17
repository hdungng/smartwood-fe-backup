// Define the QualityReport type
export interface QualityReport {
  id: number;
  reportId: string;
  qcPersonName: string;
  qcPersonId: string;
  qcPersonAvatar?: string;
  title: string;
  content: string;
  productName: string;
  batchNumber: string;
  testDate: string;
  createdAt: string;
  status: 'Pass' | 'Fail' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
  images?: string[];
  comments: Comment[];
  approvedBy?: string;
  approvedAt?: string;
  approvalReason?: string;
}

export interface Comment {
  id: number;
  reportId: number;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isEdited?: boolean;
}

// Define user roles
export type UserRole = 'QC' | 'Manager' | 'Admin';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Mock current user - this should come from auth context
export const mockCurrentUser: CurrentUser = {
  id: 'MGR001',
  name: 'Nguyễn Văn Nam',
  role: 'Manager',
  avatar: '/avatars/manager.jpg'
};

// Function to check if user can approve reports
export const canApproveReports = (userRole: UserRole): boolean => {
  return userRole === 'Manager' || userRole === 'Admin';
};

// Mock data for quality reports
export const mockQualityReports: QualityReport[] = [
  {
    id: 1,
    reportId: 'QR-2024-001',
    qcPersonName: 'Nguyễn Văn Hùng',
    qcPersonId: 'QC001',
    qcPersonAvatar: '/avatars/hung.jpg',
    title: 'Kiểm tra chất lượng viên nén gỗ lô BATCH-20240115',
    content:
      'Thực hiện kiểm tra chất lượng lô viên nén gỗ sản xuất từ mùn sẻ và phoi bào. Tồn nguyên liệu ước đạt 800 tấn. Viên cứng chắc, nứt dọc nhẹ. Tồn viên ước đạt 100 bao tro 2.7-2.9, phủ tôn 82. Chất lượng đạt tiêu chuẩn xuất khẩu.',
    productName: 'Viên nén gỗ',
    batchNumber: 'BATCH-20240115',
    testDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'Pass',
    priority: 'Low',
    images: ['/images/pellet-test-1.jpg', '/images/pellet-test-2.jpg'],
    comments: [
      {
        id: 1,
        reportId: 1,
        authorName: 'Trần Thị Mai',
        authorId: 'QC002',
        authorAvatar: '/avatars/mai.jpg',
        content: 'Báo cáo rất chi tiết. Chất lượng viên đạt tiêu chuẩn. Cần lưu ý bảo quản trong kho khô ráo.',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        reportId: 1,
        authorName: 'Lê Văn Đức',
        authorId: 'SUP001',
        authorAvatar: '/avatars/duc.jpg',
        content: 'Tốt, lô này có thể đóng bao xuất khẩu. Cảm ơn team QC.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 2,
    reportId: 'QR-2024-002',
    qcPersonName: 'Phạm Thu Hằng',
    qcPersonId: 'QC003',
    qcPersonAvatar: '/avatars/hang.jpg',
    title: 'Kiểm tra nguyên liệu MDF và ván ép phủ fim',
    content:
      'Kiểm tra lô nguyên liệu MDF và ván ép phủ fim vừa nhập về. Phát hiện độ ẩm cao hơn tiêu chuẩn. Viên sản xuất bị mềm, nứt nhiều. Cần sấy khô nguyên liệu trước khi đưa vào sản xuất.',
    productName: 'Viên nén mùn cưa',
    batchNumber: 'BATCH-20240118',
    testDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'Fail',
    priority: 'High',
    images: ['/images/mdf-test-1.jpg'],
    comments: [
      {
        id: 3,
        reportId: 2,
        authorName: 'Nguyễn Văn Hùng',
        authorId: 'QC001',
        authorAvatar: '/avatars/hung.jpg',
        content: 'Chị Hằng phát hiện đúng vấn đề. Cần dừng sản xuất lô này và sấy khô nguyên liệu.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 3,
    reportId: 'QR-2024-003',
    qcPersonName: 'Võ Minh Tuấn',
    qcPersonId: 'QC004',
    qcPersonAvatar: '/avatars/tuan.jpg',
    title: 'Kiểm tra pellet gỗ thông xuất khẩu',
    content:
      'Thực hiện kiểm tra toàn diện lô pellet gỗ thông xuất khẩu từ xưởng Hồng Vĩnh Phúc. Nguyên liệu mùn cưa thông chất lượng tốt. Viên cứng chắc, không nứt. Tất cả chỉ số đạt tiêu chuẩn xuất khẩu EU.',
    productName: 'Pellet gỗ thông',
    batchNumber: 'BATCH-20240120',
    testDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'Pass',
    priority: 'Low',
    comments: []
  },
  {
    id: 4,
    reportId: 'QR-2024-004',
    qcPersonName: 'Trần Thị Mai',
    qcPersonId: 'QC002',
    qcPersonAvatar: '/avatars/mai.jpg',
    title: 'Kiểm tra dăm gỗ keo lô mới',
    content:
      'Đang thực hiện kiểm tra chất lượng lô dăm gỗ keo vừa sản xuất. Nguyên liệu từ gỗ thanh củi mẫu và mùn cắt. Tồn nguyên liệu ước đạt 650 tấn. Đang đánh giá chất lượng viên và tỷ lệ tro.',
    productName: 'Dăm gỗ',
    batchNumber: 'BATCH-20240121',
    testDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'Pending',
    priority: 'Medium',
    comments: [
      {
        id: 4,
        reportId: 4,
        authorName: 'Lê Văn Đức',
        authorId: 'SUP001',
        authorAvatar: '/avatars/duc.jpg',
        content: 'Chị Mai báo cáo kết quả sớm nhé, khách hàng đang chờ xác nhận chất lượng.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 5,
    reportId: 'QR-2024-005',
    qcPersonName: 'Lê Thành Công',
    qcPersonId: 'QC005',
    qcPersonAvatar: '/avatars/cong.jpg',
    title: 'Báo cáo sản xuất hôm nay - Xưởng Hồng Vĩnh Phúc',
    content:
      'Hôm nay xưởng phun 2 vỏ cho SMW. Nguyên liệu sử dụng: mùn sẻ, phoi bào, gỗ thanh củi mẫu, mùn cắt, MDF, ván ép phủ fim. Tồn nguyên liệu ước đạt 800 tấn. Chất lượng viên: viên cứng chắc, nứt dọc nhẹ. Tồn viên ước đạt 100 bao tro 2.7-2.9, phủ tôn 82.',
    productName: 'Viên nén gỗ',
    batchNumber: 'BATCH-20240122',
    testDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'Pass',
    priority: 'Low',
    comments: [
      {
        id: 5,
        reportId: 5,
        authorName: 'Nguyễn Văn Hùng',
        authorId: 'QC001',
        authorAvatar: '/avatars/hung.jpg',
        content: 'Báo cáo chuẩn anh Công. Lô này chất lượng ổn định.',
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        reportId: 5,
        authorName: 'Phạm Thu Hằng',
        authorId: 'QC003',
        authorAvatar: '/avatars/hang.jpg',
        content: 'Tỷ lệ tro 2.7-2.9 rất tốt. Khách hàng sẽ hài lòng.',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// Export function to get report by ID
export const getQualityReportById = (id: number): QualityReport | undefined => {
  return mockQualityReports.find((report) => report.id === id);
};

// Export function to add comment to a report
export const addCommentToReport = (reportId: number, comment: Omit<Comment, 'id' | 'reportId'>): Comment => {
  const newComment: Comment = {
    id: Date.now(),
    reportId,
    ...comment
  };

  const report = mockQualityReports.find((r) => r.id === reportId);
  if (report) {
    report.comments.push(newComment);
  }

  return newComment;
};
