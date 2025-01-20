import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    businessName: '',
    isEmailVerified: false
  });

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const currentUser = auth?.currentUser;
        if (currentUser && isMounted) {
          await currentUser.reload(); // Refresh user data
          setUserDetails({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            businessName: '',
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
  
      await user.updateProfile({
        displayName: userDetails.name,
        // Only update email if it's different
        ...(user.email !== userDetails.email && { email: userDetails.email })
      });
  
      // Refresh user data
      setUserDetails(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
        isEmailVerified: user.emailVerified
      }));
  
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <Surface style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.section}>
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
