import { validatePasswordChange } from "../components/ChangePasswordForm";

const valid = { currentPassword: "secreta123", newPassword: "nueva456", confirmPassword: "nueva456" };

describe("validatePasswordChange", () => {
  it("acepta un formulario completo y correcto", () => {
    expect(validatePasswordChange(valid)).toEqual({});
  });

  it("pide los tres campos", () => {
    const errors = validatePasswordChange({ currentPassword: "", newPassword: "", confirmPassword: "" });

    expect(errors.currentPassword).toBe("Ingresa tu contraseña actual.");
    expect(errors.newPassword).toBe("Ingresa la nueva contraseña.");
    expect(errors.confirmPassword).toBe("Repite la nueva contraseña.");
  });

  it("exige al menos 6 caracteres en la nueva", () => {
    const errors = validatePasswordChange({ ...valid, newPassword: "12345", confirmPassword: "12345" });

    expect(errors.newPassword).toBe("Debe tener al menos 6 caracteres.");
  });

  it("rechaza una nueva igual a la actual", () => {
    const errors = validatePasswordChange({ ...valid, newPassword: "secreta123", confirmPassword: "secreta123" });

    expect(errors.newPassword).toBe("Debe ser distinta de la actual.");
  });

  it("controla que la confirmación coincida", () => {
    const errors = validatePasswordChange({ ...valid, confirmPassword: "otra4567" });

    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden.");
  });
});
