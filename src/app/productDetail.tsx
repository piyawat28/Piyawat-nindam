import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ProductDetail() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    image?: string;
    stock?: string;
    category?: string;
    location?: string;
    badge?: string;
  }>();

  return (
    <View style={styles.container}>
      {params.image ? (
        <Image
          source={{ uri: params.image }}
          style={styles.image}
        />
      ) : null}

      <Text style={styles.title}>
        {params.name || 'PRODUCT DETAIL'}
      </Text>

      <Text style={styles.text}>
        ID : {params.id || '-'}
      </Text>

      <Text style={styles.text}>
        Price : {params.stock || '-'}
      </Text>

      <Text style={styles.text}>
        Category : {params.category || '-'}
      </Text>

      <Text style={styles.text}>
        Image : {params.location || '-'}
      </Text>

      <Text style={styles.badge}>
        {params.badge || '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  image: {
    width: 180,
    height: 180,
    borderRadius: 15,
    backgroundColor: '#EEEEEE',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },

  badge: {
    marginTop: 10,
    backgroundColor: '#A855F7',
    color: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    fontWeight: 'bold',
  },
});