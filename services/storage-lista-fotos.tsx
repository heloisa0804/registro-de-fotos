import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

export default function PlacesApp() {
  const [places, setPlaces] = useState<any[]>([]);

  // Carregar lugares salvos
  useEffect(() => {
    const loadPlaces = async () => {
      const stored = await AsyncStorage.getItem("places");
      if (stored) setPlaces(JSON.parse(stored));
    };
    loadPlaces();
  }, []);

  // Função para pegar localização atual
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita acesso à localização!");
      return null;
    }
    const location = await Location.getCurrentPositionAsync({});
    return location;
  };

  // Função para escolher uma foto
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  // Salvar um novo lugar
  const savePlace = async () => {
    try {
      const photoUri = await pickImage();
      if (!photoUri) return;

      const location = await getLocation();
      if (!location) return;

      const description = `Lugar em ${new Date().toLocaleDateString()}`;

      const newPlace = {
        id: Date.now().toString(),
        photo: photoUri,
        description,
        coords: location.coords,
      };

      const stored = await AsyncStorage.getItem("places");
      const updatedPlaces = stored ? JSON.parse(stored) : [];
      updatedPlaces.push(newPlace);

      await AsyncStorage.setItem("places", JSON.stringify(updatedPlaces));
      setPlaces(updatedPlaces);

      Alert.alert("Sucesso", "Lugar salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares Visitados</Text>
      <Button title="Adicionar Lugar" onPress={savePlace} />
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.photo }} style={styles.image} />
            <Text style={styles.text}>{item.description}</Text>
            <Text style={styles.coords}>
              {item.coords.latitude.toFixed(4)},{" "}
              {item.coords.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 10,
  },
  image: { width: "100%", height: 180, borderRadius: 8 },
  text: { marginTop: 8, fontSize: 16, fontWeight: "500" },
  coords: { fontSize: 12, color: "#555" },
});
