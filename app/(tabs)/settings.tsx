
// app/(tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, TextInput, Button, Portal, Dialog } from 'react-native-paper';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    email: '',
    businessName: '',
    isEmailVerified: false,
    isPhoneVerified: false
  });
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    const currentUser = auth?.currentUser;
    if (currentUser) {
      setUserDetails(prev => ({
        ...prev,
        email: currentUser.email || '',
        isEmailVerified: currentUser.emailVerified || false,
        name: currentUser.displayName || ''
      }));
    }
  }, []);

  const handleEmailVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await user.sendEmailVerification();
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      alert('Error sending verification email');
    }
  };

  const handlePhoneVerification = async () => {
    try {
      if (!userDetails.phone) {
        alert('Please enter a phone number');
        return;
      }

      const phoneNumber = userDetails.phone.startsWith('+91') 
        ? userDetails.phone 
        : `+91${userDetails.phone}`;

      if (!phoneNumber.match(/^\+91\d{10}$/)) {
        alert('Please enter a valid 10-digit Indian phone number');
        return;
      }

      // Initialize phone verification
      setShowOtpDialog(true);
    } catch (error) {
      alert('Error sending verification code');
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
      const user = auth.currentUser;
      if (user) {
        // Update profile logic here
        alert('Profile updated successfully');
      }
    } catch (error) {
      alert('Error updating profile');
    }
  };

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

        <TextInput
          label="Phone"
          value={userDetails.phone}
          onChangeText={(text) => setUserDetails(prev => ({
            ...prev, 
            phone: text.replace(/\D/g, '').slice(0, 10)
          }))}
          placeholder="Enter 10-digit mobile number"
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
          theme={{ colors: { primary: '#007BFF' }}}
          right={
            <TextInput.Icon 
              icon={userDetails.isPhoneVerified ? "check-circle" : "alert-circle"}
              color={userDetails.isPhoneVerified ? '#28a745' : '#dc3545'}
            />
          }
        />

        {!userDetails.isPhoneVerified && (
          <Button 
            mode="contained" 
            onPress={handlePhoneVerification}
            style={styles.verifyButton}
            buttonColor="#007BFF"
          >
            Verify Phone
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

      <Portal>
        <Dialog visible={showOtpDialog} onDismiss={() => setShowOtpDialog(false)}>
          <Dialog.Title>Enter Verification Code</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="OTP Code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              mode="outlined"
              theme={{ colors: { primary: '#007BFF' }}}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowOtpDialog(false)} textColor="#6c757d">
              Cancel
            </Button>
            <Button 
              onPress={() => {
                setShowOtpDialog(false);
              }} 
              textColor="#007BFF"
            >
              Verify
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
