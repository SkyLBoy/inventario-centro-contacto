// validators.js - Funciones de validación para usuarios

import { VALIDATION_RULES, ERROR_MESSAGES } from './constants.js';

/**
 * Valida si un campo es requerido y no está vacío
 * @param {string} value - Valor a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateRequired = (value) => {
  if (!value || !value.toString().trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  return null;
};

/**
 * Valida el formato del email
 * @param {string} email - Email a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateEmail = (email) => {
  const requiredError = validateRequired(email);
  if (requiredError) return requiredError;

  if (!VALIDATION_RULES.EMAIL_REGEX.test(email.trim())) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

/**
 * Valida el nombre de usuario
 * @param {string} username - Username a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateUsername = (username) => {
  const requiredError = validateRequired(username);
  if (requiredError) return requiredError;

  if (username.trim().length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
    return ERROR_MESSAGES.USERNAME_TOO_SHORT;
  }
  return null;
};

/**
 * Valida la contraseña
 * @param {string} password - Contraseña a validar
 * @param {boolean} isRequired - Si la contraseña es requerida (false para edición)
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePassword = (password, isRequired = true) => {
  if (isRequired) {
    const requiredError = validateRequired(password);
    if (requiredError) return requiredError;
  }

  if (password && password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }
  return null;
};

/**
 * Valida el nombre completo
 * @param {string} name - Nombre a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateName = (name) => {
  return validateRequired(name);
};

/**
 * Valida todos los campos de un formulario de usuario
 * @param {Object} formData - Datos del formulario
 * @param {boolean} isEditing - Si es modo edición (la contraseña es opcional)
 * @returns {Object} - Objeto con errores por campo
 */
export const validateUserForm = (formData, isEditing = false) => {
  const errors = {};

  // Validar nombre completo
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  // Validar username
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;

  // Validar email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  // Validar contraseña (requerida solo en creación)
  const passwordError = validatePassword(formData.password, !isEditing);
  if (passwordError) errors.password = passwordError;

  return errors;
};

/**
 * Verifica si hay errores en un objeto de validación
 * @param {Object} errors - Objeto con errores
 * @returns {boolean} - True si hay errores
 */
export const hasValidationErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Valida un número de teléfono básico
 * @param {string} phone - Teléfono a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePhone = (phone) => {
  const requiredError = validateRequired(phone);
  if (requiredError) return requiredError;

  // Validación básica de teléfono (puede contener números, espacios, guiones, paréntesis y +)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(phone.trim())) {
    return 'Formato de teléfono inválido';
  }
  return null;
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {string|null} - Mensaje de error o null si son iguales
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
};