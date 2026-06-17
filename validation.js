export const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && email.includes('@gmail.com');
};

export const validatePassword = (password) => {
    return password.length >= 8;
};