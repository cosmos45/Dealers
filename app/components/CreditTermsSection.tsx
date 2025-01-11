import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';

interface CreditTermsSectionProps {
  onSelectTerm: (days: number) => void;
  selectedTerm?: number;
}

export default function CreditTermsSection({ onSelectTerm, selectedTerm }: CreditTermsSectionProps) {
  const terms = [15, 30, 45, 60];

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Credit Terms</Text>
      <View style={styles.termsContainer}>
        {terms.map((days) => (
          <Button
            key={days}
            mode={selectedTerm === days ? "contained" : "outlined"}
            onPress={() => onSelectTerm(days)}
            style={[
              styles.termButton,
              selectedTerm === days && styles.selectedTerm
            ]}
            labelStyle={{
              color: selectedTerm === days ? '#FFFFFF' : '#007BFF',
              fontSize: 16,
              fontWeight: '500'
            }}
          >
            {days} Days
          </Button>
        ))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  termButton: {
    flex: 1,
    minWidth: '45%',
    borderColor: '#007BFF',
    borderWidth: 1.5,
  },
  selectedTerm: {
    backgroundColor: '#007BFF',
  }
});
