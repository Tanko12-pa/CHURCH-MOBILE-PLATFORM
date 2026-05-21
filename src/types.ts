export interface ChurchProfile {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  province: string;
  country: string;
  bibleVersion: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  demographic: "Children" | "Youth" | "Adult" | "Men" | "Women";
  status: "Active" | "Inactive";
  joinedAt: string;
  notes: string;
}

export interface NewComer {
  id: string;
  name: string;
  firstVisit: string;
  email: string;
  phone: string;
  assignedTo: string;
  status: "New" | "Contacted" | "Attending" | "Converted" | "Member";
  followUpNotes: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  serviceType: string;
  attendanceCount: number;
  newVisitors: number;
}

export interface ChurchProgram {
  id: string;
  name: string;
  schedule: string;
  location: string;
  leader: string;
  type: "Service" | "Study" | "Outreach" | "Concert" | "Retreat";
}

export interface SpecialEvent {
  id: string;
  name: string;
  type: "Crusade" | "Retreat" | "Conference" | "Seminar" | "Concert";
  date: string;
  venue: string;
  budget: number;
  expectedAttendance: number;
  flyerUrl?: string;
  notes: string;
  checklist: { task: string; done: boolean }[];
  salvations?: number; // Crusade results
}

export interface VideoLink {
  id: string;
  title: string;
  url: string;
  category: "Sermon" | "Worship" | "Outreach" | "Seminar";
  uploadedAt: string;
}

export interface AudioMessage {
  id: string;
  title: string;
  preacher: string;
  url: string;
  duration: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "Sent" | "Scheduled" | "Draft";
}

export interface BibleDoctrine {
  id: string;
  name: string;
  type: "preset" | "uploaded";
  content: string;
  summary: string;
  uploadedAt?: string;
}
