# OmniDrive Login System

A multi-role login system for the OmniDrive vehicle marketplace with password visibility toggle.

## Features

- **Multi-User Type Selection**: Client, Dealer, Technical Liaison, Admin roles
- **Password Visibility Toggle**: Click the 🔒 icon to show/hide password and verify input
- **Interactive Login Form**: Username and password fields with validation
- **Sign Up Functionality**: Register new users with email, username, and password
- **Forget Password**: Reset password functionality with email verification
- **Responsive Design**: Modern glassmorphism UI with backdrop blur effects
- **Local Storage**: User data stored locally in the browser

## User Types

| Type | Role | Access |
|------|------|--------|
| Client | Vehicle buyer | Browse & purchase vehicles |
| Dealer | Dealership owner | Manage dealership inventory |
| Technical Liaison | Trading partner | Connect buyers & sellers |
| Admin | Platform manager | Full system access |

## Password Visibility Feature

The password field includes a toggle button:
- 🔒 Click to show password (changes to 🔓)
- 🔓 Click to hide password (changes back to 🔒)
- Hover tooltip indicates current action
- Available on login, sign up, and confirm password fields

## How to Use

1. Select your user type (Client, Dealer, Technical Liaison, or Admin)
2. Enter username/email and password
3. Use the password toggle to verify your input if needed
4. Click Login to access your dashboard
5. Use "Sign up" to create a new account
6. Use "Forget Password?" to reset your password

## Technologies Used

- HTML5
- CSS3 (with backdrop-filter for glassmorphism)
- JavaScript (ES6+)
- Font Awesome for icons

## Browser Support

- Chrome 76+
- Firefox 70+
- Safari 9+
- Edge 17+

*(For backdrop-filter support)*

## Development

This is a frontend-only authentication using localStorage. In production, integrate with backend API for proper authentication and database storage.

## License

MIT License