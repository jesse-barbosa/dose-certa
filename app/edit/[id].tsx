import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '../../components/Button';
import { useRouter, useSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import Header from '../../components/Header';

export default function EditMedicine() {
  const router = useRouter();
  const { id } = useSearchParams();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('medicines').select('*').eq('id', id).single();
      if (data) {
        setName(data.name);
        setDosage(data.dosage);
      }
    })();
  }, [id]);

  const handleEdit = async () => {
    if (!name || !dosage) return Alert.alert('Erro', 'Preencha todos os campos');

    const { error } = await supabase.from('medicines').update({ name, dosage }).eq('id', id);
    if (error) return Alert.alert('Erro', error.message);

    Alert.alert('Sucesso', 'Medicamento atualizado!');
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Header title="Editar Medicamento" />
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome do medicamento" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Dosagem" value={dosage} onChangeText={setDosage} />
        <Button onPress={handleEdit}>Salvar</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f3f4f6' },
  form: { padding:16 },
  input: { backgroundColor:'#fff', padding:12, marginBottom:16, borderRadius:12 },
});