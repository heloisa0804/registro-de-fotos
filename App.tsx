import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useRef, useState, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Precisamos da localização para continuar"
        );
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nós precisamos da sua permissão da câmera
        </Text>
        <Button onPress={requestPermission} title="Dar permissão" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePhoto() {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
    }
  }

  async function getLocation() {
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App 1 - Fotos de lugares visitados</Text>

      <View style={styles.photoBox}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        )}
      </View>

      <TextInput
        placeholder="Digite algo sobre a foto/local..."
        style={styles.input}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={takePhoto}>
          <Text style={styles.btnText}>Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={getLocation}>
          <Text style={styles.btnText}>Localizar no mapa</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        region={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                latitude: -23.5505,
                longitude: -46.6333,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
        }
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Minha Localização"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f7fb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1e3a8a",
  },
  photoBox: {
    width: "100%",
    height: 200,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  input: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    padding: 14,
    marginHorizontal: 6,
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    fontWeight: "bold",
    color: "#fff",
  },
  map: {
    flex: 1,
    width: "100%",
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "#475569",
  },
});
