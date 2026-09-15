import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import AddProductScreen, {
  EditableProduct,
} from './add';

export default function EditProductScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
      name?: string;
      price?: string;
      image?: string;
      stock?: string;
    }>();

  const product: EditableProduct = {
    id: params.id || '',
    name: params.name || '',
    price: Number(params.price || 0),
    category: 'Product',
    stock: Number(params.stock || 0),
    location_text: params.image || '',
    badge_status:
      Number(params.stock || 0) > 0
        ? 'Available'
        : 'Out of stock',
    image_url: params.image || '',
  };

  return (
    <AddProductScreen
      product={product}
      existingCategories={['Product']}
      onSuccess={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}