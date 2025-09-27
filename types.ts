
export interface CourseDetails {
  id: string;
  created_at: string;
  name: string;
  location: string;
  provider: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  person_in_charge?: string;
  is_visible: boolean;
}

export interface Participant {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  rut: string;
  email: string;
  phone: string;
  role: string;
  faculty: string;
  department: string;
  major: string;
  contractType: string;
  teachingSemester: string;
  campus: string;
  signature: string; // Base64 data URL
  created_at?: string;
}