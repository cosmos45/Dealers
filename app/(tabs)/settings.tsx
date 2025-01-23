import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { 
  updateProfile, 
  updateEmail, 
  fetchSignInMethodsForEmail, 
  sendEmailVerification 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';



export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    businessName: '',
    isEmailVerified: false
  });
  
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const currentUser = auth?.currentUser;
        if (currentUser && isMounted) {
          await currentUser.reload();
          
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'dealers', currentUser.uid));
          const userData = userDoc.data();
    
          setUserDetails({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            businessName: userData?.businessName || '',
            isEmailVerified: currentUser.emailVerified || false
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    

    loadUserData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const checkVerificationStatus = () => {
      const user = auth.currentUser;
      if (user) {
        user.reload().then(() => {
          setUserDetails(prev => ({
            ...prev,
            isEmailVerified: user.emailVerified
          }));
        });
      }
    };
  
    const interval = setInterval(checkVerificationStatus, 5000); // Check every 5 seconds
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkEmailVerification = () => {
      const user = auth.currentUser;
      if (user) {
        user.reload().then(() => {
          if (user.emailVerified) {
            setUserDetails(prev => ({
              ...prev,
              isEmailVerified: true
            }));
          }
        });
      }
    };
  
    const interval = setInterval(checkEmailVerification, 5000);
    return () => clearInterval(interval);
  }, []);
  
  

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        alert('No user is currently signed in');
        return;
      }
  
      if (user.emailVerified) {
        alert('Email is already verified');
        return;
      }
  
      await sendEmailVerification(user);
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        alert('Too many requests. Please try again later.');
      } else {
        alert('Error sending verification email: ' + error.message);
      }
      console.error('Email verification error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      alert('Error signing out');
    }
  };



  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        alert('No user is currently signed in');
        return;
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userDetails.email)) {
        alert('Please enter a valid email address');
        return;
      }
  
      // Check if email is being changed
      if (user.email !== userDetails.email) {
        const signInMethods = await fetchSignInMethodsForEmail(auth, userDetails.email);
        if (signInMethods.length > 0) {
          alert('This email is already in use by another account');
          return;
        }
  
        await updateEmail(user, userDetails.email);
        await sendEmailVerification(user);
        alert('Verification email sent to your new email address. Please verify it.');
      }
  
      // Update display name in Authentication
      await updateProfile(user, {
        displayName: `${userDetails.firstName} ${userDetails.lastName}`
      });
  
      // Update user data in Firestore
      await setDoc(doc(db, 'dealers', user.uid), {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        businessName: userDetails.businessName,
        updatedAt: serverTimestamp()
      }, { merge: true });
  
      // Refresh user data
      await user.reload();
      setUserDetails(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        isEmailVerified: user.emailVerified
      }));
  
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('For security reasons, please log out and log in again to change your email');
      } else {
        alert(error.message || 'Error updating profile');
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  



  return (
    <Surface style={styles.container}>
      {loading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    )}
      <View style={styles.section}>
      <TextInput
  label="First Name"
  value={userDetails.firstName}
  onChangeText={(text) => setUserDetails(prev => ({...prev, firstName: text}))}
  mode="outlined"
  style={styles.input}
  theme={{ colors: { primary: '#007BFF' }}}
/>

<TextInput
  label="Last Name"
  value={userDetails.lastName}
  onChangeText={(text) => setUserDetails(prev => ({...prev, lastName: text}))}
  mode="outlined"
  style={styles.input}
  theme={{ colors: { primary: '#007BFF' }}}
/>

<TextInput
  label="Business Name"
  value={userDetails.businessName}
  onChangeText={(text) => setUserDetails(prev => ({...prev, businessName: text}))}
  mode="outlined"
  style={styles.input}
  theme={{ colors: { primary: '#007BFF' }}}
/>

        
        <TextInput
  label="Email"
  value={userDetails.email}
  onChangeText={(text) => setUserDetails(prev => ({...prev, email: text}))}
  mode="outlined"
  style={styles.input}
  theme={{ colors: { primary: '#007BFF' }}}
  right={
    <TextInput.Icon 
      icon={userDetails.isEmailVerified ? "check-circle" : "alert-circle"}
      color={userDetails.isEmailVerified ? '#28a745' : '#dc3545'}
    />
  }
/>
        
{!userDetails.isEmailVerified && (
  <Button 
    mode="contained" 
    onPress={handleEmailVerification}
    style={styles.verifyButton}
    buttonColor="#007BFF"
  >
    Verify Email
  </Button>
)}

        <Button 
          mode="contained"
          onPress={handleUpdateProfile}
          style={styles.updateButton}
          buttonColor="#007BFF"
        >
          Update Profile
        </Button>
      </View>

      <Button 
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#dc3545"
      >
        Logout
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff'
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000
  },
  section: {
    gap: 16
  },
  input: {
    marginBottom: 8
  },
  verifyButton: {
    marginBottom: 16
  },
  updateButton: {
    marginTop: 16
  },
  logoutButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16
  }
});
