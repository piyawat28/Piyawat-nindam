import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type EditableProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  location_text: string;
  badge_status: string;
  image_url: string;
};

type AddProductScreenProps = {
  existingCategories?: string[];
  product?: EditableProduct | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const API_URL =
  'http://119.59.102.161:3097';

export default function AddProductScreen({
  product = null,
  onSuccess,
  onCancel,
}: AddProductScreenProps) {
  const isEditMode =
    product !== null;

  const [name, setName] =
    useState('');

  const [price, setPrice] =
    useState('');

  const [image, setImage] =
    useState('');

  const [stock, setStock] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');

      setPrice(
        product.price !== undefined
          ? String(product.price)
          : ''
      );

      setImage(
        product.image_url ||
        product.location_text ||
        ''
      );

      setStock(
        product.stock !== undefined
          ? String(product.stock)
          : '0'
      );
    } else {
      setName('');
      setPrice('');
      setImage('');
      setStock('');
    }
  }, [product]);

  const saveProduct = async () => {
    if (saving) return;

    if (!name.trim()) {
      Alert.alert(
        'Error',
        'Missing name'
      );
      return;
    }

    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token')
        : null;

    if (!token) {
      Alert.alert(
        'Error',
        'Please login first'
      );
      return;
    }

    const stockNumber =
      Number(stock);

    if (
      !Number.isInteger(stockNumber) ||
      stockNumber < 0
    ) {
      Alert.alert(
        'Error',
        'Stock must be a whole number greater than or equal to 0'
      );
      return;
    }

    const priceNumber =
      Number(price);

    if (
      Number.isNaN(priceNumber) ||
      price.trim() === ''
    ) {
      Alert.alert(
        'Error',
        'Price is required'
      );
      return;
    }

    setSaving(true);

    try {
      const url = isEditMode
        ? `${API_URL}/api/products/${product?.id}`
        : `${API_URL}/api/products`;

      const response =
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            Name: name.trim(),
            Price: priceNumber,
            Image: image.trim(),
            stock: stockNumber,
          }),
        });

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

        Alert.alert(
          'Session expired',
          'Please login again',
          [
            {
              text: 'OK',
              onPress: () => {
                window.location.href =
                  '/login';
              },
            },
          ]
        );

        setSaving(false);
        return;
      }

      if (response.status === 403) {
        Alert.alert(
          'Access denied',
          'Admin access required'
        );

        setSaving(false);
        return;
      }

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message ||
            'Failed to save product'
        );

        setSaving(false);
        return;
      }

      Alert.alert(
        'Success',
        isEditMode
          ? 'Product updated successfully'
          : 'Product added successfully',
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error) {
      console.log(
        'SAVE PRODUCT ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Cannot connect to server'
      );

      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEditMode
          ? 'Edit Product'
          : 'Add Product'}
      </Text>

      <Text style={styles.label}>
        Name
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Product name"
        editable={!saving}
      />

      <Text style={styles.label}>
        Price
      </Text>

      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
        editable={!saving}
      />

      <Text style={styles.label}>
        Image
      </Text>

      <TextInput
        style={styles.input}
        value={image}
        onChangeText={setImage}
        placeholder="Image name"
        editable={!saving}
      />

      <Text style={styles.label}>
        Stock
      </Text>

      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        placeholder="จำนวนสินค้า"
        keyboardType="numeric"
        editable={!saving}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        onPress={saveProduct}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving
            ? 'Saving...'
            : isEditMode
            ? 'Update Product'
            : 'Add Product'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={saving}
      >
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
  },

  saveButton: {
    backgroundColor: '#A855F7',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },

  cancelText: {
    color: '#666666',
    fontSize: 16,
  },

  disabledButton: {
    opacity: 0.5,
  },
});