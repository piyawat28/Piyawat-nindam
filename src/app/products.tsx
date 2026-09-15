import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

interface Product {
  id: string;
  name: string;
  stock: number;
  stock_text: string;
  category: string;
  location_count: number;
  location_text: string;
  badge_status: string;
  image_url: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GITHUB_JSON_URL =
    'https://raw.githubusercontent.com/piyawat28/Piyawat-nindam/main/products.json';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(GITHUB_JSON_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isLowStock = item.badge_status === 'Low in stock';

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
        />

        <View style={styles.detail}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>Stock : </Text>
            {item.stock_text}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>Category : </Text>
            {item.category}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>Location : </Text>
            {item.location_text}
          </Text>

          <View style={styles.row}>
            <View
              style={[
                styles.badge,
                isLowStock ? styles.lowBadge : styles.activeBadge,
              ]}>
              <Text style={styles.badgeText}>
                {item.badge_status}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                console.log('กดแล้ว');

                router.push({
                  pathname: '/productDetail',
                  params: {
                    id: item.id,
                    name: item.name,
                    image: item.image_url,
                    stock: item.stock_text,
                    category: item.category,
                    location: item.location_text,
                    badge: item.badge_status,
                  },
                });
              }}>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },

  detail: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },

  text: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },

  bold: {
    fontWeight: 'bold',
    color: '#333',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#A855F7',
  },

  lowBadge: {
    backgroundColor: '#7E22CE',
  },

  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  arrowButton: {
    marginLeft: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    color: '#9333EA',
    fontSize: 20,
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});