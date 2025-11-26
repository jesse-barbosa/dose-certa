import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CardMedicine from '../components/CardMedicine';
import Button from '../components/Button';
import Footer from '../components/Footer';
import { supabase } from '../services/supabase';

export default function Home() {
  const navigation = useNavigation();
  const userId = 'demo-user-id';
  
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['medicines', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading && <Text>Carregando...</Text>}

        {!isLoading && data?.length === 0 && (
          <View style={{ marginTop: 50, alignItems:'center' }}>
            <Text style={{ color:'#6b7280', fontSize:16, marginBottom:16 }}>
              Não há medicamentos para tomar!
            </Text>
            <Button onPress={() => router.push('/add')}>Adicionar meu primeiro medicamento</Button>
          </View>
        )}

        {data?.map((med: any) => (
          <CardMedicine
            key={med.id}
            name={med.name}
            dosage={med.dosage}
            onTake={() => alert(`Tomou ${med.name}`)}
            onEdit={() => router.push(`/edit/${med.id}`)}
          />
        ))}
      </ScrollView>
      <Footer onNavigate={(screen) => navigation.navigate(screen as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scroll: {
    padding: 16,
    paddingBottom: 80, // espaço para Footer
  },
});