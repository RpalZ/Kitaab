import { FIREBASE_AUTH, UserData, UserRole, db } from '@/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthUtils = {
  // Create user profile with role
  async createUserProfile(uid: string, email: string, role: UserRole): Promise<void> {
    const userRef = doc(db, 'users', uid);
    const userData: UserData = {
      uid,
      email,
      role,
      classIds: []
    };
    await setDoc(userRef, userData);
  },

  // Get current user's role
  async getCurrentUserRole(): Promise<UserRole | null> {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return null;
  },

  // Check if user has teacher permissions
  async isTeacher(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return role === 'teacher';
  },

  // Check if user has student permissions
  async isStudent(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return role === 'student';
  },

  // Check if user has access to a specific class
  async hasClassAccess(classId: string): Promise<boolean> {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return false;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data() as UserData;
    
    // Teachers have access to all classes they created
    if (userData.role === 'teacher') {
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      return classDoc.exists() && classDoc.data().teacherId === user.uid;
    }
    
    // Students only have access to classes they're enrolled in
    return userData.classIds?.includes(classId) || false;
  },

  async verifyUserRole(email: string, expectedRole: UserRole): Promise<boolean> {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return false;

    const userRole = await this.getCurrentUserRole();
    if (!userRole) return false;

    // Check if the role matches
    if (userRole !== expectedRole) {
      console.error('Role mismatch:', { userRole, expectedRole });
      return false;
    }

    return true;
  },

  async signInWithRole(email: string, password: string, expectedRole: UserRole): Promise<boolean> {
    try {
      const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const isCorrectRole = await this.verifyUserRole(email, expectedRole);
      
      if (!isCorrectRole) {
        await FIREBASE_AUTH.signOut();
        throw new Error(`Invalid role. Please use the correct login for your role.`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}; 