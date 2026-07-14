import { Image, StyleSheet, Text, View } from 'react-native';

export default function Products() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>

      <View style={styles.card}>
  <Image
     source={require('../../assets/images/i15.jpg')}
  style={styles.image}
  />

  <Text style={styles.name}>🍎 iPhone 15</Text>
  <Text>Price: 35,900 บาท</Text>
</View>

      <View style={styles.card}>
  <Image
    source={require('../../assets/images/mc air.jpg')}
    style={styles.image}
  />

  <Text style={styles.name}>💻 MacBook Air</Text>
  <Text>Price: 39,900 บาท</Text>
</View>

      <View style={styles.card}>
  <Image
    source={require('../../assets/images/ipad air.jpg')}
    style={styles.image}
  />

  <Text style={styles.name}>📱 iPad Air</Text>
  <Text>Price: 24,900 บาท</Text>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  image: {
  width: 120,
  height: 120,
  alignSelf: 'center',
  marginBottom: 10,
},

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});