import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Footer() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
        <Ionicons name="home" size={24} color="#4f46e5" />
        <Text style={styles.text}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/add')}>
        <MaterialIcons name="medication" size={24} color="#4f46e5" />
        <Text style={styles.text}>Medicamentos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/profile')}>
        <FontAwesome5 name="cog" size={24} color="#4f46e5" />
        <Text style={styles.text}>Config</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  button: { alignItems: 'center' },
  text: { fontSize: 12, fontWeight: '600', color: '#4f46e5', marginTop: 4 },
});