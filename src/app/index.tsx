import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Product Shop</Text>

      <Image
        source={{
          uri: 'https://picsum.photos/250',
        }}
        style={styles.image}
      />

      <Text style={styles.text}>
        Welcome to My Product App
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/jsonProducts')}
      >
        <Text style={styles.buttonText}>View Products</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },

  text: {
    fontSize: 18,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});