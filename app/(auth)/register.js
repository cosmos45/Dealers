import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007BFF',
  },
};

const RegistrationScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validateIdentifier = (text) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;
    return emailPattern.test(text) || phonePattern.test(text);
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      if (!validateIdentifier(identifier)) {
        setIdentifierError('Please enter a valid email or phone number');
        return;
      }
      
      if (!validatePasswords()) {
        return;
      }

      const emailToUse = identifier.includes('@') 
        ? identifier 
        : `${identifier}@yourdomain.com`;
        
      await createUserWithEmailAndPassword(auth, emailToUse, password);
      router.replace('/(tabs)');
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
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            error={!!passwordError}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye" : "eye-off"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setPasswordError('');
            }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            error={!!passwordError}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye" : "eye-off"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          
          {passwordError ? (
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>
          ) : null}

          <Button 
            mode="contained"
            onPress={handleRegister}
            style={[styles.registerButton, { backgroundColor: '#007BFF' }]}
            labelStyle={{ color: '#FFFFFF' }}
          >
            Register
          </Button>

          <Button 
            mode="outlined"
            onPress={() => router.push('/(auth)/login')}
            style={[styles.loginButton, { borderColor: '#007BFF' }]}
            labelStyle={{ color: '#007BFF' }}
          >
            Back to Login
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
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 6,
  },
  loginButton: {
    marginBottom: 16,
    paddingVertical: 6,
  }
});

export default RegistrationScreen;
