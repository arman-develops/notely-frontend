export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  preferences?: string[];
  hasCompletedOnboarding?: boolean;
  bio?: string;
  avatar?: string;
  dateJoined: Date;
}
