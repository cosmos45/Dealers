import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth, signInWithGoogle, useGoogleSignIn } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007BFF',
  },
};

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const router = useRouter();
  const { promptAsync } = useGoogleSignIn();

  const validateIdentifier = (text) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;
    return emailPattern.test(text) || phonePattern.test(text);
  };

  const handleForgotPassword = async () => {
    try {
      if (!identifier) {
        alert('Please enter your email address');
        return;
      }
      
      if (!validateIdentifier(identifier)) {
        setIdentifierError('Please enter a valid email address');
        return;
      }
  
      await sendPasswordResetEmail(auth, identifier);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        alert('No account found with this email address');
      } else {
        alert(error.message);
      }
    }
  };

  const handleLogin = async () => {
    try {
      if (!validateIdentifier(identifier)) {
        setIdentifierError('Please enter a valid email');
        return;
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        alert('Please verify your email before logging in. A new verification email has been sent.');
        await signOut(auth);
        return;
      }
      
      router.replace('/(tabs)');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        alert('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        alert('Invalid password');
      } else {
        alert(error.message);
      }
    }
  };
  

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle(promptAsync);
      if (result?.user) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <Surface style={styles.container}>
        <Text style={styles.logo}>📱</Text>
        <Text style={styles.appName}>Dealers App</Text>

        <View style={styles.formContainer}>
          <TextInput
            label="Email or Phone Number"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setIdentifierError('');
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!identifierError}
          />
          {identifierError ? (
            <HelperText type="error" visible={!!identifierError}>
              {identifierError}
            </HelperText>
          ) : null}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye" : "eye-off"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button 
            mode="contained"
            onPress={handleLogin}
            style={[styles.loginButton, { backgroundColor: '#007BFF' }]}
            labelStyle={{ color: '#FFFFFF' }}
          >
            Login
          </Button>

          <Button 
            mode="contained"
            onPress={handleGoogleSignIn}
            style={[styles.googleButton, { backgroundColor: '#DB4437' }]}
            labelStyle={{ color: '#FFFFFF' }}
            icon="google"
          >
            Continue with Google
          </Button>

          <Button 
            mode="outlined"
            onPress={() => router.push('/(auth)/register')}
            style={[styles.registerButton, { borderColor: '#007BFF' }]}
            labelStyle={{ color: '#007BFF' }}
          >
            Register
          </Button>

          <Button 
  mode="text"
  onPress={handleForgotPassword}
  style={styles.forgotButton}
  labelStyle={{ color: '#6C757D' }}
>
  Forgot Password?
</Button>
        </View>
      </Surface>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 6,
  },
  googleButton: {
    marginBottom: 16,
    paddingVertical: 6,
  },
  registerButton: {
    marginBottom: 16,
    paddingVertical: 6,
  },
  forgotButton: {
    marginBottom: 16,
  }
});

export default LoginScreen;
