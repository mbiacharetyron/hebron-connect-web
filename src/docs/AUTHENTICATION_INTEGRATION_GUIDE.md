# Hebron Connect Authentication - Integration Guide

This guide provides practical code examples for integrating Hebron Connect authentication into your mobile or web application.

## Table of Contents
1. [Setup](#setup)
2. [JavaScript/TypeScript Examples](#javascripttypescript-examples)
3. [React Native Examples](#react-native-examples)
4. [Flutter/Dart Examples](#flutterdart-examples)
5. [Swift/iOS Examples](#swiftios-examples)
6. [Kotlin/Android Examples](#kotlinandroid-examples)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)

---

## Setup

### Base Configuration

```javascript
const API_BASE_URL = 'https://api.hebronconnect.com/api/v1';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// For authenticated requests
const authHeaders = (token) => ({
  ...headers,
  'Authorization': `Bearer ${token}`
});
```

---

## JavaScript/TypeScript Examples

### Authentication Service Class

```typescript
// auth.service.ts

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  profile_image_thumbnail?: string;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
  code: number;
}

class AuthService {
  private baseUrl = 'https://api.hebronconnect.com/api/v1';
  private token: string | null = null;

  // Store token securely
  private saveToken(token: string): void {
    this.token = token;
    // For web: Use secure httpOnly cookies or sessionStorage
    sessionStorage.setItem('auth_token', token);
    // For mobile: Use secure storage (Keychain/Keystore)
  }

  private getToken(): string | null {
    if (!this.token) {
      this.token = sessionStorage.getItem('auth_token');
    }
    return this.token;
  }

  private clearToken(): void {
    this.token = null;
    sessionStorage.removeItem('auth_token');
  }

  // Check availability
  async checkAvailability(phone: string, email: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ phone, email })
    });

    if (response.ok) {
      return true;
    }

    const error: ApiError = await response.json();
    throw new Error(error.message);
  }

  // Send OTP
  async sendOTP(identifier: string, type: 'phone' | 'email'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ identifier, type })
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }
  }

  // Verify OTP
  async verifyOTP(
    otp: string, 
    identifier: string, 
    type: 'phone' | 'email'
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ otp, identifier, type })
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data.data.verification_token;
  }

  // Register
  async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    identifier_type: 'phone' | 'email';
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result: AuthResponse = await response.json();
    this.saveToken(result.data.token);
    return result;
  }

  // Login
  async login(
    login: string, 
    password: string,
    deviceInfo?: {
      device_token?: string;
      device_type?: string;
      device_id?: string;
      device_name?: string;
      device_model?: string;
      os_version?: string;
      app_version?: string;
      lang?: string;
    }
  ): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        login,
        password,
        ...deviceInfo
      })
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result: AuthResponse = await response.json();
    this.saveToken(result.data.token);
    return result;
  }

  // Logout
  async logout(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    this.clearToken();

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }
  }

  // Logout from all devices
  async logoutAllDevices(): Promise<number> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/auth/logout-all-devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    this.clearToken();

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    return result.data.devices_logged_out;
  }

  // Get profile
  async getProfile(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    return result.data.user;
  }

  // Update profile
  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    profile_image?: File;
  }): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No active session');
    }

    const formData = new FormData();
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.profile_image) formData.append('profile_image', data.profile_image);

    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    return result.data.user;
  }

  // Forgot password
  async forgotPassword(contact: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ contact })
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }
  }

  // Reset password
  async resetPassword(
    contact: string,
    otp: string,
    password: string,
    password_confirmation: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ contact, otp, password, password_confirmation })
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }
  }

  // Change password
  async changePassword(
    current_password: string,
    new_password: string,
    new_password_confirmation: string
  ): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        current_password, 
        new_password, 
        new_password_confirmation 
      })
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

// Export singleton instance
export const authService = new AuthService();
```

### Usage Examples

```typescript
// Registration flow
async function handleRegistration() {
  try {
    // 1. Check availability
    await authService.checkAvailability('+237123456789', 'john@example.com');
    
    // 2. Send OTP
    await authService.sendOTP('+237123456789', 'phone');
    
    // 3. Verify OTP (get verification token)
    const verificationToken = await authService.verifyOTP(
      '123456', 
      '+237123456789', 
      'phone'
    );
    
    // 4. Complete registration
    const result = await authService.register({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+237123456789',
      password: 'SecurePass123!',
      password_confirmation: 'SecurePass123!',
      identifier_type: 'phone'
    });
    
    console.log('Registration successful:', result.data.user);
    // Token is automatically saved
    
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

// Login flow
async function handleLogin() {
  try {
    const result = await authService.login(
      'john@example.com',
      'SecurePass123!',
      {
        device_token: 'fcm_token_here',
        device_type: 'web',
        device_name: 'Chrome Browser',
        device_model: 'Chrome 118',
        os_version: 'Windows 11',
        app_version: '1.0.0',
        lang: 'en'
      }
    );
    
    console.log('Login successful:', result.data.user);
    
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// Password reset flow
async function handlePasswordReset() {
  try {
    // 1. Request OTP
    await authService.forgotPassword('john@example.com');
    console.log('OTP sent to email');
    
    // 2. Reset password with OTP
    await authService.resetPassword(
      'john@example.com',
      '123456',
      'NewSecurePass123!',
      'NewSecurePass123!'
    );
    
    console.log('Password reset successful');
    
  } catch (error) {
    console.error('Password reset failed:', error.message);
  }
}
```

---

## React Native Examples

### Using React Hooks and Context

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'https://api.hebronconnect.com/api/v1';

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Get FCM token
      const fcmToken = await messaging().getToken();
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          login: email,
          password,
          device_token: fcmToken,
          device_type: Platform.OS,
          device_name: `${Platform.OS === 'ios' ? 'iPhone' : 'Android'} Device`,
          app_version: '1.0.0',
          lang: 'en'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      
      // Store auth data
      await AsyncStorage.setItem('auth_token', result.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
      
      setToken(result.data.token);
      setUser(result.data.user);
      
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }
      
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const register = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      
      await AsyncStorage.setItem('auth_token', result.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
      
      setToken(result.data.token);
      setUser(result.data.user);
      
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Login Screen Component

```typescript
// LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useAuth } from './AuthContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigation handled by auth state change
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email or Phone"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button 
        title={loading ? 'Logging in...' : 'Login'} 
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};
```

---

## Flutter/Dart Examples

### Authentication Service

```dart
// auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class User {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String? profileImage;
  
  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    this.profileImage,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      email: json['email'],
      phone: json['phone'],
      profileImage: json['profile_image'],
    );
  }
}

class AuthService {
  static const String _baseUrl = 'https://api.hebronconnect.com/api/v1';
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  
  String? _token;
  User? _user;
  
  // Get stored token
  Future<String?> getToken() async {
    if (_token != null) return _token;
    
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    return _token;
  }
  
  // Save token
  Future<void> _saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }
  
  // Clear token
  Future<void> _clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
  
  // Login
  Future<User> login(String login, String password) async {
    final fcmToken = await FirebaseMessaging.instance.getToken();
    
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        'login': login,
        'password': password,
        'device_token': fcmToken,
        'device_type': 'android', // or 'ios'
        'device_name': 'Flutter Device',
        'app_version': '1.0.0',
        'lang': 'en',
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveToken(data['data']['token']);
      _user = User.fromJson(data['data']['user']);
      return _user!;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Login failed');
    }
  }
  
  // Register
  Future<User> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
    required String passwordConfirmation,
    required String identifierType,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'phone': phone,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'identifier_type': identifierType,
      }),
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await _saveToken(data['data']['token']);
      _user = User.fromJson(data['data']['user']);
      return _user!;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Registration failed');
    }
  }
  
  // Logout
  Future<void> logout() async {
    final token = await getToken();
    if (token == null) return;
    
    await http.post(
      Uri.parse('$_baseUrl/auth/logout'),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );
    
    await _clearToken();
    _user = null;
  }
  
  // Get Profile
  Future<User> getProfile() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');
    
    final response = await http.get(
      Uri.parse('$_baseUrl/auth/profile'),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _user = User.fromJson(data['data']['user']);
      return _user!;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Failed to get profile');
    }
  }
  
  // Check if authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }
}
```

### Usage in Flutter

```dart
// login_page.dart
import 'package:flutter/material.dart';
import 'auth_service.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  
  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }
    
    setState(() => _loading = true);
    
    try {
      final user = await _authService.login(
        _emailController.text,
        _passwordController.text,
      );
      
      // Navigate to home screen
      Navigator.pushReplacementNamed(context, '/home');
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: ${e.toString()}')),
      );
    } finally {
      setState(() => _loading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email or Phone'),
              keyboardType: TextInputType.emailAddress,
            ),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loading ? null : _handleLogin,
              child: Text(_loading ? 'Logging in...' : 'Login'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Swift/iOS Examples

### Authentication Manager

```swift
// AuthManager.swift
import Foundation
import FirebaseMessaging

struct User: Codable {
    let id: Int
    let firstName: String
    let lastName: String
    let email: String
    let phone: String
    let profileImage: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case firstName = "first_name"
        case lastName = "last_name"
        case email
        case phone
        case profileImage = "profile_image"
    }
}

struct AuthResponse: Codable {
    let status: String
    let message: String
    let data: AuthData
    
    struct AuthData: Codable {
        let token: String
        let user: User
    }
}

class AuthManager {
    static let shared = AuthManager()
    private let baseURL = "https://api.hebronconnect.com/api/v1"
    private let tokenKey = "auth_token"
    
    var token: String? {
        get { UserDefaults.standard.string(forKey: tokenKey) }
        set { UserDefaults.standard.set(newValue, forKey: tokenKey) }
    }
    
    var isAuthenticated: Bool {
        return token != nil
    }
    
    // Login
    func login(login: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/auth/login") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Get FCM token
        Messaging.messaging().token { fcmToken, error in
            let body: [String: Any] = [
                "login": login,
                "password": password,
                "device_token": fcmToken ?? "",
                "device_type": "ios",
                "device_name": UIDevice.current.name,
                "device_model": UIDevice.current.model,
                "os_version": UIDevice.current.systemVersion,
                "app_version": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0",
                "lang": "en"
            ]
            
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                
                guard let data = data else {
                    completion(.failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                    return
                }
                
                do {
                    let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
                    self.token = authResponse.data.token
                    completion(.success(authResponse.data.user))
                } catch {
                    completion(.failure(error))
                }
            }.resume()
        }
    }
    
    // Logout
    func logout(completion: @escaping (Result<Void, Error>) -> Void) {
        guard let token = token,
              let url = URL(string: "\(baseURL)/auth/logout") else { 
            self.token = nil
            completion(.success(()))
            return 
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        URLSession.shared.dataTask(with: request) { _, response, error in
            self.token = nil
            
            if let error = error {
                completion(.failure(error))
            } else {
                completion(.success(()))
            }
        }.resume()
    }
    
    // Get Profile
    func getProfile(completion: @escaping (Result<User, Error>) -> Void) {
        guard let token = token,
              let url = URL(string: "\(baseURL)/auth/profile") else {
            completion(.failure(NSError(domain: "", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            do {
                let decoder = JSONDecoder()
                let response = try decoder.decode(AuthResponse.self, from: data)
                completion(.success(response.data.user))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}
```

### Usage in SwiftUI

```swift
// LoginView.swift
import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        VStack(spacing: 20) {
            TextField("Email or Phone", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            Button(action: handleLogin) {
                if isLoading {
                    ProgressView()
                } else {
                    Text("Login")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading)
        }
        .padding()
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private func handleLogin() {
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please enter email and password"
            showError = true
            return
        }
        
        isLoading = true
        
        AuthManager.shared.login(login: email, password: password) { result in
            DispatchQueue.main.async {
                isLoading = false
                
                switch result {
                case .success(let user):
                    print("Login successful: \(user.firstName)")
                    // Navigate to home screen
                    
                case .failure(let error):
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}
```

---

## Kotlin/Android Examples

### Authentication Repository

```kotlin
// AuthRepository.kt
import android.content.Context
import android.content.SharedPreferences
import com.google.firebase.messaging.FirebaseMessaging
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

data class User(
    val id: Int,
    val first_name: String,
    val last_name: String,
    val email: String,
    val phone: String,
    val profile_image: String?
)

data class AuthResponse(
    val status: String,
    val message: String,
    val data: AuthData
)

data class AuthData(
    val token: String,
    val user: User
)

class AuthRepository(private val context: Context) {
    private val baseUrl = "https://api.hebronconnect.com/api/v1"
    private val client = OkHttpClient()
    private val gson = Gson()
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
    
    private val tokenKey = "auth_token"
    
    var token: String?
        get() = prefs.getString(tokenKey, null)
        set(value) {
            prefs.edit().putString(tokenKey, value).apply()
        }
    
    val isAuthenticated: Boolean
        get() = token != null
    
    // Login
    suspend fun login(login: String, password: String): Result<User> = withContext(Dispatchers.IO) {
        try {
            val fcmToken = FirebaseMessaging.getInstance().token.await()
            
            val requestBody = mapOf(
                "login" to login,
                "password" to password,
                "device_token" to fcmToken,
                "device_type" to "android",
                "device_name" to android.os.Build.MODEL,
                "device_model" to android.os.Build.MANUFACTURER,
                "os_version" to android.os.Build.VERSION.RELEASE,
                "app_version" to "1.0.0",
                "lang" to "en"
            )
            
            val json = gson.toJson(requestBody)
            val body = json.toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$baseUrl/auth/login")
                .post(body)
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .build()
            
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            
            if (response.isSuccessful && responseBody != null) {
                val authResponse = gson.fromJson(responseBody, AuthResponse::class.java)
                token = authResponse.data.token
                Result.success(authResponse.data.user)
            } else {
                Result.failure(Exception(responseBody ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Logout
    suspend fun logout(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val currentToken = token ?: return@withContext Result.success(Unit)
            
            val request = Request.Builder()
                .url("$baseUrl/auth/logout")
                .post("".toRequestBody())
                .addHeader("Authorization", "Bearer $currentToken")
                .addHeader("Accept", "application/json")
                .build()
            
            client.newCall(request).execute()
            token = null
            Result.success(Unit)
        } catch (e: Exception) {
            token = null
            Result.failure(e)
        }
    }
    
    // Get Profile
    suspend fun getProfile(): Result<User> = withContext(Dispatchers.IO) {
        try {
            val currentToken = token 
                ?: return@withContext Result.failure(Exception("Not authenticated"))
            
            val request = Request.Builder()
                .url("$baseUrl/auth/profile")
                .get()
                .addHeader("Authorization", "Bearer $currentToken")
                .addHeader("Accept", "application/json")
                .build()
            
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string()
            
            if (response.isSuccessful && responseBody != null) {
                val authResponse = gson.fromJson(responseBody, AuthResponse::class.java)
                Result.success(authResponse.data.user)
            } else {
                Result.failure(Exception(responseBody ?: "Failed to get profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### Usage in Android Activity/Fragment

```kotlin
// LoginActivity.kt
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var authRepository: AuthRepository
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        authRepository = AuthRepository(this)
        
        // Setup UI
        val emailEditText = findViewById<EditText>(R.id.emailEditText)
        val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        val loginButton = findViewById<Button>(R.id.loginButton)
        
        loginButton.setOnClickListener {
            val email = emailEditText.text.toString()
            val password = passwordEditText.text.toString()
            
            if (email.isNotEmpty() && password.isNotEmpty()) {
                handleLogin(email, password)
            } else {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun handleLogin(email: String, password: String) {
        lifecycleScope.launch {
            val result = authRepository.login(email, password)
            
            result.onSuccess { user ->
                Toast.makeText(
                    this@LoginActivity,
                    "Welcome ${user.first_name}!",
                    Toast.LENGTH_SHORT
                ).show()
                
                // Navigate to main activity
                startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                finish()
            }
            
            result.onFailure { error ->
                Toast.makeText(
                    this@LoginActivity,
                    "Login failed: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}
```

---

## Error Handling

### Generic Error Handler

```typescript
interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
  code: number;
}

class ErrorHandler {
  static handle(error: any): string {
    // Network errors
    if (error.message === 'Network request failed' || 
        error.message === 'Failed to fetch') {
      return 'Network error. Please check your internet connection.';
    }
    
    // Timeout errors
    if (error.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    // API errors
    if (error.response) {
      const apiError = error.response.data as ApiError;
      
      // Validation errors
      if (apiError.errors) {
        return Object.values(apiError.errors).flat().join(', ');
      }
      
      // General API error
      return apiError.message || 'An error occurred';
    }
    
    // Generic errors
    return error.message || 'An unexpected error occurred';
  }
}

// Usage
try {
  await authService.login(email, password);
} catch (error) {
  const errorMessage = ErrorHandler.handle(error);
  console.error(errorMessage);
  // Show error to user
}
```

---

## Security Considerations

### 1. Token Storage

**✅ Best Practices**:
```typescript
// React Native - Use secure storage
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('auth_token', token);
const token = await SecureStore.getItemAsync('auth_token');
```

```swift
// iOS - Use Keychain
import KeychainSwift

let keychain = KeychainSwift()
keychain.set(token, forKey: "auth_token")
let token = keychain.get("auth_token")
```

```kotlin
// Android - Use EncryptedSharedPreferences
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val sharedPreferences = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

### 2. SSL Pinning (Recommended)

```typescript
// React Native
import { fetch } from 'react-native-ssl-pinning';

const response = await fetch('https://api.hebronconnect.com/api/v1/auth/login', {
  method: 'POST',
  pkPinning: true,
  sslPinning: {
    certs: ['certificate']  // Add your SSL certificate
  }
});
```

### 3. Request Timeout

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);  // 30 seconds

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ... other options
  });
} finally {
  clearTimeout(timeoutId);
}
```

### 4. Biometric Authentication (Optional)

```typescript
// React Native
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to login'
    });
    
    return result.success;
  }
  
  return false;
};
```

---

## Summary

This integration guide provides comprehensive examples for implementing Hebron Connect authentication across various platforms:

- **Web**: JavaScript/TypeScript with fetch API
- **React Native**: Using Context API and AsyncStorage
- **Flutter**: Using http package and SharedPreferences
- **iOS**: Using URLSession and Keychain
- **Android**: Using OkHttp and EncryptedSharedPreferences

### Key Points:
1. Always use HTTPS for API requests
2. Store tokens securely (Keychain/Keystore/SecureStore)
3. Include device information for security features
4. Implement proper error handling
5. Handle network failures gracefully
6. Clear tokens on logout
7. Implement SSL pinning for production apps

For complete API documentation, visit:
- **Full Documentation**: [AUTHENTICATION_DOCUMENTATION.md](./AUTHENTICATION_DOCUMENTATION.md)
- **Quick Reference**: [AUTHENTICATION_QUICK_REFERENCE.md](./AUTHENTICATION_QUICK_REFERENCE.md)
- **Swagger UI**: https://api.hebronconnect.com/api/docs

---

**Last Updated**: October 24, 2025

