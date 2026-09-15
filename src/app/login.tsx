import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://119.59.102.161:3097';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    console.log('LOGIN BUTTON CLICKED');

    if (loading) return;

    if (!username.trim() || !password.trim()) {
      Alert.alert(
        'Error',
        'Please enter username and password'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('Sending login request...');

      const response = await fetch(
        `${API_URL}/api/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      console.log('Login status:', response.status);

      const data = await response.json();

      console.log('Login response:', data);

      if (!response.ok) {
        Alert.alert(
          'Login failed',
          data.message ||
            'Invalid username or password'
        );

        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem(
          'token',
          data.token
        );

        localStorage.setItem(
          'role',
          data.user?.role || ''
        );

        localStorage.setItem(
          'username',
          data.user?.username || username.trim()
        );
      }

      setLoading(false);

      if (typeof window !== 'undefined') {
        window.location.href = '/jsonProducts';
      } else {
        router.replace('/jsonProducts');
      }

    } catch (error) {
      console.log(
        'LOGIN ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Cannot connect to server'
      );

      setLoading(false);
    }
  };

  const goToRegister = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/register';
    } else {
      router.push('/register');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>

        <Text style={styles.title}>
          My Product Shop
        </Text>

        <Text style={styles.subtitle}>
          Login
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
          autoCorrect={false}
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
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading && styles.disabledButton,
          ]}
          onPress={login}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading
              ? 'Logging in...'
              : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={goToRegister}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.registerText}>
            Don't have an account? Register
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
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111111',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 22,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 35,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },

  loginButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#A855F7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  registerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    paddingVertical: 10,
  },

  registerText: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});