// Student Profile
interface StudentProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student';
  classIds: string[];  // Array of class IDs the student is enrolled in
  createdAt: Timestamp;
  lastActive: Timestamp;
}

// Student Progress in a Class
interface StudentClassProgress {
  studentId: string;
  classId: string;
  overallProgress: number;
  lastAccessed: Timestamp;
  assignments: {
    [assignmentId: string]: {
      status: 'pending' | 'completed' | 'late';
      grade?: number;
      submittedAt?: Timestamp;
      feedback?: string;
      comment: string;
      file: any;
    }
  }
}

// Assignment Type
interface Assignment {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  dueDate: Timestamp;
  status: string;
  createdAt: Timestamp;
  type: string;
  file?: {
    url: string;
    filename: string;
    type: 'PDF' | 'Image';
  };
  resourceIds?: string[]; // Make resourceIds optional
} 