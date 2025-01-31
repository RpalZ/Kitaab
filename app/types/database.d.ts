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
} 