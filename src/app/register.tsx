import React, { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://119.59.102.161:3097';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [loading, setLoading] = useState(false);

  const showMessage = (
    title: string,
    message: string,
    onOk?: () => void
  ) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);

      if (onOk) {
        onOk();
      }
    } else {
      Alert.alert(title, message, [
        {
          text: 'OK',
          onPress: onOk,
        },
      ]);
    }
  };

  const register = async () => {
    if (loading) {
      return;
    }

    const cleanUsername = username.trim();

    if (!cleanUsername || !password || !confirmPassword) {
      showMessage(
        'Error',
        'Please enter username and password'
      );
      return;
    }

    if (cleanUsername.length < 3) {
      showMessage(
        'Error',
        'Username must be at least 3 characters'
      );
      return;
    }

    if (password.length < 4) {
      showMessage(
        'Error',
        'Password must be at least 4 characters'
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        'Error',
        'Passwords do not match'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: cleanUsername,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 409) {
        showMessage(
          'Register failed',
          'Username already exists'
        );

        setLoading(false);
        return;
      }

      if (!response.ok) {
        showMessage(
          'Register failed',
          data.message || 'Registration failed'
        );

        setLoading(false);
        return;
      }

      showMessage(
        'Success',
        'Registration successful',
        () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          } else {
            router.replace('/login');
          }
        }
      );
    } catch (error) {
      console.log(
        'REGISTER ERROR:',
        error
      );

      showMessage(
        'Error',
        'Cannot connect to server'
      );

      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>
          My Product Shop
        </Text>

        <Text style={styles.subtitle}>
          Create Account
        </Text>

        <Text style={styles.label}>
          Username
        </Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>
          Confirm Password
        </Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={register}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? 'Registering...'
              : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            router.replace('/login');
          }}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  box: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666666',
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#A855F7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  loginText: {
    color: '#A855F7',
    fontSize: 15,
    fontWeight: 'bold',
  },
});