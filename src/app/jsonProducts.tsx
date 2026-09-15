import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  stock_text: string;
  category: string;
  location_text: string;
  badge_status: string;
  image_url: any;
}

const getProductImage = (
  name: string,
  image: string
) => {
  // ถ้า Image เป็น URL ให้ใช้ URL โดยตรง
  if (
    image &&
    (image.startsWith('http://') ||
      image.startsWith('https://'))
  ) {
    return { uri: image };
  }

  // รูปเดิมใน assets/images ยังใช้ได้
  if (name === 'iPad Air') {
    return require('../../assets/images/ipad air.jpg');
  }

  if (name === 'MacBook Air') {
    return require('../../assets/images/macbook.jpg');
  }

  if (name === 'iPhone 15') {
    return require('../../assets/images/i15.jpg');
  }

  return null;
};

export default function JsonProducts() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [error, setError] =
    useState('');

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const API_URL =
    'http://119.59.102.161:3097/api/products';

  const role =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('role')
      : null;

  const IS_ADMIN = role === 'admin';

  useEffect(() => {
    fetchProducts('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = async (
    query: string
  ) => {
    try {
      setError('');

      const currentToken =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('token')
          : null;

      if (!currentToken) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const url =
        `${API_URL}?q=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        headers: {
          Authorization:
            `Bearer ${currentToken}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        setError('Session expired');

        if (Platform.OS === 'web') {
          window.location.href = '/login';
        }

        return;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP Error : ${response.status}`
        );
      }

      const data =
        await response.json();

      const items =
        Array.isArray(data)
          ? data
          : data.items || [];

      const mappedProducts: Product[] =
        items.map((item: any) => {
          const stock =
            Number(item.stock ?? 0);

          return {
            id: String(item.id),
            name: item.Name,
            price: Number(item.Price),
            stock: stock,
            stock_text:
              `Stock : ${stock}`,
            category: 'Product',
            location_text:
              item.Image || '',
            badge_status:
              stock > 0
                ? 'Available'
                : 'Out of stock',
            image_url:
              getProductImage(
                item.Name,
                item.Image || ''
              ),
          };
        });

      setProducts(mappedProducts);
    } catch (err: any) {
      console.log(err);

      setError(
        err.message ||
          'Cannot load products'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = (
    id: string,
    name: string
  ) => {
    const confirmDelete =
      async () => {
        try {
          setDeletingId(id);

          const currentToken =
            typeof localStorage !==
            'undefined'
              ? localStorage.getItem(
                  'token'
                )
              : null;

          if (!currentToken) {
            Alert.alert(
              'Error',
              'Please login first'
            );
            return;
          }

          const response =
            await fetch(
              `${API_URL}/${id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization:
                    `Bearer ${currentToken}`,
                },
              }
            );

          const data =
            await response.json();

          if (response.status === 401) {
            localStorage.removeItem(
              'token'
            );
            localStorage.removeItem(
              'role'
            );
            localStorage.removeItem(
              'username'
            );

            if (
              Platform.OS === 'web'
            ) {
              window.location.href =
                '/login';
            }

            return;
          }

          if (response.status === 403) {
            Alert.alert(
              'Access denied',
              'Admin access required'
            );
            return;
          }

          if (!response.ok) {
            Alert.alert(
              'Error',
              data.message ||
                'Failed to delete product'
            );
            return;
          }

          Alert.alert(
            'Success',
            'Product deleted successfully'
          );

          await fetchProducts(
            searchQuery
          );
        } catch (error) {
          console.log(error);

          Alert.alert(
            'Error',
            'Cannot connect to server'
          );
        } finally {
          setDeletingId(null);
        }
      };

    if (Platform.OS === 'web') {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${name}"?`
        );

      if (confirmed) {
        confirmDelete();
      }

      return;
    }

    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress:
            confirmDelete,
        },
      ]
    );
  };

  const renderItem = ({
    item,
  }: {
    item: Product;
  }) => {
    const isDeleting =
      deletingId === item.id;

    return (
      <View style={styles.card}>
        {item.image_url ? (
          <Image
            source={item.image_url}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.image,
              styles.noImage,
            ]}
          >
            <Text style={styles.noImageText}>
              No Image
            </Text>
          </View>
        )}

        <View style={styles.detail}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>
              Price :{' '}
            </Text>
            {item.price}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>
              Stock :{' '}
            </Text>
            {item.stock}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>
              Category :{' '}
            </Text>
            {item.category}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>
              Image :{' '}
            </Text>
            {item.location_text}
          </Text>

          <View style={styles.row}>
            <View
              style={[
                styles.badge,
                item.stock > 0
                  ? styles.activeBadge
                  : styles.lowBadge,
              ]}
            >
              <Text
                style={styles.badgeText}
              >
                {item.badge_status}
              </Text>
            </View>

            {IS_ADMIN && (
              <TouchableOpacity
                style={
                  styles.editButton
                }
                onPress={() => {
                  router.push({
                    pathname: '/edit',
                    params: {
                      id: item.id,
                      name: item.name,
                      price:
                        String(
                          item.price
                        ),
                      image:
                        item.location_text,
                      stock:
                        String(
                          item.stock
                        ),
                    },
                  });
                }}
                disabled={isDeleting}
              >
                <Text
                  style={styles.editText}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            )}

            {IS_ADMIN && (
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  isDeleting &&
                    styles.disabledButton,
                ]}
                onPress={() =>
                  deleteProduct(
                    item.id,
                    item.name
                  )
                }
                disabled={isDeleting}
              >
                <Text
                  style={
                    styles.deleteText
                  }
                >
                  {isDeleting
                    ? 'Deleting...'
                    : 'Delete'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={
                styles.arrowButton
              }
              onPress={() => {
                router.navigate({
                  pathname:
                    '/productDetail',
                  params: {
                    id: item.id,
                    name: item.name,
                    image:
                      item.image_url,
                    stock:
                      item.stock_text,
                    category:
                      item.category,
                    location:
                      item.location_text,
                    badge:
                      item.badge_status,
                  },
                });
              }}
              disabled={isDeleting}
            >
              <Text
                style={styles.arrow}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#8B5CF6"
        />

        <Text>
          Loading Products...
        </Text>
      </View>
    );
  }

  if (error !== '') {
    return (
      <View style={styles.center}>
        <Text
          style={{
            color: 'red',
            fontSize: 16,
          }}
        >
          {error}
        </Text>

        <TouchableOpacity
          style={
            styles.retryButton
          }
          onPress={() => {
            setLoading(true);
            fetchProducts(
              searchQuery
            );
          }}
        >
          <Text
            style={styles.retryText}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Text style={styles.header}>
        Products
      </Text>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={
          setSearchQuery
        }
        placeholder="Search products..."
        placeholderTextColor="#999"
        autoCorrect={false}
      />

      {products.length === 0 ? (
        <View style={styles.empty}>
          <Text
            style={styles.emptyText}
          >
            No products found
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View
              style={{ height: 15 }}
            />
          )}
          contentContainerStyle={{
            padding: 16,
          }}
        />
      )}
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

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 5,
    fontSize: 16,
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

  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageText: {
    color: '#999999',
    fontSize: 12,
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

  editButton: {
    marginLeft: 10,
    backgroundColor: '#8B5CF6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  editText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  deleteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },

  arrowButton: {
    marginLeft: 10,
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
    marginTop: -2,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});