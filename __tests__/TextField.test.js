import { Pressable, TextInput } from "react-native";
import { act, create } from "react-test-renderer";
import TextField from "../components/TextField";

// Los íconos cargan su fuente en segundo plano; para este test alcanza con saber cuál se muestra.
jest.mock("@expo/vector-icons", () => ({ Feather: ({ name }) => name }));

function render(props) {
  let renderer;
  act(() => {
    renderer = create(<TextField label="Contraseña" value="secreta123" onChangeText={() => {}} {...props} />);
  });
  return renderer.root;
}

const input = (root) => root.findByType(TextInput);
const eyeButtons = (root) => root.findAll((node) => node.type === Pressable && node.props.accessibilityRole === "button");

describe("TextField: mostrar u ocultar la contraseña", () => {
  it("un campo de contraseña empieza oculto y tiene el botón para mostrarla", () => {
    const root = render({ secureTextEntry: true });

    expect(input(root).props.secureTextEntry).toBe(true);
    expect(eyeButtons(root)).toHaveLength(1);
    expect(eyeButtons(root)[0].props.accessibilityLabel).toBe("Mostrar contraseña");
  });

  it("al tocar el ojo se ve la contraseña, y al tocarlo de nuevo se oculta", () => {
    const root = render({ secureTextEntry: true });

    act(() => eyeButtons(root)[0].props.onPress());
    expect(input(root).props.secureTextEntry).toBe(false);
    expect(eyeButtons(root)[0].props.accessibilityLabel).toBe("Ocultar contraseña");
    expect(eyeButtons(root)[0].findByProps({ name: "eye-off" })).toBeTruthy();

    act(() => eyeButtons(root)[0].props.onPress());
    expect(input(root).props.secureTextEntry).toBe(true);
    expect(eyeButtons(root)[0].props.accessibilityLabel).toBe("Mostrar contraseña");
  });

  it("un campo que no es de contraseña no tiene el botón", () => {
    const root = render({ label: "Email", value: "ana@example.com" });

    expect(input(root).props.secureTextEntry).toBe(false);
    expect(eyeButtons(root)).toHaveLength(0);
  });
});
