import { apiRequest } from "../services/api";
import { changePassword, loginUser, registerUser } from "../services/authService";

jest.mock("../services/api", () => ({ apiRequest: jest.fn() }));

describe("authService", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it("registro envía los datos sin token", () => {
    const data = { name: "Ana", email: "ana@example.com", password: "secreta123" };
    registerUser(data);

    expect(apiRequest).toHaveBeenCalledWith("/register", { method: "POST", data });
  });

  it("login envía email y contraseña sin token", () => {
    const data = { email: "ana@example.com", password: "secreta123" };
    loginUser(data);

    expect(apiRequest).toHaveBeenCalledWith("/login", { method: "POST", data });
  });

  it("cambio de contraseña usa PUT con el token de la sesión", () => {
    const data = { currentPassword: "secreta123", newPassword: "nueva456" };
    changePassword("token-de-prueba", data);

    expect(apiRequest).toHaveBeenCalledWith("/account/password", { method: "PUT", token: "token-de-prueba", data });
  });
});
