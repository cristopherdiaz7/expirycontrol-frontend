import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthSwitch from "../components/AuthSwitch";
import CustomButton from "../components/customButton";
import FormMessage from "../components/FormMessage";
import TextField from "../components/TextField";
import { registerUser } from "../services/authService";
import { EMAIL_PATTERN } from "../utils/validation";

const MIN_PASSWORD_LENGTH = 6;

const benefits = [
  { icon: "user-check", text: "Tus productos son solo tuyos" },
  { icon: "clock", text: "Empieza en menos de un minuto" },
];

export default function RegisterScreen({ onRegister, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const change = (field, setter) => (value) => {
    setter(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!name.trim()) validationErrors.name = "Ingresa tu nombre.";
    if (!email.trim()) validationErrors.email = "Ingresa tu email.";
    else if (!EMAIL_PATTERN.test(email.trim())) validationErrors.email = "Ingresa un email válido.";
    if (!password) validationErrors.password = "Ingresa una contraseña.";
    else if (password.length < MIN_PASSWORD_LENGTH) validationErrors.password = `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    if (!confirmPassword) validationErrors.confirmPassword = "Repite la contraseña.";
    else if (password !== confirmPassword) validationErrors.confirmPassword = "Las contraseñas no coinciden.";

    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await registerUser({ name: name.trim(), email: email.trim(), password });
      if (onRegister) onRegister();
    } catch (error) {
      setFormError(error.message || "No se pudo crear la cuenta.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      kicker="Empieza con claridad"
      title="Un lugar más simple para cuidar tus productos."
      subtitle="Crea tu cuenta y convierte las fechas de vencimiento en decisiones sencillas."
      benefits={benefits}
      cardTitle="Crear cuenta"
      cardSubtitle="Solo necesitaremos unos datos."
    >
      <FormMessage message={formError} />
      <TextField label="Nombre" icon="user" value={name} onChangeText={change("name", setName)} placeholder="Tu nombre" autoCapitalize="words" error={errors.name} />
      <TextField label="Email" icon="mail" value={email} onChangeText={change("email", setEmail)} placeholder="nombre@ejemplo.com" keyboardType="email-address" error={errors.email} />
      <TextField label="Contraseña" icon="lock" value={password} onChangeText={change("password", setPassword)} placeholder="Mínimo 6 caracteres" secureTextEntry error={errors.password} />
      <TextField label="Confirmar contraseña" icon="lock" value={confirmPassword} onChangeText={change("confirmPassword", setConfirmPassword)} placeholder="Repite tu contraseña" secureTextEntry error={errors.confirmPassword} />
      <CustomButton title={loading ? "Creando cuenta..." : "Crear cuenta"} icon={loading ? undefined : "user-plus"} onPress={handleSubmit} disabled={loading} />
      <AuthSwitch prompt="¿Ya tienes una cuenta?" linkText="Volver al login" onPress={onCancel} />
    </AuthLayout>
  );
}
